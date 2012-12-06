(function () {
    "use strict";

    /**
     * @param {Class} identifierClass
     * @param {String} name
     * @constructor
     */
    function IdentifierDescriptor(identifierClass, name) {
        this.identifierClass = identifierClass;
        this.name = name;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    ria.__API.IdentifierDescriptor = IdentifierDescriptor;

    /**
     * @param {Class} enumClass
     * @param {String} name
     * @return {Function}
     */
    ria.__API.identifier = function (identifierClass, name) {
        identifierClass.__META = new IdentifierDescriptor(identifierClass, name);
    };

    ria.__API.isIdentifier = function (value) {
        return value.__META instanceof IdentifierDescriptor;
    }
})();