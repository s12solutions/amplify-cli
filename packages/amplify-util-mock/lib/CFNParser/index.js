"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_parser_1 = require("./field-parser");
const intrinsic_functions_1 = require("./intrinsic-functions");
// Add know intrinsic functions
field_parser_1.addIntrinsicFunction('Fn::Join', intrinsic_functions_1.cfnJoin);
field_parser_1.addIntrinsicFunction('Fn::Sub', intrinsic_functions_1.cfnSub);
field_parser_1.addIntrinsicFunction('Fn::GetAtt', intrinsic_functions_1.cfnGetAtt);
field_parser_1.addIntrinsicFunction('Fn::Split', intrinsic_functions_1.cfnSplit);
field_parser_1.addIntrinsicFunction('Ref', intrinsic_functions_1.cfnRef);
field_parser_1.addIntrinsicFunction('Fn::Select', intrinsic_functions_1.cfnSelect);
field_parser_1.addIntrinsicFunction('Fn::If', intrinsic_functions_1.cfnIf);
field_parser_1.addIntrinsicFunction('Fn::Equals', intrinsic_functions_1.cfnEquals);
field_parser_1.addIntrinsicFunction('Fn::And', intrinsic_functions_1.cfnAnd);
field_parser_1.addIntrinsicFunction('Fn::Or', intrinsic_functions_1.cfnOr);
field_parser_1.addIntrinsicFunction('Fn::Not', intrinsic_functions_1.cfnNot);
field_parser_1.addIntrinsicFunction('Condition', intrinsic_functions_1.cfnCondition);
var field_parser_2 = require("./field-parser");
exports.addIntrinsicFunction = field_parser_2.addIntrinsicFunction;
var appsync_resource_processor_1 = require("./appsync-resource-processor");
exports.processAppSyncResources = appsync_resource_processor_1.processResources;
//# sourceMappingURL=index.js.map