(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {Array} argsTypes
     * @param {String[]} argsNames
     * @constructor
     */
    function AnnotationDescriptor(name, argsTypes, argsNames) {
        this.name = name;
        //noinspection JSUnusedGlobalSymbols
        this.argsNames = argsNames;
        //noinspection JSUnusedGlobalSymbols
        this.argsTypes = argsTypes;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    ria.__API.AnnotationDescriptor = AnnotationDescriptor;

    /**
     * @class AnnotationInstance
     * @param {Object} args
     * @param {AnnotationDescriptor} meta
     * @constructor
     */
    function AnnotationInstance(args, meta) {

        for(var k in args) if (args.hasOwnProperty(k)) {
            this[k] = args[k];
        }

        this.__META = meta;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    /**
     * @param {String} name
     * @param {Array} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @return {Function}
     */
    ria.__API.annotation = function(name, argsTypes_, argsNames_) {

        /**
         * @return {AnnotationInstance}
         * @constructor
         */
        function AnnotationProxy() {
            var args = [].slice.call(arguments);
            //#ifdef DEBUG
                ria.__API.checkArgs(argsNames_, argsTypes_, args);
            //#endif

            var o = {};
            for(var index = 0; index < argsNames_.length; index++) {
                o[argsNames_[index]] = args[index];
            }

            return new AnnotationInstance(o, AnnotationProxy.__META);
        }

        AnnotationProxy.__META = new AnnotationDescriptor(name, argsTypes_, argsNames_);

        //#ifdef DEBUG
            Object.freeze(AnnotationProxy);
        //#endif
        return AnnotationProxy;
    };

    ria.__API.isAnnotation = function (value) {
        if (typeof value === 'function') {
            return value.__META instanceof AnnotationDescriptor;
        }

        return value instanceof AnnotationInstance;
    }
})();