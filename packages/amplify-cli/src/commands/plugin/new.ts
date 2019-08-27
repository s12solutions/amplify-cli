import Context from '../../domain/context';
import Constant from '../../domain/constants';
import { newPlugin } from '../../plugin-manager';
import inquirer from '../../domain/inquirer-helper';
import { addUserPluginPackage, confirmAndScan } from '../../plugin-manager';
import path from 'path';

export default async function newplugin(context: Context) {
    const pluginDirPath = await newPlugin(context, process.cwd());
    if (pluginDirPath) {
        const isPluggedInLocalAmplifyCLI = await plugIntoLocalAmplifyCli(context, pluginDirPath);
        printInfo(context, pluginDirPath, isPluggedInLocalAmplifyCLI);
    }
}

async function plugIntoLocalAmplifyCli(context: Context, pluginDirPath: string): Promise<boolean> {
    let isPluggedIn = false;

    const yesFlag = context.input.options && context.input.options[Constant.YES];

    let ifPlugIntoLocalAmplifyCLI = true;

    if (!yesFlag) {
        context.print.info('The package can be plugged into the local Amplify CLI for testing during development.')
        const plugQuestion = {
            type: 'confirm',
            name: 'ifPlugIntoLocalAmplifyCLI',
            message: 'Do you want this package plugged into the local Amplify CLI',
            default: ifPlugIntoLocalAmplifyCLI
        };
        const answer = await inquirer.prompt(plugQuestion);
        ifPlugIntoLocalAmplifyCLI = answer.ifPlugIntoLocalAmplifyCLI;
    }

    if (ifPlugIntoLocalAmplifyCLI) {
        const addPluginResult = addUserPluginPackage(context.pluginPlatform, pluginDirPath);
        if (addPluginResult.isAdded) {
            isPluggedIn = true;
            await confirmAndScan(context.pluginPlatform);
        } else {
            context.print.error(addPluginResult.error);
        }
    }
    return isPluggedIn;
}

function printInfo(context: Context, pluginDirPath: string, isPluggedInLocalAmplifyCLI: boolean) {
    context.print.info('');
    context.print.info(`The plugin package ${path.basename(pluginDirPath)} has been setup for further developments.`);
    context.print.info('Next steps:');

    if (!isPluggedInLocalAmplifyCLI) {
        context.print.info(`$ amplify plugin add: add the plugin into the local Amplify CLI for testing.`);
    }
    context.print.info('');
    context.print.info('To add/remove command:');
    context.print.info('1. Add/remove the command name in the commands array in amplify-plugin.json.');
    context.print.info('2. Add/remove the command code file in the commands folder.');

    context.print.info('');
    context.print.info('To add/remove eventHandlers:');
    context.print.info('1. Add/remove the event name in the eventHandlers array in amplify-plugin.json.');
    context.print.info('2. Add/remove the event handler code file into the event-handler folder.');
    context.print.info('');
}