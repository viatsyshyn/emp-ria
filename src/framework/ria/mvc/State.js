/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function() {
    "use strict";

    /**
     * @class hwa.mvc.State
     */
    CLASS('State', [
        PUBLIC, function __constructor() {
            this.controller = null;
            this.action = null;
            this.params = {};
            this.updated = null;
            this.dispatched = false;
            // push 2 URL ?
            this.public_ = false;
        },

        PUBLIC, String, function getController() {
            return this.controller;
        },

        [String],
        PUBLIC, VOID, function setController(value) {
            this.controller = value;
        },

        PUBLIC, String, function getAction() {
            return this.action;
        },

        [String],
        PUBLIC, VOID, function setAction(value) {
            this.action = value;
        },

        [Object],
        PUBLIC, String, function hasParam(key) {
            return this.params.hasOwnProperty(key);
        },

        [Object, String],
        PUBLIC, String, function getParam(key, def) {
            return this.hasParam(key) ? this.params[key] : def;
        },

        [Object, String],
        PUBLIC, VOID, function setParam(key, value) {
            this.params[key] = value;
        },

        PUBLIC, Object, function getParams() {
            return this.params;
        },

        [Object],
        PUBLIC, VOID, function setParams(value) {
            this.params = value || {};
        },

        PUBLIC, Boolean, function isDispatched() {
            return this.dispatched;
        },

        [Boolean],
        PUBLIC, VOID, function setDispatched(value) {
            this.dispatched = value;
        },

        PUBLIC, Boolean, function isPublic() {
            return this.public_;
        },

        [Boolean],
        PUBLIC, VOID, function setPublic(value) {
            this.public_ = value;
        }
    ]);
});