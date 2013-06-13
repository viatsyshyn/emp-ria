/**
 * Created with JetBrains WebStorm.
 * User: Volodymyr
 * Date: 18.09.12
 * Time: 10:35
 * To change this template use File | Settings | File Templates.
 */

/** @namespace ria */
var ria = ria || {};

/** @namespace ria.__API */
ria.__API = ria.__API || {};

(function () {
    "use strict";

    /**
     * Retuns prototype of given constuctor or object
     * @param {Function|Object} v
     * @return {*}
     */
    ria.__API.getPrototypeOf = function (v) {
        return Object.getPrototypeOf(v) || v.prototype || v.__proto__;
    };

    /**
     * Returns constructor of given object
     * @param {Object} v
     * @return {Function}
     */
    ria.__API.getConstructorOf = function (v) {
        return ria.__API.getPrototypeOf(v).constructor;
    };

    /**
     * Inherit from given class
     * @param {Function} superClass
     * @return {Object}
     */
    ria.__API.inheritFrom = function (superClass) {
        function InheritanceProxyClass() {}

        InheritanceProxyClass.prototype = superClass.prototype;
        return new InheritanceProxyClass();
    };

    /**
     * Inherit subClass from superClass
     * @param {Function} subClass
     * @param {Function} superClass
     */
    ria.__API.extend = function (subClass, superClass) {
        subClass.prototype = ria.__API.inheritFrom(superClass);
        subClass.prototype.constructor = subClass;

        subClass.super_ = superClass.prototype;
    };

    /**
     * Instantiate object from ctor without call to ctor
     * @param {Function} ctor
     * @param {String} [name_]
     * @return {Object}
     */
    ria.__API.getInstanceOf = function (ctor, name_) {
        var f = function InstanceOfProxy() {
            this.constructor = ctor;
        };

        if (ria.__CFG.prettyStackTraces)
            f = new Function('ctor', 'return ' + f.toString().replace('InstanceOfProxy', name_))(ctor);

        f.prototype = ctor.prototype;
        return new f();
    };

    /**
     * Get string name of given type
     * @param {Object} type
     * @return {String}
     */
    ria.__API.getIdentifierOfType = function (type) {
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

        return type.name || 'UnknownType';
    };

    /**
     * Get string name of type of given value
     * @param {Object} value
     * @return {String}
     */
    ria.__API.getIdentifierOfValue = function (value) {
        if (value === undefined || value === null)
            return 'void';

        if (typeof value === 'number') return 'Number';
        if (typeof value === 'boolean') return 'Boolean';
        if (typeof value === 'string') return 'String';
        if (typeof value === 'regexp') return 'RegExp';
        if (typeof value === 'date') return 'Date';
        if (typeof value === 'function') return 'Function';

        if (Array.isArray(value)) return 'Array';

        // TODO: fix this
        /*if (ria.__API.isIdentifier(value))
            return ria.__API.getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Identifier';*/

        // TODO: fix this
        /*if (ria.__API.isEnum(value))
            return getConstructorOf(getProtoOf(value)).__IDENTIFIER__ || 'Enum';*/

        /*if (value instanceof __API.Class)
            return getConstructorOf(value).__IDENTIFIER__ || 'Class';*/

        if (value instanceof Object) {
            var ctor = ria.__API.getConstructorOf(value);
            if (ctor)
                return ctor.name || 'Constructor';
        }

        return 'Object';
    };

    ria.__API.clone = function clone(obj) {
        switch(typeof obj) {
            case 'number':
            case 'string':
            case 'boolean':
            case 'regexp':
                return obj;

            default:
                if (Array.isArray(obj) || obj.length === +obj.length)
                    return [].slice.call(obj);

                if ('function' == typeof obj.clone)
                    return obj.clone();

                if (ria.__API.getConstructorOf(obj) !== Object)
                    throw Error('Can not clone instance of ' + ria.__API.getIdentifierOfValue(obj));

                var result = {};
                Object.keys(obj).forEach(function (_) {
                    result[_] = obj[_];
                });

                return result;
        }
    }
})();