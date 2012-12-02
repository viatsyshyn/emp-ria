
/** @namespace ria.__API */
ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    var pmcStages = {
        /**
         * @var {Function[]}
         */
        callInit_: [],
        /**
         * @param {ria.__API.MethodDescriptor} method
         * @param {Object} scope
         * @param {Object} callSession
         */
        'OnCallInit': function (method, scope, callSession) {
            this.callInit_.forEach(function (_) {
                _(method, scope, callSession);
            });
        },

        /**
         * @var {Function[]}
         */
        beforeCall_: [],
        /**
         * @param {ria.__API.MethodDescriptor} method
         * @param {Object} scope
         * @param {Array} args
         * @param {Object} callSession
         */
        'OnBeforeCall': function (method, scope, args, callSession) {
            this.beforeCall_.forEach(function (_) {
                _(method, scope, args, callSession);
            });
        },

        /**
         * @var {Function[]}
         */
        afterCall_: [],
        /**
         * @param {ria.__API.MethodDescriptor} method
         * @param {Object} scope
         * @param {Array} args
         * @param {Object} result
         * @param {Object} callSession
         */
        'OnAfterCall': function (method, scope, args, result, callSession) {
            this.afterCall_.forEach(function (_) {
                _(method, scope, args, result, callSession);
            });
        },

        /**
         * @var {Function[]}
         */
        callFinally_: [],
        /**
         *
         * @param {ria.__API.MethodDescriptor} method
         * @param {Object} scope
         * @param {Object} callSession
         */
        'OnCallFinally': function (method, scope, callSession) {
            this.callFinally_.forEach(function (_) {
                _(method, scope, callSession);
            });
        }
    };

    /**
     * @param {Function} body
     * @param {ria.__API.MethodDescriptor} meta
     * @param {Object} scope
     * @param {Array} args
     */
    function PipelineMethodCall(body, meta, scope, args) {
        var callSession = {};
        pmcStages.OnCallInit(meta, scope, callSession);
        try {
            pmcStages.OnBeforeCall(meta, scope, args, callSession);
            // THIS IS WHERE METHOD BODY IS CALLED
            var result = body.apply(scope, args);
            // END OF METHOD BODY CALL
            pmcStages.OnAfterCall(meta, scope, args, result, callSession);
            return result;
        } finally {
            pmcStages.OnCallFinally(meta, scope, callSession);
        }
    }

    /**
     *
     * @param {String} stage
     * @param {Function} worker
     */
    ria.__API.addPipelineMethodCallStage = function (stage, worker) {
        switch (stage) {
            case 'CallInit': pmcStages.callInit_.push(worker); break;
            case 'BeforeCall': pmcStages.beforeCall_.push(worker); break;
            case 'AfterCall': pmcStages.afterCall_.push(worker); break;
            case 'CallFinally': pmcStages.callFinally_.push(worker); break;
        }
    };

    /**
     * @param {Function} body
     * @param {ria.__API.MethodDescriptor} meta
     * @param {Object} scope
     * @return {Function}
     */
    ria.__API.getPipelineMethodCallProxyFor = function (body, meta, scope) {
        var f_ = function PipelineMethodCallProxy() {
            return PipelineMethodCall(body, meta, scope, [].slice.call(arguments));
        };

        if (ria.__CFG.checkedMode)
            f_.__META = meta;

        //#ifdef DEBUG
            Object.freeze(f_);
        //#endif

        return f_;
    };
})();