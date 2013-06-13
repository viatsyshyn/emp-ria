(function () {

    function ArrayOfDescriptor(clazz) {
        this.clazz = clazz;
    }

    /**
     * @param ds
     * @returns {boolean}
     */
    ArrayOfDescriptor.isArrayOfDescriptor = function (ds) {
        return ds instanceof ArrayOfDescriptor;
    };

    ArrayOfDescriptor.prototype = {
        toString: function () { return 'Array<' + getIdentifierOfType(this.clazz) + '>'; },
        valueOf: function () { return this.clazz; }
    };

    Object.freeze(ArrayOfDescriptor);

    ria.__API.ArrayOfDescriptor = ArrayOfDescriptor;

    function ArrayOf(clazz) {
        if (clazz == undefined)
            throw Error('Expected class or type, but gor undefined');

        return new ArrayOfDescriptor(clazz);
    }

    ria.__API.ArrayOf = ArrayOf;
    ria.__API.isArrayOfDescriptor = ArrayOfDescriptor.isArrayOfDescriptor;
})();
