/**
 * Created with JetBrains WebStorm.
 * User: Volodymyr
 * Date: 18.09.12
 * Time: 10:35
 * To change this template use File | Settings | File Templates.
 */

/** @namespace ria */
ria = ria || {};

/** @namespace ria.__API */
ria.__API = ria.__API || {};

(function () {
    "use strict";

    /**
     * Retuns prototype of given constuctor or object
     * @param {Function|Object} v
     * @return {*}
     */
    ria.__API.getPrototypeOf = function (v) {
        return Object.getPrototypeOf(v) || v.prototype || v.__proto__;
    };

    /**
     * Returns constructor of given object
     * @param {Object} v
     * @return {Function}
     */
    ria.__API.getConstructorOf = function (v) {
        return ria.__API.getPrototypeOf(v).constructor;
    };

    /**
     * Inherit from given class
     * @param {Function} superClass
     * @return {Object}
     */
    ria.__API.inheritFrom = function (superClass) {
        function InheritanceProxyClass() {}

        InheritanceProxyClass.prototype = superClass.prototype;
        return new InheritanceProxyClass();
    };

    /**
     * Inherit subClass from superClass
     * @param {Function} subClass
     * @param {Function} superClass
     */
    ria.__API.extend = function (subClass, superClass) {
        subClass.prototype = ria.__API.inheritFrom(superClass);
        subClass.prototype.constructor = subClass;

        subClass.super_ = superClass.prototype;
    };

    /**
     * Instantiate object from ctor without call to ctor
     * @param {Function} ctor
     * @param {String} [name_]
     * @return {Object}
     */
    ria.__API.getInstanceOf = function (ctor, name_) {
        var f = function InstanceOfProxy() {};
        //#ifdef DEBUG
            if (ria.__CFG.prettyStackTraces)
                f = new Function('return ' + f.toString().replace('InstanceOfProxy', name_))();
        //#endif

        f.prototype = ctor.prototype;
        return new f();
    };
})();