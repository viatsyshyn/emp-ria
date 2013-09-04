
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__SYNTAX.compileIdentifier = function (name) {
        var values = {};
        function IdentifierValue(value) {
            ria.__SYNTAX.checkArg('value', [String, Number, Boolean], value);
            return values.hasOwnProperty(value) ? values[value] : (values[value] = new IdentifierValueImpl(value));
        }
        ria.__API.identifier(IdentifierValue, name);

        function IdentifierValueImpl(value) {
            this.valueOf = function () { return value; };
            this.toString = function toString() { return '[' + name + '#' + value + ']'; };
            Object.freeze(this);
        }

        ria.__API.extend(IdentifierValueImpl, IdentifierValue);

        Object.freeze(IdentifierValue);
        Object.freeze(IdentifierValueImpl);

        return IdentifierValue;
    };

    ria.__SYNTAX.IDENTIFIER = function (n) {
        ria.__SYNTAX.validateVarName(n);
        var name = ria.__SYNTAX.getFullName(n);
        var identifier = ria.__SYNTAX.compileIdentifier(name);
        ria.__SYNTAX.isProtected(name) || ria.__SYNTAX.define(name, identifier);
        return identifier;
    };
})();