import { GraphQLSchema } from 'graphql';
import { VelocityTemplate } from './velocity';
import { AmplifyAppSyncSimulatorDataLoader } from './data-loader';
export { addDataLoader, removeDataLoader } from './data-loader';
import { PubSub } from 'graphql-subscriptions';
import { AmplifySimulatorFunction } from './resolvers/function';
import { AppSyncSimulatorServerConfig, AmplifyAppSyncSimulatorConfig, AmplifyAppSyncAPIConfig } from './type-definition';
export * from './type-definition';
export declare class AmplifyAppSyncSimulator {
    private resolvers;
    private dataSources;
    private functions;
    private mappingTemplates;
    private _serverConfig;
    private _pubsub;
    private rawSchema;
    private _schema;
    private _server;
    private _config;
    private _appSyncConfig;
    constructor(serverConfig?: AppSyncSimulatorServerConfig);
    reload(config: AmplifyAppSyncSimulatorConfig): void;
    init(config: AmplifyAppSyncSimulatorConfig): void;
    start(): Promise<void>;
    stop(): void;
    getMappingTemplate(path: string): VelocityTemplate;
    getDataLoader(sourceName: string): AmplifyAppSyncSimulatorDataLoader;
    getFunction(functionName: string): AmplifySimulatorFunction;
    getResolver(typeName: any, fieldName: any): any;
    readonly schema: GraphQLSchema;
    readonly pubsub: PubSub;
    readonly url: string;
    readonly config: AmplifyAppSyncSimulatorConfig;
    readonly appSyncConfig: AmplifyAppSyncAPIConfig;
}