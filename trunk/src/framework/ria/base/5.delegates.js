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

    MethodDescriptor.prototype.isProtected = function () {
        return /^.+_$/.test(this.name);
    };

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
            return ria.__API.getPipelineMethodCallProxyFor(fn, DelegateProxy.__META, null);
        }

        DelegateProxy.__META = new MethodDescriptor(name, ret_, argsTypes_, argsNames_);

        //#ifdef DEBUG
            Object.freeze(DelegateProxy);
        //#endif
        return DelegateProxy;
    };

    /**
     * @param {Function} delegate
     * @return {Boolean}
     */
    ria.__API.isDelegate = function (delegate) {
        return delegate.__META instanceof MethodDescriptor;
    };
})();