import PluginPlatform from './domain/plugin-platform';
import PluginInfo from './domain/plugin-info';
import { readPluginsJsonFile } from './plugin-helpers/access-plugins-file';
import scanPluginPlatform, { isUnderScanCoverage } from './plugin-helpers/scan-plugin-platform';
import verifyPlugin from './plugin-helpers/verify-plugin';
import newPlugin from './plugin-helpers/new-plugin';
import AddPluginResult, { AddPluginError } from './domain/add-plugin-result';
import { twoPluginsAreTheSame } from './plugin-helpers/compare-plugins';

export function getPluginPlatform(): PluginPlatform {
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
            pluginPlatform = scanPluginPlatform();
        }
    } else {
        pluginPlatform = scanPluginPlatform();
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

export { scanPluginPlatform as scan };

export { verifyPlugin };

export { newPlugin };

export function addUserPluginPackage(
    pluginPlatform: PluginPlatform,
    pluginDirPath: string
): AddPluginResult {
    const pluginVerificationResult = verifyPlugin(pluginDirPath);
    const result = new AddPluginResult(false, pluginVerificationResult);

    if (pluginVerificationResult.verified) {
        if (pluginPlatform.userAddedLocations.includes(pluginDirPath)) {
            result.error = AddPluginError.UserPluginAlreadyAdded;
        } else if (!isUnderScanCoverage(pluginPlatform, pluginDirPath)) {
            pluginPlatform.userAddedLocations.push(pluginDirPath);
            scanPluginPlatform(pluginPlatform);
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
        const updatedPlugins = new Array<PluginInfo>();
        pluginPlatform.excluded[pluginInfo.manifest.name].forEach((pluginInfoItem) => {
            if (!twoPluginsAreTheSame(pluginInfoItem, pluginInfo)) {
                updatedPlugins.push(pluginInfoItem);
            }
        })
        if (updatedPlugins.length > 0) {
            pluginPlatform.excluded[pluginInfo.manifest.name] = updatedPlugins;
        } else {
            delete pluginPlatform.excluded[pluginInfo.manifest.name];
        }

        scanPluginPlatform(pluginPlatform);
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

    scanPluginPlatform(pluginPlatform);
}

