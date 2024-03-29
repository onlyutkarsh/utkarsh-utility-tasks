import * as tl from "azure-pipelines-task-lib";
import * as msrestazure from "ms-rest-azure";
import * as keyvault from "@azure/keyvault-secrets";
import * as identity from "@azure/identity";
import * as sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import * as xreg from "xregexp";
import { ServiceClientCredentials } from "ms-rest";

let _rootdir = __dirname || process.cwd();
sentry.init({
    dsn: "https://28b58a21d5b74a0bba0e56d937dd56f9@sentry.io/1285555",
    release: "utkarsh-utility-tasks@#{Release.ReleaseName}#",
    environment: "#{Release.EnvironmentName}#",
    integrations: [
        new RewriteFrames({
            root: _rootdir,
        }),
    ],
});
sentry.configureScope((scope) => {
    scope.setTag("task", "publish-secrets-to-kv");
    scope.setTag("os", tl.getPlatform());
    scope.setTag("org", tl.getVariable("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"));
});

async function main() {
    try {
        // get the task vars
        let connectedService: string = tl.getInput(
            "ConnectedServiceName",
            true
        );
        let azureKeyVaultDnsSuffix = tl.getEndpointDataParameter(
            connectedService,
            "AzureKeyVaultDnsSuffix",
            true
        );
        let credentials = getCredentials(connectedService);

        let tags = tl.getInput("tags", false) || "";
        let contentType = tl.getInput("contentType", false) || "";

        let keyValueSeparator = ["="];
        let itemSeparator = ["\r", "\n", "\r\n"]; // \r, on older Macs, \n on UNIX+Linux and \r\n on Win

        // separate tags by newline first
        let tagsList = {};
        if (tags !== "") {
            let tagsArray = tags.split(
                new RegExp("[" + itemSeparator.join("") + "]", "g")
            );

            tagsArray.forEach((tagsPair) => {
                let tagsGroup = tagsPair.split(
                    new RegExp("[" + keyValueSeparator.join("") + "]", "g")
                );
                tagsList[tagsGroup[0]] = tagsGroup[1];
            });
        }

        let keyVaultName = tl.getInput("keyVaultName", true);
        let keyVaultUrl = `https://${keyVaultName}.${azureKeyVaultDnsSuffix}`;

        console.info(`Connecting to key vault '${keyVaultUrl}'`);
        let kvClient = new keyvault.SecretClient(keyVaultUrl, credentials);
        console.info("Done");

        let namesInput = tl.getInput(`secrets`);

        let promises: Array<Promise<keyvault.KeyVaultSecret>> = [];
        xreg.forEach(
            namesInput,
            xreg("^\\s*(?<key>.*?)\\s*(=\\s*(?<value>.*))?$", "gm"),
            (match) => {
                let secretName = (<any>match).key;
                let secretValue = (<any>match).value;
                console.info(`Writing secret '${secretName}' to key vault`);
                var opts: keyvault.SetSecretOptions = {
                    contentType: contentType,
                    tags: tagsList,
                };

                promises.push(
                    kvClient.setSecret(secretName, secretValue, opts)
                );
            }
        );
        let results = await Promise.all(promises);
        console.info("All done");
    } catch (error) {
        console.error("Error occurred", error);
        sentry.captureException(error);
        tl.error(error);
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

function getCredentials(connectedService: string): identity.TokenCredential {
    let authScheme = tl.getEndpointAuthorizationScheme(connectedService, true);
    let subscriptionId = tl.getEndpointDataParameter(
        connectedService,
        "subscriptionId",
        true
    );
    let clientId = tl.getEndpointAuthorizationParameter(
        connectedService,
        "serviceprincipalid",
        true
    );
    let clientSecret = tl.getEndpointAuthorizationParameter(
        connectedService,
        "serviceprincipalkey",
        true
    );
    let tenantId: string = tl.getEndpointAuthorizationParameter(
        connectedService,
        "tenantId",
        false
    );

    if (authScheme === "ManagedServiceIdentity") {
        console.log("Logging in using MSIVmTokenCredentials");
        return new identity.ManagedIdentityCredential();
    }
    console.log(
        `Logging in using ApplicationTokenCredentials, authScheme is '${authScheme}'`
    );

    let credentials = new identity.ClientSecretCredential(
        clientId,
        tenantId,
        clientSecret
    );

    return credentials;
}

main()
    .then(() => {})
    .catch((reason) => {
        sentry.captureException(reason);
        console.error(reason);
    });
