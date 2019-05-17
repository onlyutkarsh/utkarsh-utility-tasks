import * as tl from "azure-pipelines-task-lib";
import * as msrestazure from "ms-rest-azure";
import * as azrm from "azure-arm-resource";
import * as sentry from "@sentry/node";
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
    scope.setUser({
        "org": tl.getVariable("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI")
    });
});

async function main() {
    try {
        let connectedService = tl.getInput("ConnectedServiceName", true);
        let subscriptionId = tl.getEndpointDataParameter(connectedService, "subscriptionId", true);

        let credentials = getCredentials(connectedService);
        let client = new azrm.ManagementLockClient.ManagementLockClient(credentials, subscriptionId);

        let applyTo = tl.getInput("applyTo", true);
        let resourceGroupName = tl.getInput("resourceGroupName", false);
        let action = tl.getInput("action", true);
        let lockType = tl.getInput("lockType", true);
        let lockName = tl.getInput("lockName", true);
        let notes = tl.getInput("notes", false);

        let debugOutput = tl.getVariable("system.debug") || "false";
        let isDebugOutput: boolean = debugOutput.toLowerCase() === "true";

        if (action === "Apply") {
            if (applyTo === "ResourceGroup") {
                console.info(`Applying '${lockType}' lock to resource group '${resourceGroupName}'`);
                await client.managementLocks.createOrUpdateAtResourceGroupLevel(resourceGroupName, lockName, <azrm.ManagementLockClient.ManagementLockModels.ManagementLockObject>{
                    level: lockType,
                    notes: notes,
                });
                console.info("Success");
            }
            else {
                console.info(`Applying '${lockType}' lock to subscription`);
                await client.managementLocks.createOrUpdateAtSubscriptionLevel(lockName, {
                    level: lockType,
                    notes: notes
                });
                console.info("Success");
            }
        }
        else {
            if (applyTo === "ResourceGroup") {
                console.info(`Removing '${lockType}' lock from resource group '${resourceGroupName}'`);
                await client.managementLocks.deleteAtResourceGroupLevel(resourceGroupName, lockName);
                console.info("Success");
            }
            else {
                console.info(`Removing '${lockType}' lock from subscription`);
                await client.managementLocks.deleteAtSubscriptionLevel(lockName);
                console.info("Success");
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

main()
    .then(() => { })
    .catch(reason => {
        sentry.captureException(reason);
        console.error(reason);
    });