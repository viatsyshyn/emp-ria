/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__SYNTAX.buildIdentifier = function (name) {
        var values = {};
        function IdentifierValue(value) {
            //#ifdef DEBUG
            ria.__API.checkArg('value', [String, Number, Boolean], value);
            //#endif
            return values.hasOwnProperty(value) ? values[value] : (values[value] = new IdentifierValueImpl(value));
        }
        ria.__API.identifier(IdentifierValue, name);

        function IdentifierValueImpl(value) {
            this.valueOf = function () { return value; };
            this.toString = function toString() { return '[' + name + '#' + value + ']'; };
            //#ifdef DEBUG
            Object.freeze(this);
            //#endif
        }

        ria.__API.extend(IdentifierValueImpl, IdentifierValue);

        //#ifdef DEBUG
        Object.freeze(IdentifierValue);
        Object.freeze(IdentifierValueImpl);
        //#endif

        return IdentifierValue;
    };

    ria.__SYNTAX.IDENTIFIER = function (n) {
        var name = ria.__SYNTAX.getFullName(n);
        var delegate = ria.__SYNTAX.buildIdentifier(name);
        ria.__SYNTAX.define(name, delegate);
    };
})();