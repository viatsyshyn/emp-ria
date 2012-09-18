/**
 * Created with JetBrains WebStorm.
 * User: Volodymyr
 * Date: 18.09.12
 * Time: 10:37
 * To change this template use File | Settings | File Templates.
 */

ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {*} ret
     * @param {Array} argsTypes
     * @param {String[]} argsNames
     * @constructor
     */
    function MethodDescriptor(name, ret, argsTypes, argsNames) {
        this.name = name;
        this.ret = ret;
        this.argsTypes = argsTypes;
        this.argsNames = argsNames;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    ria.__API.MethodDescriptor = MethodDescriptor;

    /**
     * @param {String} name
     * @param {*} [ret_]
     * @param {Array} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @return {Function}
     */
    ria.__API.delegate = function (name, ret_, argsTypes_, argsNames_) {
        function DelegateProxy(fn) {
            // TODO ensure args names & count
            var f_ = function () {
                var args = [].slice.call(arguments);
                //#ifdef DEBUG
                    ria.__API.checkArgs(argsNames_, argsTypes_, args);
                //#endif
                var res = fn.apply(this, args);
                //#ifdef DEBUG
                    ria.__API.checkReturn(ret_, res);
                //#endif
                return res;
            };

            f_.__META = DelegateProxy.__META;

            //#ifdef DEBUG
                Object.freeze(f_);
            //#endif

            return f_;
        }

        DelegateProxy.__META = new MethodDescriptor(name, ret_, argsTypes_, argsNames_);

        //#ifdef DEBUG
            Object.freeze(DelegateProxy);
        //#endif
        return DelegateProxy;
    };
})();