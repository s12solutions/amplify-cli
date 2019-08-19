import Context from '../../domain/context';
import PluginPlatform from '../../domain/plugin-platform';
import inquirer, {InquirerOption, EXPAND } from '../../domain/inquirer-helper';
import { listConfiguration } from './configure';
import util from 'util';
import PluginCollection from '../../domain/plugin-collection';

export default async function list(context: Context) {
    const { pluginPlatform } = context;

    const plugins = 'plugins';
    const excluded = 'excluded';
    const generalInfo = 'general information';
    const configuration = 'configuration';
    const all = 'all';

    const options =
    [
        plugins,
        excluded,
        generalInfo,
        configuration,
        all
    ]

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'selection',
        message: 'Select the section to list',
        choices: options
    });

    switch (answer.selection) {
        case plugins:
            await listPlugins(pluginPlatform);
            break;
        case excluded:
            await listExcluded(pluginPlatform);
            break;
        case generalInfo:
            await listGeneralInfo(pluginPlatform);
            break;
        case configuration:
            await listConfiguration(pluginPlatform);
            break;
        case all:
            listAll(pluginPlatform);
            break;
        default:
            listPlugins(pluginPlatform);
            break;
    }
}

function listGeneralInfo(pluginPlatform: PluginPlatform) {
    const displayObject = {
        ...pluginPlatform
    }
    delete displayObject.plugins;
    delete displayObject.excluded;

    console.log(util.inspect(displayObject, undefined, Infinity));
}

function listAll(pluginPlatform: PluginPlatform) {
   console.log(util.inspect(pluginPlatform, undefined, Infinity));
}

async function listPlugins(pluginPlatform: PluginPlatform) {
    listPluginCollection(pluginPlatform.plugins);
}

async function listExcluded(pluginPlatform: PluginPlatform) {
    listPluginCollection(pluginPlatform.excluded);
}

async function listPluginCollection(collection: PluginCollection) {
    const all = 'all';
    const options = Object.keys(collection);
    if (options.length > 0) {
        let toList = options[0];
        if (options.length > 1) {
            options.push(all);
            const answer = await inquirer.prompt({
                type: 'list',
                name: 'selection',
                message: 'Select the name of the plugins to list',
                choices: options
            });
            toList = answer.selection;
        }

        if (toList === all) {
            console.log(util.inspect(collection, undefined, Infinity));
        } else {
            console.log(util.inspect(collection[toList], undefined, Infinity));
        }
    } else {
        console.log('The collection is empty');
    }
}