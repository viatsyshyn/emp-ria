/**
 * Created with JetBrains WebStorm.
 * User: Ostap
 * Date: 25.09.12
 * Time: 23:33
 * To change this template use File | Settings | File Templates.
 */

ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    /**
     * @param {Class} enumClass
     * @param {String} name
     * @constructor
     */
    function EnumDescriptor(enumClass, name) {
        this.enumClass = enumClass;
        this.name = name;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    ria.__API.EnumDescriptor = EnumDescriptor;

    /**
     * @param {EnumDescriptor} meta
     * @constructor
     */
    function EnumInstance(meta) {

        this.__META = meta;

        //#ifdef DEBUG
        Object.freeze(this);
        //#endif
    }

    /**
     * @param {Class} enumClass
     * @param {String} name
     * @return {Function}
     */
    ria.__API.enum = function (enumClass, name) {
        function EnumProxy() {
            return new EnumInstance(EnumProxy.__META);
        }

        EnumProxy.__META = new EnumDescriptor(enumClass, name);

        //#ifdef DEBUG
            Object.freeze(EnumProxy);
        //#endif
        return EnumProxy;
    };

    ria.__API.isEnum = function (value) {
        if (typeof value === 'function') {
            return value.__META instanceof EnumDescriptor;
        }

        return value instanceof EnumInstance;
    }
})();