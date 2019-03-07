import * as tl from "azure-pipelines-task-lib";
import * as msrestazure from "ms-rest-azure";
import * as azrm from "azure-arm-resource";
import * as sentry from "@sentry/node";
import * as xreg from "xregexp";
import { ServiceClientCredentials } from "ms-rest";

let _rootdir = __dirname || process.cwd();
sentry.init({
    dsn: "https://28b58a21d5b74a0bba0e56d937dd56f9@sentry.io/1285555",
    release: "utkarsh-utility-tasks@#{Release.ReleaseName}#",
    environment: "#{Release.EnvironmentName}#",
    integrations: [new sentry.Integrations.RewriteFrames({
        root: _rootdir
    })]
});
sentry.configureScope((scope) => {
    scope.setTag("task", "azure-lock-unlock");
    scope.setTag("os", tl.osType());
});

async function main() {
    try {
        let connectedService = tl.getInput("ConnectedServiceName", true);
        let subscriptionId = tl.getEndpointDataParameter(connectedService, "subscriptionId", true);

        let credentials = getCredentials(connectedService);
        let rmClient = new azrm.ResourceManagementClient.ResourceManagementClient(credentials, subscriptionId);
        let resourceGroupName = tl.getInput("resourceGroupName", false);

        let tagsList = tl.getInput("tagsList", true);
        let action = tl.getInput("action", true);

        console.info(`Getting information about resource group '${resourceGroupName}'`);
        let resourceGroup = await rmClient.resourceGroups.get(resourceGroupName);

        let newTags = {};
        xreg.forEach(tagsList, xreg("^\\s*(?<key>.*?)\\s*(:\\s*(?<value>.*))?$", "gm"), async match => {
            let tagKey = (<any>match).key;
            let tagValue = (<any>match).value;
            tl.debug(`Found tag '${tagKey}:${tagValue}'`);
            newTags[tagKey] = tagValue;
        });

        switch (action) {
            case "Append": {
                console.info(`Appending tags for resource group '${resourceGroup.name}'`);
                await appendTags(newTags, resourceGroup, rmClient);
                console.info("Done");
                break;
            }
            case "Replace": {
                console.info(`Replacing tags for resource group '${resourceGroup.name}'`);
                await replaceTags(newTags, resourceGroup, rmClient);
                console.info("Done");
                break;
            }
            case "Clear": {
                console.info(`Clearing tags for resource group '${resourceGroup.name}'`);
                await clearAllTags(resourceGroup, rmClient);
                console.info("Done");
            }
        }
        console.info("All done");
    }
    catch (error) {
        sentry.captureException(error);
        console.error("Error occurred", error);
        tl.error(error);
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

function getCredentials(connectedService: string): ServiceClientCredentials {

    let authScheme = tl.getEndpointAuthorizationScheme(connectedService, true);
    let subscriptionId = tl.getEndpointDataParameter(connectedService, "subscriptionId", true);
    let clientId = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalid", true);
    let clientSecret = tl.getEndpointAuthorizationParameter(connectedService, "serviceprincipalkey", true);
    let tenantId: string = tl.getEndpointAuthorizationParameter(connectedService, "tenantId", false);

    if (authScheme === "ManagedServiceIdentity") {
        console.log("Logging in using MSIVmTokenCredentials");
        return new msrestazure.MSIVmTokenCredentials();
    }
    console.log(`Logging in using ApplicationTokenCredentials, authScheme is '${authScheme}'`);

    let credentials = new msrestazure.ApplicationTokenCredentials(clientId, tenantId, clientSecret);

    return credentials;
}

async function appendTags(newTags: any, resourceGroup: azrm.ResourceManagementClient.ResourceManagementModels.ResourceGroup, rmClient: azrm.ResourceManagementClient.ResourceManagementClient) {
    let existingTags = resourceGroup.tags || {};
    let updatedTags = { ...existingTags, ...newTags };
    let model: azrm.ResourceModels.ResourceGroup = {
        tags: updatedTags,
        location: resourceGroup.location,
    };
    await rmClient.resourceGroups.createOrUpdate(resourceGroup.name, model);
}

async function replaceTags(newTags: {}, resourceGroup: azrm.ResourceManagementClient.ResourceManagementModels.ResourceGroup, rmClient: azrm.ResourceManagementClient.ResourceManagementClient) {
    let model: azrm.ResourceModels.ResourceGroup = {
        tags: newTags,
        location: resourceGroup.location,
    };
    await rmClient.resourceGroups.createOrUpdate(resourceGroup.name, model);
}

async function clearAllTags(resourceGroup: azrm.ResourceManagementClient.ResourceManagementModels.ResourceGroup, rmClient: azrm.ResourceManagementClient.ResourceManagementClient) {
    let model: azrm.ResourceModels.ResourceGroup = {
        tags: {},
        location: resourceGroup.location,
    };
    await rmClient.resourceGroups.createOrUpdate(resourceGroup.name, model);
}

main()
    .then(() => { })
    .catch(reason => {
        sentry.captureException(reason);
        console.error(reason);
    });