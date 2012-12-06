(function () {
    "use strict";

    /**
     * @param {*} value
     * @param {*} type
     * @return {Boolean}
     */
    function checkTypeHint(value, type) {
        if (value === undefined)
            return false;

        if (value === null || type === Object)
            return true;

        switch (typeof value) {
            case 'number': return type === Number;
            case 'string': return type === String;
            case 'boolean': return type === Boolean;
            default:
                if ( value === Boolean
                  || value === String
                  || value === Number
                  || value === RegExp ) {
                    return value == type;
                }

                /*if (hwa.__API.ArrayOfDescriptor.isArrayOfDescriptor(type)) {
                    if (hwa.__API.ArrayOfDescriptor.isArrayOfDescriptor(value))
                        return type.valueOf() == value.valueOf();

                    if (!(value instanceof Array))
                        return false;

                    for (var i = 0; i < value.length; i++) {
                        if (!checkArgumentHinting(value[i], type.valueOf()))
                            return false;
                    }

                    return true;
                }

                // check is type is Interface
                if (hwa.__API.InterfaceDescriptor.isInterfaceProxy(type)) {
                    if (hwa.__API.InterfaceDescriptor.isInterfaceProxy(value))
                        return type.__interfaceDescriptor == value.__interfaceDescriptor;

                    return type.implementedBy(value);
                }*/

                return value === type || value instanceof type;
        }
    }

    /**
     * Ensure argument is of correct types
     * @param {String} name
     * @param {Array} type
     * @param {*} value
     */
    ria.__SYNTAX.checkArg = function (name, type, value) {
        var isOptional = /^.+_$/.test(name);
        if (isOptional && value === undefined)
            return;

        if (!isOptional && value === undefined)
            throw Error('Argument ' + name + ' is required');

        if (!Array.isArray(type))
            type = [type];

        var t = type.slice();
        while (t.length > 0) {
            var t_ = t.pop();
            if (checkTypeHint(value, t_))
                return;
        }

        throw Error('Argument ' + name + ' expected to be ' + type.map(ria.__API.getIdentifierOfType).join(' or ')
            + ' but received ' + ria.__API.getIdentifierOfValue(value));
    };

    /**
     * Ensure arguments are of correct types
     * @param {String[]} names
     * @param {Array} types
     * @param {Array}values
     */
    ria.__SYNTAX.checkArgs = function (names, types, values) {
        if (values.length > names.length)
            throw Error('Too many arguments passed');

        for(var index = 0; index < names.length; index++) {
            ria.__SYNTAX.checkArg(names[index], types.length > index ? types[index] : Object, values[index]);
        }
    };

    /**
     * Ensure function return is of correct type
     * @param {*} type
     * @param {*} value
     */
    ria.__SYNTAX.checkReturn = function (type, value) {
        if (type === null)
            return ;

        if (type === undefined && value !== undefined)
            throw Error('No return expected but got ' + ria.__API.getIdentifierOfValue(value));

        if (type !== undefined && !checkTypeHint(value, type))
            throw Error('Expected return of ' + ria.__API.getIdentifierOfType(type) + ' but got ' + ria.__API.getIdentifierOfValue(value));
    };

    if (ria.__CFG.enablePipelineMethodCall && ria.__CFG.checkedMode) {
        ria.__API.addPipelineMethodCallStage('BeforeCall',
            function (body, meta, scope, args) {
                ria.__SYNTAX.checkArgs(meta.argsNames, meta.argsTypes, args);
            });

        ria.__API.addPipelineMethodCallStage('AfterCall',
            function (body, meta, scope, args, result) {
                ria.__SYNTAX.checkReturn(meta.ret, result);
                return result;
            });
    }

})();