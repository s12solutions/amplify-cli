import { Template } from "cloudform-types";
import { ProjectOptions } from './amplifyUtils';
export interface TransformMigrationConfig {
    V1?: {
        Resources: string[];
    };
}
/**
 * The transform config is specified in transform.conf.json within an Amplify
 * API project directory.
 */
export interface TransformConfig {
    /**
     * The transform library uses a "StackMapping" to determine which stack
     * a particular resource belongs to. This "StackMapping" allows individual
     * transformer implementations to add resources to a single context and
     * reference resources as if they were all members of the same stack. The
     * transform formatter takes the single context and the stack mapping
     * and splits the context into a valid nested stack where any Fn::Ref or Fn::GetAtt
     * is replaced by a Import/Export or Parameter. Users may provide mapping
     * overrides to get specific behavior out of the transformer. Users may
     * override the default stack mapping to customize behavior.
     */
    StackMapping?: {
        [resourceId: string]: string;
    };
    /**
     * Provide build time options to GraphQL Transformer constructor functions.
     * Certain options cannot be configured via CloudFormation parameters and
     * need to be set at build time. E.G. DeletionPolicies cannot depend on parameters.
     */
    TransformerOptions?: {
        [transformer: string]: {
            [option: string]: any;
        };
    };
    /**
     * For backwards compatibility we store a set of resource logical ids that
     * should be preserved in the top level template to prevent deleting
     * resources that holds data and that were created before the new nested stack config.
     * This should not be used moving forwards. Moving forward, use the StackMapping instead which
     * generalizes this behavior.
     */
    Migration?: TransformMigrationConfig;
    /**
     * Keeping a track of transformer version changes
     */
    Version?: number;
}
/**
 * try to load transformer config from specified projectDir
 * if it does not exist then we return a blank object
 *  */
export declare function loadConfig(projectDir: string): Promise<TransformConfig>;
export declare function writeConfig(projectDir: string, config: TransformConfig): Promise<TransformConfig>;
/**
 * Given an absolute path to an amplify project directory, load the
 * user defined configuration.
 */
interface ProjectConfiguration {
    schema: string;
    resolvers: {
        [k: string]: string;
    };
    stacks: {
        [k: string]: Template;
    };
    config: TransformConfig;
}
export declare function loadProject(projectDirectory: string, opts?: ProjectOptions): Promise<ProjectConfiguration>;
/**
 * Given a project directory read the schema from disk. The schema may be a
 * single schema.graphql or a set of .graphql files in a directory named `schema`.
 * Preference is given to the `schema.graphql` if provided.
 * @param projectDirectory The project directory.
 */
export declare function readSchema(projectDirectory: string): Promise<string>;
export {};
