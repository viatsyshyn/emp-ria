
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * @param {String} ns
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildClass = function (ns, def) {
        function ClassProxy() { }

        // TODO: ensure ctor
        // TODO: ensure getter/setters
        // TODO: build class def

        return ClassProxy;
    }
})();