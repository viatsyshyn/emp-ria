
/** @namespace ria.__SYNTAX */
ria = ria || {};
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
            _DEBUG && ria.__SYNTAX.checkArg('value', [String, Number, Boolean], value);
            return values.hasOwnProperty(value) ? values[value] : (values[value] = new IdentifierValueImpl(value));
        }
        ria.__API.identifier(IdentifierValue, name);

        function IdentifierValueImpl(value) {
            this.valueOf = function () { return value; };
            this.toString = function toString() { return '[' + name + '#' + value + ']'; };
            _DEBUG && Object.freeze(this);
        }

        ria.__API.extend(IdentifierValueImpl, IdentifierValue);

        _DEBUG && Object.freeze(IdentifierValue);
        _DEBUG && Object.freeze(IdentifierValueImpl);

        return IdentifierValue;
    };

    ria.__SYNTAX.IDENTIFIER = function (n) {
        var name = ria.__SYNTAX.getFullName(n);
        var delegate = ria.__SYNTAX.buildIdentifier(name);
        ria.__SYNTAX.define(name, delegate);
    };
})();