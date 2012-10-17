
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__SYNTAX.buildEnum = function (name, val) {
        var values = {};
        function Enum(raw) { return values[raw];}
          ria.__API.enum(Enum, name);
          function EnumImpl(raw) {
              this.valueOf = function () { return raw; };
              this.toString = function () { return name + '#' + raw; };
          }

          ria.__API.extend(EnumImpl, Enum);
          for (var prop in val)
          {
              var id = val[prop];
              //TODO: throw correct error message
              ria.__API.checkArg('value', [Number, String, Boolean], id);
              values[id] = Enum[prop] = new EnumImpl(id);
          }

          //#ifdef DEBUG
            Object.freeze(Enum);
            Object.freeze(values);
          //#endif
        return Enum;
    };

    ria.__SYNTAX.ENUM = function (n, val) {
        var name = ria.__SYNTAX.getFullName(n);
        var delegate = ria.__SYNTAX.buildEnum(name, val);
        ria.__SYNTAX.define(name, delegate);
    };
})();