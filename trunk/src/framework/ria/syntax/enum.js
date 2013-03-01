/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {Object} val
     * @return {Function}
     */
    ria.__SYNTAX.buildEnum = function (name, val) {
        var values = {};
        function Enum(raw) { return values[raw]; }
        ria.__API.enum(Enum, name);
        function EnumImpl(raw) {
            this.valueOf = function () { return raw; };
            this.toString = function () { return name + '#' + raw; };
        }

        ria.__API.extend(EnumImpl, Enum);
        for (var prop in val) {
            var value_ = val[prop];
            //TODO: throw correct error message
            ria.__SYNTAX.checkArg('value', [Number, String, Boolean], value_);
            values[value_] = Enum[prop] = new EnumImpl(value_);
        }


        Object.freeze(Enum);
        Object.freeze(values);

        return Enum;
    };

    ria.__SYNTAX.ENUM = function (n, val) {
        var name = ria.__SYNTAX.getFullName(n);
        var delegate = ria.__SYNTAX.buildEnum(name, val);
        ria.__SYNTAX.define(name, delegate);
    };
})();