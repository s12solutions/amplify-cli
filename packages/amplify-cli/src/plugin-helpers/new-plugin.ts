import path from 'path';
import fs from 'fs-extra';
import inquirer from '../domain/inquirer-helper';
import Context from '../domain/context';
import Constant from '../domain/constants'
import { AmplifyEvent } from '../domain/amplify-event';
import readJsonFile from '../utils/readJsonFile';
import constants from '../domain/constants';

export default async function newPlugin(context: Context, pluginParentDirPath: string): Promise<string | undefined>  {
    const pluginName = await getPluginName(context, pluginParentDirPath);
    if (pluginName) {
        return await copyTemplateFiles(context, pluginParentDirPath, pluginName!);
    } else {
        return undefined;
    }
}

async function getPluginName(context: Context, pluginParentDirPath: string): Promise<string | undefined> {
    let pluginName = 'myAmplifyCliPlugin';
    const yesFlag = context.input.options && context.input.options[Constant.YES];

    console.log(context.input); 
    if (context.input.subCommands!.length > 1) { //subcommands: ['new', 'name']
        pluginName = context.input.subCommands![1];
    } else if (!yesFlag) {
        const pluginNameQuestion = {
            type: 'input',
            name: 'pluginName',
            message: 'What should be the name of the plugin:',
            default: pluginName
        };
        const answer = await inquirer.prompt(pluginNameQuestion);
        pluginName = answer.pluginName;
    }

    const pluginDirPath = path.join(pluginParentDirPath, pluginName);

    if (fs.existsSync(pluginDirPath) && !yesFlag) {
        context.print.error(`The directory ${pluginName} already exists`);
        const overwriteQuestion = {
            type: 'confirm',
            name: 'ifOverWrite',
            message: 'Do you want to overwrite it?',
            default: false
        };
        const answer = await inquirer.prompt(overwriteQuestion);
        if (answer.ifOverWrite) {
            return pluginName;
        } else {
            return undefined;
        }
    }
    return pluginName;
}

async function copyTemplateFiles(context: Context, pluginParentDirPath: string, pluginName: string) {
    const yesFlag = context.input.options && context.input.options[Constant.YES];

    const pluginDirPath = path.join(pluginParentDirPath, pluginName);
    fs.emptyDirSync(pluginDirPath);
    const srcDirPath = path.join(__dirname, '../../templates/new-plugin-package-js');
    fs.copySync(srcDirPath, pluginDirPath);

    const pluginTypes = [
        'category',
        'frontend',
        'provider',
        'util'
    ];
    let pluginType = pluginTypes[0];
    let eventHandlers = Object.keys(AmplifyEvent);

    if (!yesFlag) {
        const questions = [
            {
                type: 'list',
                name: 'pluginType',
                message: 'Specify the plugin type',
                choices: pluginTypes,
                default: pluginType
            },
            {
                type: 'checkbox',
                name: 'eventHandlers',
                message: 'What Amplify CLI events does the plugin subscribe to?',
                choices: eventHandlers,
                default: eventHandlers
            }
        ];
        let answers = await inquirer.prompt(questions);
        pluginType = answers.pluginType;
        eventHandlers = answers.eventHandlers;
    }

    updatePackageJson(pluginDirPath, pluginName);
    updateAmplifyPluginJson(pluginDirPath, pluginName, pluginType, eventHandlers);
    updateEventHandlersFolder(pluginDirPath, eventHandlers);

    return pluginDirPath;
}

function updatePackageJson(pluginDirPath: string, pluginName: string): void {
    const filePath = path.join(pluginDirPath, 'package.json');
    const packageJson = readJsonFile(filePath);
    packageJson.name = pluginName;
    const jsonString = JSON.stringify(packageJson, null, 4);
    fs.writeFileSync(filePath, jsonString, 'utf8');
}

function updateAmplifyPluginJson(
    pluginDirPath: string,
    pluginName: string,
    pluginType: string,
    eventHandlers: string[]
): void {
    const filePath = path.join(pluginDirPath, constants.MANIFEST_FILE_NAME);
    const amplifyPluginJson = readJsonFile(filePath);
    amplifyPluginJson.name = pluginName;
    amplifyPluginJson.type = pluginType;
    amplifyPluginJson.eventHandlers = eventHandlers;
    const jsonString = JSON.stringify(amplifyPluginJson, null, 4);
    fs.writeFileSync(filePath, jsonString, 'utf8');
}

function updateEventHandlersFolder(
    pluginDirPath: string,
    eventHandlers: string[]
): void {
    const dirPath = path.join(pluginDirPath, 'event-handlers');
    const fileNames = fs.readdirSync(dirPath);

    fileNames.forEach((fileName) => {
        const eventName = fileName.replace('handle-', '').split('.')[0];
        if (!eventHandlers.includes(eventName)) {
            fs.removeSync(path.join(dirPath, fileName));
        }
    })
}