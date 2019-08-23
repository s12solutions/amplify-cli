import fs from 'fs-extra';
import util from 'util';
import os from 'os'; 
import Context from '../../domain/context';
import PluginPlatform from '../../domain/plugin-platform';
import inquirer from '../../domain/inquirer-helper';
import Constants from '../../domain/constants';
import { writePluginsJsonFile } from '../../plugin-helpers/access-plugins-file';
import { scan } from '../../plugin-manager';

export default async function configure(context: Context): Promise<PluginPlatform> {
    const { pluginPlatform } = context;
    const pluginDirectories = 'plugin directories';
    const pluginPrefixes = 'plugin prefixes';
    const maxScanIntervalInSeconds = 'max scan interval in seconds';
    const exit = 'save & exit';

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
                await configurePluginDirectories(context, pluginPlatform);
                break;
            case pluginPrefixes:
                await configurePrefixes(context, pluginPlatform);
                break;
            case maxScanIntervalInSeconds:
                await configureScanInterval(context, pluginPlatform);
                break;
        }
    } while (answer.selection !== exit);

    writePluginsJsonFile(pluginPlatform);

    return scan(pluginPlatform); 
}

async function configurePluginDirectories(context: Context, pluginPlatform: PluginPlatform) {
    context.print.info('Directories the Amplify CLI currently scan for plugins:')
    context.print.info(pluginPlatform.pluginDirectories);

    const ADD = 'add';
    const REMOVE = 'remove'; 
    const EXIT = 'exit'; 

    const actionAnswer = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Select the action on the directory list',
        choices: [ ADD, REMOVE, EXIT ]
    });

    if(actionAnswer.action === ADD){
        await addPluginDirectory(pluginPlatform); 
    }else if(actionAnswer.action === REMOVE){
        await removePluginDirectory(pluginPlatform);
    }
    
    context.print.info(pluginPlatform.pluginDirectories);
}

async function addPluginDirectory(pluginPlatform: PluginPlatform) {
    const ADDCUSTOMDIRECTORY = 'Add custom directory >'
    let options = [
        Constants.ParentDirectory,
        Constants.LocalNodeModules,
        Constants.GlobalNodeModules
    ];

    options = options.filter((item)=>{
        return !pluginPlatform.pluginDirectories.includes(item.toString()); 
    })

    let addCustomDirectory = false; 
    if(options.length > 0){
        options.push(ADDCUSTOMDIRECTORY); 
        const selectionAnswer = await inquirer.prompt({
            type: 'list',
            name: 'selection',
            message: 'Select the directory to add',
            choices: options
        });
        if(selectionAnswer.selection === ADDCUSTOMDIRECTORY){
            addCustomDirectory = true; 
        }else{
            pluginPlatform.pluginDirectories.push(selectionAnswer.selection); 
        }
    }else{
        addCustomDirectory = true; 
    }

    if(addCustomDirectory){
        const addNewAnswer = await inquirer.prompt({
            type: 'input',
            name: 'newScanDirectory',
            message: `Enter the full path of the plugin scan directory you want to add${os.EOL}`,
            validate: (input : string) => {
                if (!fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
                    return 'Must enter a valid full path of a directory';
                }
                return true;
            }
        }); 
        pluginPlatform.pluginDirectories.push(addNewAnswer.newScanDirectory.trim());
    }
}

async function removePluginDirectory(pluginPlatform: PluginPlatform) {
    const answer = await inquirer.prompt({
        type: 'checkbox',
        name: 'directoriesToRemove',
        message: 'Select the directories that Amplify CLI should NOT scan for plugins',
        choices: pluginPlatform.pluginDirectories
    }); 
    pluginPlatform.pluginDirectories = pluginPlatform.pluginDirectories.filter((dir)=>{
        return !answer.directoriesToRemove.includes(dir); 
    })
}

