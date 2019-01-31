import * as tl from "azure-pipelines-task-lib";
import * as sentry from "@sentry/node";
import * as del from "del";

sentry.init({
    dsn: "https://28b58a21d5b74a0bba0e56d937dd56f9@sentry.io/1285555",
});

sentry.configureScope((scope) => {
    scope.setTag("task", "clean-folder");
});

async function main() {
    try {
        let sourceDir = tl.getInput("rootDirectory", false) || tl.getVariable("System.DefaultWorkingDirectory");
        let globPattern = tl.getDelimitedInput("globPattern", "\r\n");

        console.info(`Deleting contents from '${sourceDir}' directory based on pattern '${globPattern}'`);
        del(globPattern, {
            cwd: sourceDir,
            root: sourceDir
        }).then(paths => {
            console.log("Deleted files and folders:\n", paths.join("\n"));
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