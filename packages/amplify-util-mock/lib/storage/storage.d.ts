import { AmplifyStorageSimulator } from 'amplify-storage-simulator';
export declare class StorageTest {
    private storageName;
    private storageSimulator;
    private configOverrideManager;
    private storageRegion;
    private bucketName;
    start(context: any): Promise<any>;
    stop(context: any): Promise<void>;
    trigger(context: any): Promise<void>;
    private generateTestFrontendExports;
    private generateFrontendExports;
    private getStorage;
    private createLocalStorage;
    readonly getSimulatorObject: AmplifyStorageSimulator;
}
