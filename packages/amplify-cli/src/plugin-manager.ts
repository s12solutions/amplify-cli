import ora from 'ora'; 
import PluginPlatform from './domain/plugin-platform';
import PluginInfo from './domain/plugin-info';
import { readPluginsJsonFile, writePluginsJsonFile } from './plugin-helpers/access-plugins-file';
import scanPluginPlatform, { isUnderScanCoverage } from './plugin-helpers/scan-plugin-platform';
import verifyPlugin from './plugin-helpers/verify-plugin';
import newPlugin from './plugin-helpers/new-plugin';
import AddPluginResult, { AddPluginError } from './domain/add-plugin-result';
import { twoPluginsAreTheSame } from './plugin-helpers/compare-plugins';
import { AmplifyEvent } from './domain/amplify-event'; 
import inquirer from './domain/inquirer-helper';

export async function getPluginPlatform(): Promise<PluginPlatform> {
    //This function is called at the beginning of each command execution
    //and performs the following actions:
    //1. read the plugins.json file
    //2. checks the last scan time stamp,
    //3. re-scan if needed.
    //4. write to update the plugins.json file if re-scan is performed
    //5. return the pluginsInfo object
    let pluginPlatform = readPluginsJsonFile();
    if (pluginPlatform) {
        const lastScanTime = new Date(pluginPlatform.lastScanTime);
        const currentTime = new Date();
        const timeDiffInSeconds = (currentTime.getTime() - lastScanTime.getTime()) / 1000;
        if (timeDiffInSeconds > pluginPlatform.maxScanIntervalInSeconds) {
            pluginPlatform = await scan();
        }
    } else {
        pluginPlatform = await scan();
    }

    return pluginPlatform;
}

export function getPluginsWithName(
    pluginPlatform: PluginPlatform,
    nameOrAlias: string
): Array<PluginInfo> {
    let result = new Array<PluginInfo>();

    Object.keys(pluginPlatform.plugins).forEach((pluginName) => {
        if (pluginName === nameOrAlias) {
            result = result.concat(pluginPlatform.plugins[pluginName]);
        } else {
            pluginPlatform.plugins[pluginName].forEach((pluginInfo) => {
                if (pluginInfo.manifest.aliases &&
                        pluginInfo.manifest.aliases!.includes(nameOrAlias)) {
                    result.push(pluginInfo);
                }
            })
        }
    });

    return result;
}

export function getPluginsWithNameAndCommand(
    pluginPlatform: PluginPlatform,
    nameOrAlias: string,
    command: string
): Array<PluginInfo> {
    let result = new Array<PluginInfo>();

    Object.keys(pluginPlatform.plugins).forEach((pluginName) => {
        pluginPlatform.plugins[pluginName].forEach((pluginInfo) => {
            const {name, aliases, commands, commandAliases} = pluginInfo.manifest;
            const nameOrAliasMatching = (name === nameOrAlias) ||
                            (aliases && aliases!.includes(nameOrAlias));

            if (nameOrAliasMatching) {
                if ((commands && commands.includes(command)) ||
                    (commandAliases && Object.keys(commandAliases).includes(command))) {
                    result.push(pluginInfo);
                }
            }
        })
    });

    return result;
}

export function getPluginsWithEventHandler(
    pluginPlatform: PluginPlatform,
    event: AmplifyEvent
): Array<PluginInfo> {
    let result = new Array<PluginInfo>();

    Object.keys(pluginPlatform.plugins).forEach((pluginName) => {
        pluginPlatform.plugins[pluginName].forEach((pluginInfo) => {
            const { eventHandlers } = pluginInfo.manifest;
            if(eventHandlers && eventHandlers.length > 0 && eventHandlers.includes(event)){
                result.push(pluginInfo);
            }
        })
    });

    return result;
}

export function getAllPluginNames(pluginPlatform: PluginPlatform): Set<string> {
    let result = new Set<string>();

    Object.keys(pluginPlatform.plugins).forEach((pluginName) => {
        result.add(pluginName);

        pluginPlatform.plugins[pluginName].forEach((pluginInfo) => {
            if (pluginInfo.manifest.aliases &&
                    pluginInfo.manifest.aliases.length > 0) {
                pluginInfo.manifest.aliases.forEach((alias) => {
                    result.add(alias);
                })
            }
        })
    });

    return result;
}

export async function scan(pluginPlatform?: PluginPlatform): Promise<PluginPlatform> {
    const spinner = ora('Scanning the Amplify CLI platform for plugins...'); 
    spinner.start();
    return new Promise((resolve, reject)=>{
        try{
            const result = scanPluginPlatform(pluginPlatform); 
            spinner.succeed('Amplify CLI platform scan successful.');
            resolve (result); 
        }catch(e){
            spinner.fail('Amplify CLI platform scan failed.');
            reject(e);
        }
    })
}

export { verifyPlugin };

export { newPlugin };

export async function confirmAndScan(pluginPlatform: PluginPlatform){
    const { confirmed } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmed',
        message: 'Run a fresh scan for plugins on the Amplify CLI pluggable platform',
        default: false
    });
    if(confirmed){
        await scan(pluginPlatform);
    }
}