async function configurePrefixes(context: Context, pluginPlatform: PluginPlatform) {
    context.print.info('Package name prefixes the Amplify CLI currently uses when scanning for plugins:')
    context.print.info(pluginPlatform.pluginPrefixes);

    const ADD = 'add';
    const REMOVE = 'remove'; 
    const EXIT = 'exit'; 

    const actionAnswer = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Select the action on the prefix list',
        choices: [ ADD, REMOVE, EXIT ]
    });

    if(actionAnswer.action === ADD){
        await addPrefix(pluginPlatform); 
    }else if(actionAnswer.action === REMOVE){
        await removePrefixes(pluginPlatform);
        if(pluginPlatform.pluginPrefixes.length === 0){
           context.print.warning('You have removed all prefixes for plugin dir name matching!');
           context.print.info(`It is recommended to add the ${Constants.AmplifyPrefix} \
           prefix, so the Amplify CLI can function normally.`);
        }
    }
    
    context.print.info(pluginPlatform.pluginPrefixes);
}

async function addPrefix(pluginPlatform: PluginPlatform) {
    const ADDCUSTOMPREFIX = 'Add custom prefix >'
    let options = [
        Constants.AmplifyPrefix
    ];

    options = options.filter((item)=>{
        return !pluginPlatform.pluginPrefixes.includes(item.toString()); 
    })

    let addCustomPrefix = false; 
    if(options.length > 0){
        options.push(ADDCUSTOMPREFIX); 
        const selectionAnswer = await inquirer.prompt({
            type: 'list',
            name: 'selection',
            message: 'Select the prefix to add',
            choices: options
        });
        if(selectionAnswer.selection === ADDCUSTOMPREFIX){
            addCustomPrefix = true; 
        }else{
            pluginPlatform.pluginPrefixes.push(selectionAnswer.selection); 
        }
    }else{
        addCustomPrefix = true; 
    }

    if(addCustomPrefix){
        const addNewAnswer = await inquirer.prompt({
            type: 'input',
            name: 'newPrefix',
            message: 'Enter the new prefix',
            validate: (input : string) => {
                input = input.trim();
                if(input.length<2 || input.length > 10){
                    return 'The Length of prefix must be between 2 and 10.'
                }else if (!/^[a-zA-Z][a-zA-Z0-9-]$/.test(input)) {
                    return 'Prefix must start with letter, and contain only alphanumerics and dashes(-)';
                }
                return true;
            }
        }); 
        pluginPlatform.pluginPrefixes.push(addNewAnswer.newPrefix.trim());
    }
}

async function removePrefixes(pluginPlatform: PluginPlatform) {
    const answer = await inquirer.prompt({
        type: 'checkbox',
        name: 'prefixesToRemove',
        message: 'Select the prefixes to remove',
        choices: pluginPlatform.pluginPrefixes
    }); 
    pluginPlatform.pluginPrefixes = pluginPlatform.pluginPrefixes.filter((prefix)=>{
        return !answer.prefixesToRemove.includes(prefix); 
    })
}

async function configureScanInterval(context: Context, pluginPlatform: PluginPlatform) {
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

export async function listConfiguration(context: Context, pluginPlatform: PluginPlatform) {
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
            context.print.info(pluginPlatform.pluginDirectories);
            break;
        case pluginPrefixes:
            context.print.info(pluginPlatform.pluginPrefixes);
            break;
        case maxScanIntervalInSeconds:
            context.print.info(pluginPlatform.maxScanIntervalInSeconds);
            break;
        case all:
            listAllConfigurations(context, pluginPlatform);
            break;
        default:
            listAllConfigurations(context, pluginPlatform);
            break;
    }
}

function listAllConfigurations(context: Context, pluginPlatform: PluginPlatform) {
    const displayObject = {
        ...pluginPlatform
    }
    delete displayObject.userAddedLocations;
    delete displayObject.lastScanTime;
    delete displayObject.plugins;
    delete displayObject.excluded;

    context.print.info(util.inspect(displayObject, undefined, Infinity));
}