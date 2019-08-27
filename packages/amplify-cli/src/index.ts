import Input from './domain/input';
import { getPluginPlatform, scan } from './plugin-manager';
import { getCommandLineInput, verifyInput } from './input-manager';
import { constructContext, persistContext } from './context-manager';
import { executeCommand } from './execution-manager';
import Context from './domain/context';
import * as path from 'path'; 

//entry from commandline
export async function run() : Promise<number> {
    try {
        let pluginPlatform = await getPluginPlatform();
        let input = getCommandLineInput(pluginPlatform);
        let verificationResult = verifyInput(pluginPlatform, input);

        if (!verificationResult.verified) {
            pluginPlatform = await scan();
            input = getCommandLineInput(pluginPlatform);
            verificationResult = verifyInput(pluginPlatform, input);
            if (!verificationResult.verified) {
                throw new Error(verificationResult.message);
            }
        }

        const context = constructContext(pluginPlatform, input);
        await executeCommand(context);
        persistContext(context);
        return 0;
    } catch (e) {
        //ToDo: add logging to the core, and log execution errors using the unified core logging.
        console.log(e);
        return 1;
    }
}

//entry from library call
export async function execute(input: Input) {
    try {
        let pluginPlatform = await getPluginPlatform();
        let verificationResult = verifyInput(pluginPlatform, input);

        if (!verificationResult.verified) {
            pluginPlatform = await scan();
            verificationResult = verifyInput(pluginPlatform, input);
            if (!verificationResult.verified) {
                throw new Error(verificationResult.message);
            }
        }

        const context = constructContext(pluginPlatform, input);
        await executeCommand(context);
        persistContext(context);
        return 0;
    } catch (e) {
        //ToDo: add logging to the core, and log execution errors using the unified core logging.
        console.log(e);
        return 1;
    }
}

export async function executeAmplifyCommand(context: Context) {
  let commandPath = path.normalize(path.join(__dirname, 'commands', context.input.command!));
  const commandModule = require(commandPath);
  await commandModule.run(context);
}

