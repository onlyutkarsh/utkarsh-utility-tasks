import * as tl from "vsts-task-lib";
import * as generator from "generate-password";

async function main() {
    try {
        // get the task vars
        let namesInput = tl.getInput("names");
        let separators = [",", ";", "|", "\n", "\r\n"];
        let names = namesInput.split(new RegExp("[" + separators.join("") + "]", "g"));
        let lengthInput = parseInt(tl.getInput("length"), 10);
        let length = isNaN(lengthInput) ? 12 : lengthInput;
        let useNumbers = tl.getBoolInput("useNumbers");
        let useSpecialChars = tl.getBoolInput("useSpecialChars");
        let exclude: string = tl.getInput("exclude") || "";

        let debugOutput = tl.getVariable("system.debug") || "false";
        let isDebugOutput: boolean = debugOutput.toLowerCase() === "true";

        if (isDebugOutput) {
            // print what is supplied by the user
            tl.debug(`names: ${names}`);
            tl.debug(`length: ${length}`);
            tl.debug(`useNumbers: ${useNumbers}`);
            tl.debug(`useSpecialChars: ${useSpecialChars}`);
            tl.debug(`exclude: ${exclude}`);
            tl.debug(`debugOutput: ${debugOutput}`);
        }

        let passwordOptions: generator.Options = {
            excludeSimilarCharacters: true,
            length: length,
            numbers: useNumbers,
            symbols: useSpecialChars,
            exclude: exclude,
            strict: true
        };

        console.info("Generating secrets and setting secret variables");
        names.forEach(name => {
            let password = generator.generate(passwordOptions);
            tl.setVariable(name, password, true);
            tl.debug(`Generated secret for '${name}'`);
        });
    }
    catch (error) {
        console.error("Error occurred", error);
        tl.error(error);
        tl.setResult(tl.TaskResult.Failed, error);
    }
}

main()
    .then(() => console.info("All Done!"))
    .catch(reason => console.error(reason));
