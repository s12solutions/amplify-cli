import Context from './domain/context';
import Constant from './domain/constants'; 
import { getPluginsWithNameAndCommand, getPluginsWithEventHandler } from './plugin-manager';
import PluginInfo from './domain/plugin-info';
import inquirer from './domain/inquirer-helper';
import { 
    AmplifyEvent, 
    AmplifyEventArgs,
    AmplifyPreInitEventData,
    AmplifyPostInitEventData,
    AmplifyPrePushEventData,
    AmplifyPostPushEventData
} from './domain/amplify-event';

export async function executeCommand(context: Context) {
    const pluginCandidates = getPluginsWithNameAndCommand(context.pluginPlatform,
                                        context.input.plugin!, context.input.command!);

    if (pluginCandidates.length === 1) {
        await executePluginModuleCommand(context, pluginCandidates[0]);
    } else {
        const answer = await inquirer.prompt({
            type: 'list',
            name: 'section',
            message: 'Select the module to execute',
            choices: pluginCandidates.map((plugin) => {
                return {
                    name: plugin.packageName + '@' + plugin.packageVersion,
                    value: plugin,
                    short: plugin.packageName + '@' + plugin.packageVersion,
                };
            })
        });
        const pluginModule =  answer.section as PluginInfo;
        await executePluginModuleCommand(context, pluginModule);
    }
}

async function executePluginModuleCommand(context: Context, plugin: PluginInfo) {
    const { commands, commandAliases } = plugin.manifest;
    if (!commands!.includes(context.input.command!)) {
        context.input.command = commandAliases![context.input.command!];
    }
    const pluginModule = require(plugin.packageLocation);

    await raisePreEvent(context); 
    await pluginModule.executeAmplifyCommand(context);
    await raisePostEvent(context); 
}

async function raisePreEvent(context: Context){
    if(context.input.plugin === Constant.CORE){
        if(context.input.command === 'init'){
            await raisePreInitEvent(context); 
        }else if(context.input.command === 'push'){
            await raisePrePushEvent(context); 
        }
    }
}

async function raisePreInitEvent(context: Context){
    await raiseEvent(context, new AmplifyEventArgs(
        AmplifyEvent.PreInit,
        new AmplifyPreInitEventData()
    )); 
}

async function raisePrePushEvent(context: Context){
    await raiseEvent(context, new AmplifyEventArgs(
        AmplifyEvent.PrePush,
        new AmplifyPrePushEventData()
    )); 
}

async function raisePostEvent(context: Context){ 
    if(context.input.plugin === Constant.CORE){
        if(context.input.command === 'init'){
            await raisePostInitEvent(context); 
        }else if(context.input.command === 'push'){
            await raisePostPushEvent(context); 
        }
    }
}

async function raisePostInitEvent(context: Context){
    await raiseEvent(context, new AmplifyEventArgs(
        AmplifyEvent.PostInit,
        new AmplifyPostPushEventData()
    )); 
}

async function raisePostPushEvent(context: Context){ 
    await raiseEvent(context, new AmplifyEventArgs(
        AmplifyEvent.PostPush,
        new AmplifyPostInitEventData()
    )); 
}

export async function raiseEvent(context: Context, args: AmplifyEventArgs){
    const plugins = getPluginsWithEventHandler(context.pluginPlatform, args.event);
    if(plugins.length > 0){
        const sequential = require('promise-sequential'); 
        const eventHandlers = plugins.map((plugin)=>{
            const pluginModule = require(plugin.packageLocation);
            return async () => {
                await pluginModule.handleAmplifyEvent(context, args);
            };
        });
        await sequential(eventHandlers); 
    }
}