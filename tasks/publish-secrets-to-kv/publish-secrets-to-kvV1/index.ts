import * as tl from "azure-pipelines-task-lib";
import * as msrestazure from "ms-rest-azure";
import * as keyvault from "azure-keyvault";
import * as sentry from "@sentry/node";
import * as xreg from "xregexp";

sentry.init({ dsn: "https://28b58a21d5b74a0bba0e56d937dd56f9@sentry.io/1285555" });
sentry.configureScope((scope) => {
    scope.setTag("task", "publish-secrets-to-kv");
});
async function main() {
    try {
        // get the task vars
        let connectedService = tl.getInput("ConnectedServiceName", true);
        let subscriptionId = tl.getEndpointDataParameter(connectedService, "subscriptionId", true);
        let clientId = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalid", true);
        let clientSecret = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalkey", true);
        let azureKeyVaultDnsSuffix = tl.getEndpointDataParameter(connectedService, "AzureKeyVaultDnsSuffix", true);
        let tenantId: string = tl.getEndpointAuthorizationParameter(connectedService, "tenantId", false);
        let tags = tl.getInput("tags", false) || "";
        let contentType = tl.getInput("contentType", false) || "";

        let keyValueSeparator = ["="];
        let itemSeparator = ["\r", "\n", "\r\n"]; // \r, on older Macs, \n on UNIX+Linux and \r\n on Win

        // separate tags by newline first
        let tagsList = {};
        if (tags !== "") {
            let tagsArray = tags.split(new RegExp("[" + itemSeparator.join("") + "]", "g"));

            tagsArray.forEach(tagsPair => {
                let tagsGroup = tagsPair.split(new RegExp("[" + keyValueSeparator.join("") + "]", "g"));
                tagsList[tagsGroup[0]] = tagsGroup[1];
            });
        }

        let keyVaultName = tl.getInput("keyVaultName", true);
        let keyVaultUrl = `https://${keyVaultName}.${azureKeyVaultDnsSuffix}`;

        console.info(`Connecting to key vault '${keyVaultUrl}'`);
        let credentials = await msrestazure.loginWithServicePrincipalSecret(clientId, clientSecret, tenantId);
        let kvClient = new keyvault.KeyVaultClient(credentials);
        console.info("Done");

        let namesInput = tl.getInput(`secrets`);

        xreg.forEach(namesInput, xreg("^\\s*(?<key>.*?)\\s*(=\\s*(?<value>.*))?$", "gm"), async match => {
            let secretName = (<any>match).key;
            let secretValue = (<any>match).value;
            console.info(`Writing secret '${secretName}' to key vault`);
            await kvClient.setSecret(keyVaultUrl, secretName, secretValue, { tags: tagsList, contentType: contentType }, (err, secretBundle) => {
                if (err) {
                    tl.warning(`Error while writing '${secretName}'`);
                }
                else {
                    console.info(`Successfully set the secret for '${secretName}'`);
                }
            });
        });
        console.info("All done");
    }
    catch (error) {
        sentry.captureException(error);
        console.error("Error occurred", error);
        tl.error(error);
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

main()
    .then(() => { })
    .catch(reason => {
        sentry.captureException(reason);
        console.error(reason);
    });