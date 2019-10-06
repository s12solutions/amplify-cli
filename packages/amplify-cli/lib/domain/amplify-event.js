"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AmplifyEvent;
(function (AmplifyEvent) {
    AmplifyEvent["PreInit"] = "PreInit";
    AmplifyEvent["PostInit"] = "PostInit";
    AmplifyEvent["PrePush"] = "PrePush";
    AmplifyEvent["PostPush"] = "PostPush";
})(AmplifyEvent = exports.AmplifyEvent || (exports.AmplifyEvent = {}));
var AmplifyEventData = /** @class */ (function () {
    function AmplifyEventData() {
    }
    return AmplifyEventData;
}());
exports.AmplifyEventData = AmplifyEventData;
var AmplifyPreInitEventData = /** @class */ (function (_super) {
    __extends(AmplifyPreInitEventData, _super);
    function AmplifyPreInitEventData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AmplifyPreInitEventData;
}(AmplifyEventData));
exports.AmplifyPreInitEventData = AmplifyPreInitEventData;
var AmplifyPostInitEventData = /** @class */ (function (_super) {
    __extends(AmplifyPostInitEventData, _super);
    function AmplifyPostInitEventData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AmplifyPostInitEventData;
}(AmplifyEventData));
exports.AmplifyPostInitEventData = AmplifyPostInitEventData;
var AmplifyPrePushEventData = /** @class */ (function (_super) {
    __extends(AmplifyPrePushEventData, _super);
    function AmplifyPrePushEventData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AmplifyPrePushEventData;
}(AmplifyEventData));
exports.AmplifyPrePushEventData = AmplifyPrePushEventData;
var AmplifyPostPushEventData = /** @class */ (function (_super) {
    __extends(AmplifyPostPushEventData, _super);
    function AmplifyPostPushEventData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AmplifyPostPushEventData;
}(AmplifyEventData));
exports.AmplifyPostPushEventData = AmplifyPostPushEventData;
var AmplifyEventArgs = /** @class */ (function () {
    function AmplifyEventArgs(event, data) {
        this.event = event;
        this.data = data;
    }
    return AmplifyEventArgs;
}());
exports.AmplifyEventArgs = AmplifyEventArgs;
//# sourceMappingURL=../../src/lib/domain/amplify-event.js.map