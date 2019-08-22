import fs from 'fs-extra';
import util from 'util';

import Context from '../../domain/context';
import PluginPlatform from '../../domain/plugin-platform';
import inquirer from '../../domain/inquirer-helper';
import Constants from '../../domain/constants';
import { writePluginsJsonFile } from '../../plugin-helpers/access-plugins-file';

export default async function configure(context: Context): Promise<PluginPlatform> {
    const { pluginPlatform } = context;
    const pluginDirectories = 'plugin directories';
    const pluginPrefixes = 'plugin prefixes';
    const maxScanIntervalInSeconds = 'max scan interval in seconds';
    const exit = 'exit';

    const options = [
        pluginDirectories,
        pluginPrefixes,
        maxScanIntervalInSeconds,
        exit
    ];
    let answer = {
        selection: exit
    };

    do {
        answer = await inquirer.prompt({
            type: 'list',
            name: 'selection',
            message: 'Select section to configure',
            choices: options
        });

        switch (answer.selection) {
            case pluginDirectories:
                await configurePluginDirectories(pluginPlatform);
                break;
            case pluginPrefixes:
                await configurePrefixes(pluginPlatform);
                break;
            case maxScanIntervalInSeconds:
                await configureScanInterval(pluginPlatform);
                break;
        }
    } while (answer.selection !== exit);

    writePluginsJsonFile(pluginPlatform);
    
    return Promise.resolve(pluginPlatform);
}

async function configurePluginDirectories(pluginPlatform: PluginPlatform) {
    const addNew = 'add new';

    const optionsSet = new Set<string>([
        Constants.ParentDirectory,
        Constants.LocalNodeModules,
        Constants.GlobalNodeModules,
    ]);
    pluginPlatform.pluginDirectories.every((item) => {
        optionsSet.add(item);
    });

    const options = Array.from(optionsSet);
    options.push(addNew);

    const selectionAnswer = await inquirer.prompt({
        type: 'checkbox',
        name: 'selections',
        message: 'Select the directories for plugin scan',
        choices: options,
        default: pluginPlatform.pluginDirectories
    });

    if (selectionAnswer.selections.includes(addNew)) {
        const addNewAnswer = await inquirer.prompt({
            type: 'input',
            name: 'newScanDirectory',
            message: 'Enter the full path of the plugin scan directory you want to add',
            validate: (input : string) => {
                if (!fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
                    return 'Must enter a valid full path of a directory';
                }
                return true;
            }
        })

        selectionAnswer.selections = selectionAnswer.selections.map((item: string) => {
            if (item === addNew) {
                return addNewAnswer.newScanDirectory.trim();
            }
            return item;
        })
    }

    pluginPlatform.pluginDirectories = selectionAnswer.selections;
    console.log(pluginPlatform.pluginDirectories);
}

async function configurePrefixes(pluginPlatform: PluginPlatform) {
    console.log(`The Amplify CLI platform uses the ${Constants.AmplifyPrefix} \
    package name prefix when scanning for plugins.`);
    console.log('You can add or remove custom prefixes.')

    const addNew = 'add new';

    const optionsSet = new Set<string>([
        Constants.AmplifyPrefix
    ]);
    pluginPlatform.pluginPrefixes.every((item) => {
        optionsSet.add(item);
    });

    const options = Array.from(optionsSet);
    options.push(addNew);

    let selectionAnswer = await inquirer.prompt({
        type: 'checkbox',
        name: 'selections',
        message: 'Select the plugin package name prefix for plugin scan',
        choices: options,
        default: pluginPlatform.pluginPrefixes,
        transform: (input: Array<string>) => {
            if (!input.includes(Constants.AmplifyPrefix)) {
                input.unshift(Constants.AmplifyPrefix);
            }
        }
    });

    if (selectionAnswer.selections.includes(addNew)) {
        const addNewAnswer = await inquirer.prompt({
            type: 'input',
            name: 'newPluginPrefix',
            message: 'Enter the plugin package name prefix'
        })

        selectionAnswer.selections = selectionAnswer.selections.map((item: string) => {
            if (item === addNew) {
                return addNewAnswer.newPluginPrefix.trim();
            }
            return item;
        })
    }

    pluginPlatform.pluginPrefixes = selectionAnswer.selections;
    console.log(pluginPlatform.pluginPrefixes);
}

async function configureScanInterval(pluginPlatform: PluginPlatform) {
    const answer = await inquirer.prompt({
        type: 'input',
        name: 'interval',
        message: 'Enter the max interval in seconds for plugin scans',
        default: pluginPlatform.maxScanIntervalInSeconds,
        validate: (input: string) => {
            if (isNaN(Number(input))) {
                return 'must enter nubmer';
            }
            return true;
        }
    });
    pluginPlatform.maxScanIntervalInSeconds = parseInt(answer.interval);
}

export async function listConfiguration(pluginPlatform: PluginPlatform) {
    const pluginDirectories = 'plugin directories';
    const pluginPrefixes = 'plugin prefixes';
    const maxScanIntervalInSeconds = 'max scan interval in seconds';
    const all = 'all';

    const options = [
        pluginDirectories,
        pluginPrefixes,
        maxScanIntervalInSeconds,
        all
    ];

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'selection',
        message: 'Select the section to list',
        choices: options
    });

    switch (answer.selection) {
        case pluginDirectories:
            console.log(pluginPlatform.pluginDirectories);
            break;
        case pluginPrefixes:
            console.log(pluginPlatform.pluginPrefixes);
            break;
        case maxScanIntervalInSeconds:
            console.log(pluginPlatform.maxScanIntervalInSeconds);
            break;
        case all:
            listAllConfigurations(pluginPlatform);
            break;
        default:
            listAllConfigurations(pluginPlatform);
            break;
    }
}

function listAllConfigurations(pluginPlatform: PluginPlatform) {
    const displayObject = {
        ...pluginPlatform
    }
    delete displayObject.userAddedLocations;
    delete displayObject.lastScanTime;
    delete displayObject.plugins;
    delete displayObject.excluded;

    console.log(util.inspect(displayObject, undefined, Infinity));
}