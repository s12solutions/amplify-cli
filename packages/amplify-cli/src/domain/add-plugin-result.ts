import PluginManifest from './plugin-manifest';
import PluginVerificationResult from './plugin-verification-result';

export default class AddPluginResult {
    constructor(
        public isAdded: boolean = false,
        public pluginVerificationResult?: PluginVerificationResult,
        public error?: AddPluginError
    ) {}
}

export enum AddPluginError {
    FailedVerification = "FailedVerification",
    UserPluginAlreadyAdded = 'UserPluginAlreadyAdded',
    //same package name and version but from another location
    SamePackageAleadyAdded = 'SamePackageAleadyAdded'
}