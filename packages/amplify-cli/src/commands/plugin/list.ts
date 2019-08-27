import Context from '../../domain/context';
import PluginPlatform from '../../domain/plugin-platform';
import inquirer from '../../domain/inquirer-helper';
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
            await listPlugins(context, pluginPlatform);
            break;
        case excluded:
            await listExcluded(context, pluginPlatform);
            break;
        case generalInfo:
            await listGeneralInfo(context, pluginPlatform);
            break;
        case configuration:
            await listConfiguration(context, pluginPlatform);
            break;
        case all:
            listAll(context, pluginPlatform);
            break;
        default:
            listPlugins(context, pluginPlatform);
            break;
    }
}

function listGeneralInfo(context: Context, pluginPlatform: PluginPlatform) {
    const displayObject = {
        ...pluginPlatform
    }
    delete displayObject.plugins;
    delete displayObject.excluded;

    context.print.info(util.inspect(displayObject, undefined, Infinity));
}

function listAll(context: Context, pluginPlatform: PluginPlatform) {
    context.print.info(util.inspect(pluginPlatform, undefined, Infinity));
}

async function listPlugins(context: Context, pluginPlatform: PluginPlatform) {
    listPluginCollection(context, pluginPlatform.plugins);
}

async function listExcluded(context: Context, pluginPlatform: PluginPlatform) {
    listPluginCollection(context, pluginPlatform.excluded);
}

async function listPluginCollection(context: Context, collection: PluginCollection) {
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
            context.print.info(util.inspect(collection, undefined, Infinity));
        } else {
            context.print.info(util.inspect(collection[toList], undefined, Infinity));
        }
    } else {
        context.print.info('The collection is empty');
    }
}