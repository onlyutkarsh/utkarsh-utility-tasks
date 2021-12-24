import * as yargs from "yargs";
import * as chalks from "chalk";
import * as glob from "glob";
import * as path from "path";
import * as fs from "fs-extra";
let chalk = chalks.default;
let taskids = require("./taskids.json");
let argv = yargs.option("beta", {
    alias: "b",
    type: "boolean",
    default: false,
    describe: "Use beta version of the task",
}).argv;

taskids.tasks.forEach((task) => {
    let currentDir = path.resolve(process.cwd(), task.path);
    let files = glob.sync("**/*/task.json", { cwd: currentDir });
    files.forEach((file) => {
        let taskFile = path.resolve(currentDir, file);
        console.log(`Processing ${chalk.green(taskFile)}`);
        let taskJson = require(path.relative(__dirname, taskFile));
        let tempTaskId = taskJson.id;
        let tempFriendlyName = taskJson.friendlyName;
        let newname = taskJson.friendlyName.replace(/\(beta\)/g, "").trim();
        if (argv) {
            console.log(chalk.yellow("Applying task id for BETA testing"));
            taskJson.id = task.betaId;
            taskJson.friendlyName = newname + " (beta)";
        } else {
            console.log(chalk.yellow("Applying task id for PROD"));
            taskJson.id = task.id;
            taskJson.friendlyName = newname;
        }
        console.log(
            `Changed task id from ${chalk.magenta(tempTaskId)} to ${chalk.blue(
                taskJson.id
            )}`
        );
        console.log(
            `Changed friendlyName from ${chalk.magenta(
                tempFriendlyName
            )} to ${chalk.blue(taskJson.friendlyName)}`
        );
        fs.writeJsonSync(taskFile, taskJson, { spaces: "\t" });
        console.log(chalk.green("=========="));
    });
});
