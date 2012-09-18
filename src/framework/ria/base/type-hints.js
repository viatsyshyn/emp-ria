/**
 * Created with JetBrains WebStorm.
 * User: Volodymyr
 * Date: 18.09.12
 * Time: 10:54
 * To change this template use File | Settings | File Templates.
 */

ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    /**
     * @param {*} value
     * @param {Function} type
     * @return {Boolean}
     */
    function checkTypeHint(value, type) {
        if (value === undefined)
            return false;

        if (value === null || type === Object)
            return true;

        switch (typeof value) {
            case 'number': return type == Number;
            case 'string': return type == String;
            case 'boolean': return type == Boolean;
            default:
                if ( value == Boolean
                  || value == String
                  || value == Number
                  || value == RegExp ) {
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

    function getIdentifierOfType(type) {
        if (type === undefined) return 'void';
        //if (type === __API.Modifiers.SELF) return 'SELF';
        if (type === null) return '*';
        if (type === Function) return 'Function';
        if (type === Number) return 'Number';
        if (type === Boolean) return 'Boolean';
        if (type === String) return 'String';
        if (type === RegExp) return 'RegExp';
        if (type === Date) return 'Date';
        if (type === Array) return 'Array';
        if (type === Object) return 'Object';

        /*if (ArrayOfDescriptor.isArrayOfDescriptor(type))
            return type.toString();

        if (isCustomType(type))
            return type.__IDENTIFIER__;

        if (isImportedType(type))
            return type.__IDENTIFIER__;*/

        return 'UnknownType';
    }

    function getIdentifierOfValue(value) {
        if (value === undefined || value === null)
            return 'void';

        if (typeof value === 'number') return 'Number';
        if (typeof value === 'boolean') return 'Boolean';
        if (typeof value === 'string') return 'String';
        if (typeof value === 'regexp') return 'RegExp';
        if (typeof value === 'date') return 'Date';
        if (typeof value === 'function') return 'Function';

        if (Array.isArray(value)) return 'Array';

        /*if (__API.isIdentifier(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Identifier';

        if (__API.isEnum(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Enum';

        if (value instanceof __API.Class)
            return getConstructorOf(value).__IDENTIFIER__ || 'Class';*/

        if (value instanceof Object) {
            var ctor = ria.__API.getConstructorOf(value);
            if (ctor)
                return ctor.getName() || 'Object';
        }

        return 'Object';
    }

    /**
     * Ensure argument is of correct types
     * @param {String} name
     * @param {Function|Function[]} type
     * @param {*} value
     */
    ria.__API.checkArg = function (name, type, value) {
        //#ifdef DEBUG
            var isOptional = /^.+\_$/.test(name);
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

            throw Error('Argument ' + name + ' expected to be ' + type.map(getIdentifierOfType).join(' or ')
                + ' but received ' + getIdentifierOfValue(value));
        //#endif
    };

    /**
     * Ensure arguments are of correct types
     * @param {String[]} names
     * @param {Function[]} types
     * @param {Array}values
     */
    ria.__API.checkArgs = function (names, types, values) {
        //#ifdef DEBUG
            if (values.length > names.length)
                throw Error('Too many arguments passed');

            for(var index = 0; index < names.length; index++) {
                ria.__API.checkArg(names[index], types.length > index ? types[index] : Object, values[index]);
            }
        //#endif
    };

    /**
     * Ensure function return is of correct type
     * @param {*} type
     * @param {*} value
     */
    ria.__API.checkReturn = function (type, value) {
        //#ifdef DEBUG
            if (type === null)
                return ;

            if (type === undefined && value !== undefined)
                throw Error('No return expected but got ' + getIdentifierOfValue(value));

            if (type !== undefined && !checkTypeHint(value, type))
                throw Error('Expected return of ' + getIdentifierOfType(type) + ' but got ' + getIdentifierOfValue(value));
        //#endif
    };

})();