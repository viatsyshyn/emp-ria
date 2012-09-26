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
     * @param {Class} identClass
     * @param {String} name
     * @constructor
     */
    function IdentifierDescriptor(identClass, name) {
        this.identClass = identClass;
        this.name = name;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    ria.__API.IdentifierDescriptor = IdentifierDescriptor;

    /**
     * @param {IdentifierDescriptor} meta
     * @constructor
     */
    function IdentifierInstance(meta) {

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
        function IdentifierProxy() {
            return new IdentifierInstance(EnumProxy.__META);
        }

        IdentifierProxy.__META = new IdentifierDescriptor(enumClass, name);

        //#ifdef DEBUG
            Object.freeze(IdentifierProxy);
        //#endif
        return IdentifierProxy;
    };

    ria.__API.isIdentifier = function (value) {
        if (typeof value === 'function') {
            return value.__META instanceof IdentifierDescriptor;
        }

        return value instanceof IdentifierInstance;
    }
})();