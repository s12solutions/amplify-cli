"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_mapping_template_1 = require("graphql-mapping-template");
/**
 * The class that contains the resolver templates for interacting
 * with the Relational Database data source.
 */
class RelationalDBMappingTemplate {
    /**
     * Provided a SQL statement, creates the rds-query item resolver template.
     *
     * @param param0 - the SQL statement to use when querying the RDS cluster
     */
    static rdsQuery({ statements }) {
        return graphql_mapping_template_1.obj({
            version: graphql_mapping_template_1.str('2018-05-29'),
            statements: statements
        });
    }
}
exports.default = RelationalDBMappingTemplate;
//# sourceMappingURL=RelationalDBMappingTemplate.js.map