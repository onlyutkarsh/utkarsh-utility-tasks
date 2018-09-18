import * as tl from "vsts-task-lib";
import * as msrestazure from "ms-rest-azure";
import * as keyvault from "azure-keyvault";

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

        let namesInput = tl.getInput("secrets");
        let names = namesInput.split(new RegExp("[" + itemSeparator.join("") + "]", "g"));
        names.forEach(async name => {
            let secretKVPair = name.split(new RegExp("[" + keyValueSeparator.join("") + "]", "g"));
            let secretName = secretKVPair[0];
            let secretValue = secretKVPair[1];
            console.info(`Writing secret '${secretName}' to key vault`);
            await kvClient.setSecret(keyVaultUrl, secretName, secretValue, { tags: tagsList, contentType: "Added via Utkarsh Utilities Extension" }, (err, secretBundle) => {
                if (err) {
                    console.info(`Error while writing '${secretName}'`);
                    throw err;
                }
                else {
                    console.info(`Successfully set the secret for '${secretName}'`);
                }
            });
        });

        console.log();
    }
    catch (error) {
        console.error("Error occurred", error);
        tl.error(error);
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

main()
    .then(() => { })
    .catch(reason => console.error(reason));