export function addUserPluginPackage(
    pluginPlatform: PluginPlatform,
    pluginDirPath: string
): AddPluginResult {
    const pluginVerificationResult = verifyPlugin(pluginDirPath);
    const result = new AddPluginResult(false, pluginVerificationResult);

    if (pluginVerificationResult.verified) {
        if (pluginPlatform.userAddedLocations.includes(pluginDirPath)) {
            result.error = AddPluginError.UserPluginAlreadyAdded;
        } else {
            const { packageJson, manifest } = pluginVerificationResult; 
            const pluginInfo = new PluginInfo(
                packageJson.name,
                packageJson.version,
                pluginDirPath,
                manifest!
            );

            const updatedPlugins = new Array<PluginInfo>();
           
            if(pluginPlatform.plugins[pluginInfo.manifest.name] && 
            pluginPlatform.plugins[pluginInfo.manifest.name].length > 0){
                pluginPlatform.plugins[pluginInfo.manifest.name].forEach((pluginInfoItem) => {
                    if (!twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                        updatedPlugins.push(pluginInfoItem);
                    }
                })
            }
            updatedPlugins.push(pluginInfo);
            pluginPlatform.plugins[pluginInfo.manifest.name] = updatedPlugins;
        
            if (!isUnderScanCoverage(pluginPlatform, pluginDirPath)) {
                pluginPlatform.userAddedLocations.push(pluginDirPath);
            }

            writePluginsJsonFile(pluginPlatform);
            result.isAdded = true;
        }
    } else {
        result.error = AddPluginError.FailedVerification;
    }
    return result;
}

export function addExcludedPluginPackage(
    pluginPlatform: PluginPlatform,
    pluginInfo: PluginInfo
): AddPluginResult {
    const pluginVerificationResult = verifyPlugin(pluginInfo.packageLocation);
    const result = new AddPluginResult(false, pluginVerificationResult);
    if (pluginVerificationResult.verified) {
        const updatedExcluded = new Array<PluginInfo>();
        pluginPlatform.excluded[pluginInfo.manifest.name].forEach((pluginInfoItem) => {
            if (!twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                updatedExcluded.push(pluginInfoItem);
            }
        })
        if (updatedExcluded.length > 0) {
            pluginPlatform.excluded[pluginInfo.manifest.name] = updatedExcluded;
        } else {
            delete pluginPlatform.excluded[pluginInfo.manifest.name];
        }

        const updatedPlugins = new Array<PluginInfo>();
        if(pluginPlatform.plugins[pluginInfo.manifest.name] && 
        pluginPlatform.plugins[pluginInfo.manifest.name].length > 0){
            pluginPlatform.plugins[pluginInfo.manifest.name].forEach((pluginInfoItem) => {
                if (!twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                    updatedPlugins.push(pluginInfoItem);
                }
            })
        }
        updatedPlugins.push(pluginInfo);
        pluginPlatform.plugins[pluginInfo.manifest.name] = updatedPlugins;

        if (!isUnderScanCoverage(pluginPlatform, pluginInfo.packageLocation)){
            pluginPlatform.userAddedLocations.push(pluginInfo.packageLocation);
        }
        writePluginsJsonFile(pluginPlatform);
        result.isAdded = true;
    } else {
        result.error = AddPluginError.FailedVerification;
    }
    return result;
}

// remove: select from the plugins only,
// if the location belongs to the scan directories, put the info inside the excluded.
// if the location is in the useraddedlocaitons, remove it from the user added locations.
export function removePluginPackage(
    pluginPlatform: PluginPlatform,
    pluginInfo: PluginInfo
): void {
    //remove from the plugins
    if(pluginPlatform.plugins[pluginInfo.manifest.name] && 
    pluginPlatform.plugins[pluginInfo.manifest.name].length > 0){
        const updatedPlugins = new Array<PluginInfo>();
        pluginPlatform.plugins[pluginInfo.manifest.name].forEach((pluginInfoItem) => {
            if (!twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                updatedPlugins.push(pluginInfoItem);
            }
        })
        if (updatedPlugins.length > 0) {
            pluginPlatform.plugins[pluginInfo.manifest.name] = updatedPlugins;
        } else {
            delete pluginPlatform.plugins[pluginInfo.manifest.name];
        }
    }

    //remove from the userAddedLocations
    if (pluginPlatform.userAddedLocations.includes(pluginInfo.packageLocation)) {
        let updatedUserAddedLocations = new Array<string>();
        pluginPlatform.userAddedLocations.forEach(packageLocation => {
            if (packageLocation !== pluginInfo.packageLocation) {
                updatedUserAddedLocations.push(packageLocation);
            }
        });
        pluginPlatform.userAddedLocations = updatedUserAddedLocations;
    }

    //if the plugin is under scan coverage, insert into the excluded
    if (isUnderScanCoverage(pluginPlatform, pluginInfo.packageLocation)) {
        pluginPlatform.excluded[pluginInfo.manifest.name] =
            pluginPlatform.excluded[pluginInfo.manifest.name] || [];
        pluginPlatform.excluded[pluginInfo.manifest.name].push(pluginInfo);
    }
    writePluginsJsonFile(pluginPlatform);
}

