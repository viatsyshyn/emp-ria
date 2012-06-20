/**
 *
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 09.02.12
 * @fileoverview
 */


(function () {
    "use strict";

    function getProtoOf(v) {
        return Object.getPrototypeOf(v) || v.prototype || v.__proto__;
    }

    function getConstructorOf(v) {
        return getProtoOf(v).constructor;
    }

    function ArrayOfDescriptor(clazz) {
        this.clazz = clazz;
    }

    ArrayOfDescriptor.isArrayOfDescriptor = function (ds) {
        return ds instanceof ArrayOfDescriptor;
    };

    ArrayOfDescriptor.prototype['toString'] = function () {
        return 'Array<' + getIdentifierOfType(this.clazz) + '>';
    };

    ArrayOfDescriptor.prototype['valueOf'] = function () {
        return this.clazz;
    };

    Object.freeze(ArrayOfDescriptor);

    hwa.__API.ArrayOfDescriptor = ArrayOfDescriptor;

    function getIdentifierOfType(type) {
        if (type === undefined) return 'void';
        if (type === hwa.__API.Modifiers.SELF) return 'SELF';
        if (type === null) return 'Object';
        if (type === Function) return 'Function';
        if (type === Number) return 'Number';
        if (type === Boolean) return 'Boolean';
        if (type === String) return 'String';
        if (type === RegExp) return 'RegExp';
        if (type === Date) return 'Date';
        if (type === Array) return 'Array';
        if (type === Object) return 'Object';

        if (ArrayOfDescriptor.isArrayOfDescriptor(type))
            return type.toString();

        if (isCustomType(type))
            return type.__IDENTIFIER__;

        if (isImportedType(type))
            return type.__IDENTIFIER__;

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

        if (hwa.__API.isIdentifier(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Identifier';

        if (hwa.__API.isEnum(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Enum';

        if (value instanceof hwa.__API.Class)
            return getConstructorOf(value).__IDENTIFIER__ || 'Class';

        if (value instanceof Object && getConstructorOf(value))
            return getConstructorOf(value).getName() || 'Object';

        return 'Object';
    }

    function isBuildInType(type) {
        return type === Function
            || type === String
            || type === Boolean
            || type === Number
            || type === RegExp
            || type === Object
            || type === Array
            || type === Date
    }

    function isCustomType(type) {
        return hwa.__API.ClassDescriptor.isClassConstructor(type)
            || hwa.__API.InterfaceDescriptor.isInterfaceProxy(type)
            || hwa.__API.isEnum(type)
            || hwa.__API.isIdentifier(type)
            || hwa.__API.ArrayOfDescriptor.isArrayOfDescriptor(type);
    }

    function isImportedType(type) {
        return false;
    }

    function isType(type) {
        return isBuildInType(type) || isCustomType(type) || isImportedType(type);
    }

    function castAs(instance, to) {
        if (hwa.__API.ClassDescriptor.isClassConstructor(to) && instance instanceof hwa.__API.Class) {
            var scopes = instance.__scopesStack;
            if (Array.isArray(scopes) && scopes.length > 0 && scopes[0] instanceof to)
                return to.__classDescriptor.queryClassProxy(scopes
                    , getConstructorOf(scopes[0]).__classDescriptor
                    , hwa.__API.Visibility.Public, 0);
        }

        return null;
    }

    function castTo(instance, to) {
        var casted = castAs(instance, to);
        if (casted === null)
            throw Error('Can not cast ' + getIdentifierOfValue(instance) + ' to ' + getIdentifierOfType(to));

        return casted;
    }

    hwa.__API.getProtoOf = getProtoOf;
    hwa.__API.getConstructorOf = getConstructorOf;
    hwa.__API.getIdentifierOfType = getIdentifierOfType;
    hwa.__API.getIdentifierOfValue = getIdentifierOfValue;
    hwa.__API.isBuildInType = isBuildInType;
    hwa.__API.isCustomType = isCustomType;
    hwa.__API.isImportedType = isImportedType;
    hwa.__API.isType = isType;
    hwa.__API.castAs = castAs;
    hwa.__API.castTo = castTo;
})();