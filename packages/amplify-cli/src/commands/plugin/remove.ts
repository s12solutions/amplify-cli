import Context from '../../domain/context';
import { removePluginPackage } from '../../plugin-manager';
import Constant from '../../domain/constants';
import inquirer, {InquirerOption, EXPAND } from '../../domain/inquirer-helper';

export default async function remove(context: Context) {
    const options = new Array<InquirerOption>();
    const {
        plugins
    } =  context.pluginPlatform;

    if (plugins && Object.keys(plugins).length > 0) {
        Object.keys(plugins).forEach(key => {
            if (key === Constant.CORE) {
                return;
            }

            if (plugins[key].length > 0) {
                const option = {
                    name: key + EXPAND,
                    value: plugins[key],
                    short: key + EXPAND,
                };
                if (plugins[key].length === 1) {
                    const pluginInfo = plugins[key][0];
                    option.name = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                    option.short = pluginInfo.packageName + '@' + pluginInfo.packageVersion;
                }
                options.push(option);
            }
        })
    }

    if (options.length > 0) {
        const answer = await inquirer.prompt({
            type: 'list',
            name: 'selection',
            message: 'Select the plugin package to remove',
            choices: options
        });
        await removePluginPackage(context.pluginPlatform, answer.selection[0]);
    } else {
        context.print.console.error('No plugins are found');
    }
}