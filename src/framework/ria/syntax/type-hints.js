(ria = ria || {}).__SYNTAX = ria.__SYNTAX || {};
(ria = ria || {}).__CFG = ria.__CFG || {};

(function () {
    "use strict";

    var IS_OPTIONAL = /^.+_$/;

    function checkDelegate(value, type) {
        if ('function' !== typeof value)
            return false;

        var method = value.__META;
        if (method) {
            var delegate = type.__META;

            try {
                method.argsNames.forEach(function (name, index) {
                    if (!IS_OPTIONAL.test(name)) {
                        if (delegate.argsNames[index] == undefined) {
                            throw new Exception('Lambda required arguments ' + name + ' that delegate does not supply');
                        }
                    }

                    if (!checkTypeHint(method.argsTypes[index], delegate.argsTypes[index])) {
                         throw new Exception('Lambda accepts ' + ria.__API.getIdentifierOfType(method.argsTypes[index]) + ' for argument ' + name
                             + ', but delegate supplies ' + ria.__API.getIdentifierOfType(delegate.argsTypes[index]));
                    }
                });
            } catch (e) {
                throw new Exception('Delegate validation error', e);
            }
        }

        return true;
    }

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
                  || value === Function
                  || value === RegExp ) {
                    return value == type;
                }

                if (ria.__API.isDelegate(type))
                    return checkDelegate(value, type);

                if (type === Function)
                    return 'function' === typeof value;

                if (type === ria.__API.Interface) {
                    return value === ria.__API.Interface || ria.__API.isInterface(value);
                }

                if (ria.__API.isInterface(type)) {
                    if (ria.__API.isInterface(value))
                        return value === type;

                    if (!(value instanceof ria.__API.Class))
                        return false;

                    return ria.__API.getConstructorOf(value).__META.ifcs.indexOf(type.valueOf()) >= 0;
                }

                if (ria.__API.isArrayOfDescriptor(type)) {
                    if (ria.__API.isArrayOfDescriptor(value))
                        return type.valueOf() == value.valueOf();

                    if (!Array.isArray(value))
                        return false;

                    for (var i = 0; i < value.length; i++) {
                        if (!checkTypeHint(value[i], type.valueOf()))
                            return false;
                    }

                    return true;
                }

                if (ria.__API.isClassOfDescriptor(type)) {
                    if (ria.__API.isClassOfDescriptor(value))
                        return type.valueOf() == value.valueOf();

                    var v = value;
                    while (v) {
                        if (v === type.valueOf())
                            return true;

                        v = v.__META.base;
                    }

                    return false;
                }

                if (ria.__API.isImplementerOfDescriptor(type)) {
                    if (ria.__API.isImplementerOfDescriptor(value))
                        return type.valueOf() == value.valueOf();

                    if (!ria.__API.isClassConstructor(value))
                        return false;

                    return value.__META.ifcs.indexOf(type.valueOf()) >= 0;
                }

                return value === type || value instanceof type;
        }
    }

    /**
     * @function
     * Ensure argument is of correct types
     * @param {String} name
     * @param {Array} type
     * @param {*} value
     */
    ria.__SYNTAX.checkArg = function (name, type, value) {
        var isOptional = IS_OPTIONAL.test(name);
        if (isOptional && value === undefined)
            return;

        if (!isOptional && value === undefined)
            throw Error('Argument ' + name + ' is required');

        if (!Array.isArray(type))
            type = [type];

        var error;
        var t = type.slice();
        while (t.length > 0) {
            var t_ = t.pop();
            try {
                if (checkTypeHint(value, t_))
                    return;
            } catch (e) {
                error = e;
            }
        }

        throw new Exception('Argument ' + name + ' expected to be ' + type.map(ria.__API.getIdentifierOfType).join(' or ')
            + ' but received ' + ria.__API.getIdentifierOfValue(value), error);
    };

    /**
     * @function
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

        if (type === undefined && value !== undefined) {
            throw Error('No return expected but got ' + ria.__API.getIdentifierOfValue(value));
        }

        if (type !== undefined && !checkTypeHint(value, type))
            throw Error('Expected return of ' + ria.__API.getIdentifierOfType(type) + ' but got ' + ria.__API.getIdentifierOfValue(value));
    };

    if (ria.__CFG.enablePipelineMethodCall && ria.__CFG.checkedMode) {
        ria.__API.addPipelineMethodCallStage('BeforeCall',
            function (body, meta, scope, args) {
                try {
                    ria.__SYNTAX.checkArgs(meta.argsNames, meta.argsTypes, args);
                } catch (e) {
                    throw new ria.__API.Exception('Bad argument for ' + meta.name, e);
                }
            });

        ria.__API.addPipelineMethodCallStage('AfterCall',
            function (body, meta, scope, args, result) {
                try {
                    ria.__SYNTAX.checkReturn(meta.ret, result);
                } catch (e) {
                    throw new ria.__API.Exception('Bad return of ' + meta.name, e);
                }
                return result;
            });
    }

})();