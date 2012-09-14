/**
 *
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 09.02.12
 * @fileoverview
 */


(function (__API, ria) {
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

    /** @class ArrayOfDescriptor.isArrayOfDescriptor */
    ria.defineConst(ArrayOfDescriptor, 'isArrayOfDescriptor', function (ds) {
        return ds instanceof ArrayOfDescriptor;
    });

    ria.defineConst(ArrayOfDescriptor.prototype, {
        toString: function () { return 'Array<' + getIdentifierOfType(this.clazz) + '>'; },
        valueOf: function () { return this.clazz; }
    });

    Object.freeze(ArrayOfDescriptor);

    /** @class ria.__API.ArrayOfDescriptor */
    ria.defineConst(__API, 'ArrayOfDescriptor', ArrayOfDescriptor);

    function getIdentifierOfType(type) {
        if (type === undefined) return 'void';
        if (type === __API.Modifiers.SELF) return 'SELF';
        if (type === null) return '*';
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

        if (__API.isIdentifier(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Identifier';

        if (__API.isEnum(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Enum';

        if (value instanceof __API.Class)
            return getConstructorOf(value).__IDENTIFIER__ || 'Class';

        if (value instanceof Object) {
            var ctor = getConstructorOf(value);
            if (ctor)
                return ctor.getName() || 'Object';
        }

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
        return __API.ClassDescriptor.isClassConstructor(type)
            || __API.InterfaceDescriptor.isInterfaceProxy(type)
            || __API.isEnum(type)
            || __API.isIdentifier(type)
            || ArrayOfDescriptor.isArrayOfDescriptor(type);
    }

    function isImportedType(type) {
        return false;
    }

    function isType(type) {
        return isBuildInType(type) || isCustomType(type) || isImportedType(type);
    }

    function castAs(instance, to) {
        if (__API.ClassDescriptor.isClassConstructor(to) && instance instanceof __API.Class) {
            var scopes = instance.__scopesStack;
            if (Array.isArray(scopes) && scopes.length > 0 && scopes[0] instanceof to)
                return to.__classDescriptor.queryClassProxy(scopes
                    , getConstructorOf(scopes[0]).__classDescriptor
                    , __API.Visibility.Public, 0);
        }

        return null;
    }

    function castTo(instance, to) {
        var casted = castAs(instance, to);
        if (casted === null)
            throw Error('Can not cast ' + getIdentifierOfValue(instance) + ' to ' + getIdentifierOfType(to));

        return casted;
    }

    ria.defineConst(__API, {
        /** @class ria.__API.getProtoOf */
        getProtoOf: getProtoOf,
        /** @class ria.__API.getConstructorOf */
        getConstructorOf: getConstructorOf,
        /** @class ria.__API.getIdentifierOfType */
        getIdentifierOfType: getIdentifierOfType,
        /** @class ria.__API.getIdentifierOfValue */
        getIdentifierOfValue: getIdentifierOfValue,
        /** @class ria.__API.isBuildInType */
        isBuildInType: isBuildInType,
        /** @class ria.__API.isCustomType */
        isCustomType: isCustomType,
        /** @class ria.__API.isImportedType */
        isImportedType: isImportedType,
        /** @class ria.__API.isType */
        isType: isType,
        /** @class ria.__API.castAs */
        castAs: castAs,
        /** @class ria.__API.castTo */
        castTo: castTo
    });
})(ria.__API, ria);