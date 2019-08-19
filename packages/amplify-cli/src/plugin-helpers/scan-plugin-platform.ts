import path from 'path';
import fs from 'fs-extra';
import PluginCollection from '../domain/plugin-collection';
import PluginPlatform from '../domain/plugin-platform';
import constants from '../domain/constants';
import { getGlobalNodeModuleDirPath } from '../utils/global-prefix';
import PluginManifest from '../domain/plugin-manifest';
import PluginInfo from '../domain/plugin-info';
import verifyPlugin from './verify-plugin';
import {readPluginsJsonFile, writePluginsJsonFile} from './access-plugins-file';
import isChildPath from '../utils/is-child-path';

export default function scanPluginPlatform(pluginPlatform?: PluginPlatform): PluginPlatform {
    pluginPlatform = pluginPlatform || readPluginsJsonFile() || new PluginPlatform();

    pluginPlatform!.plugins = new PluginCollection();

    pluginPlatform!.pluginDirectories.forEach((directory) => {
        directory = normalizePluginDirectory(directory);
        if (fs.existsSync(directory)) {
            const subDirNames = fs.readdirSync(directory);
            subDirNames.forEach((subDirName) => {
                if (isMatchingNamePattern(pluginPlatform!.pluginPrefixes, subDirName)) {
                    const pluginDirPath = path.join(directory, subDirName);
                    verifyAndAdd(pluginPlatform!, pluginDirPath);
                }
            });
        }
    });

    if (pluginPlatform!.userAddedLocations && pluginPlatform!.userAddedLocations.length > 0) {
        pluginPlatform!.userAddedLocations.forEach((pluginDirPath) => {
            verifyAndAdd(pluginPlatform!, pluginDirPath);
        });
    }

    pluginPlatform!.lastScanTime = new Date();
    writePluginsJsonFile(pluginPlatform!);

    return pluginPlatform;
}

function normalizePluginDirectory(directory: string): string {
    let result = directory;
    if (directory === constants.LocalNodeModules) {
        result = path.normalize(path.join(__dirname, '../node_modules'));
    } else if (directory === constants.ParentDirectory) {
        result = path.normalize(path.join(__dirname, '../../../'));
    } else if (directory === constants.GlobalNodeModules) {
        result = getGlobalNodeModuleDirPath();
    }
    return result;
}

function isMatchingNamePattern(pluginPrefixes: string[], pluginDirName: string): boolean {
    let isMatchingNamePattern = true;
    if (pluginPrefixes && pluginPrefixes.length > 0) {
        isMatchingNamePattern = pluginPrefixes.some((prefix) => {
            const regex = new RegExp(`^${prefix}`);
            return regex.test(pluginDirName);
        });
    }
    return isMatchingNamePattern;
}

function verifyAndAdd(pluginPlatform: PluginPlatform, pluginDirPath: string) {
    const pluginVerificationResult = verifyPlugin(pluginDirPath);
    if (pluginVerificationResult.verified) {
        //ToDo: resolve plugin package duplications
        const manifest = pluginVerificationResult.manifest as PluginManifest;
        const { name, version } = pluginVerificationResult.packageJson;

        pluginPlatform.plugins[manifest.name] =
            pluginPlatform.plugins[manifest.name] || [];
        const pluginInfo = new PluginInfo(name, version, pluginDirPath, manifest);
        pluginPlatform.plugins[manifest.name].push(pluginInfo);
    }
}

export function isUnderScanCoverage(
    pluginPlatform: PluginPlatform,
    pluginDirPath: string
): boolean {
    let result = false;
    pluginDirPath = path.normalize(pluginDirPath);
    const pluginDirName = path.basename(pluginDirPath);

    if (fs.existsSync(pluginDirPath) &&
        isMatchingNamePattern(pluginPlatform.pluginPrefixes, pluginDirName)) {
        result = pluginPlatform.pluginDirectories.some((directory) => {
            directory = normalizePluginDirectory(directory);
            if (fs.existsSync(directory) && isChildPath(pluginDirPath, directory)) {
                return true;
            }
        });
    }

    return result;
}

