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
    }

    ria.__API.EnumDescriptor = EnumDescriptor;

    /**
     * @param {Class} enumClass
     * @param {String} name
     * @return {Function}
     */
    ria.__API.enum = function (enumClass, name) {
        enumClass.__META = new EnumDescriptor(enumClass, name);
    };

    ria.__API.isEnum = function (value) {
        return (value && value.__META) ? value.__META instanceof EnumDescriptor : false;
    }
})();