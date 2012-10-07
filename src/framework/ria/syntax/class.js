
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    ria.__SYNTAX.BuildClass = function () {
        var args = [].slice.call(arguments);

        var body = args.pop();
        // TODO: check for IMPLEMENTS
        // TODO: check for EXTENDS
        var name = args.pop();
        var flags = {
            isFinal: false,
            isAbstract: false
        };

        ria.__SYNTAX.parseModifiers(args, flags);

        var annotations = ria.__SYNTAX.parseAnnotations(args);

        function ClassProxy() { }

        // TODO: build class def

        return ClassProxy;
    };
})();