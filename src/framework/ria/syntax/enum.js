/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {Object} val
     * @return {Function}
     */
    ria.__SYNTAX.validateEnumDecl = function (name, val) {
        ria.__SYNTAX.validateVarName(name);

        if (typeof name !== 'string')
            throw Error('String is expected as enum name');

        for (var prop in val) if (val.hasOwnProperty(prop)) {
            ria.__SYNTAX.validateVarName(prop);
            var value_ = val[prop];
            switch (typeof value_) {
                case 'number':
                case 'string':
                case 'boolean':
                    break;
                default:
                    throw Error('Enum value should Number, String or Boolean, got ' + (typeof value_))

            }
        }
    };

    /**
     * @param {String} name
     * @param {Object} val
     * @return {Function}
     */
    ria.__SYNTAX.compileEnum = function (name, val) {
        var values = {};
        function Enum(raw) { return values[raw]; }
        ria.__API.enum(Enum, name);
        function EnumImpl(raw) {
            this.valueOf = function () { return raw; };
            this.toString = function () { return name + '#' + raw; };
        }

        ria.__API.extend(EnumImpl, Enum);
        for (var prop in val) if (val.hasOwnProperty(prop)) {
            var value_ = val[prop];
            values[value_] = Enum[prop] = new EnumImpl(value_);
        }

        Object.freeze(Enum);
        Object.freeze(values);

        return Enum;
    };

    ria.__SYNTAX.ENUM = function (n, val) {
        ria.__SYNTAX.validateEnumDecl(n, val);
        var name = ria.__SYNTAX.getFullName(n);
        var enumeration = ria.__SYNTAX.compileEnum(name, val);
        ria.__SYNTAX.isProtected(name) || ria.__SYNTAX.define(name, enumeration);
        return enumeration;
    };
})();