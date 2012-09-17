/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 14.09.12
 * Time: 21:45
 * To change this template use File | Settings | File Templates.
 */

var ANY = Object;

var ria = {};
ria.__API = {};

ria.__CFG = {
//#ifdef DEBUG
    prettyStackTraces: true,
    checkedMode: true
//#endif
};

(function () {
    "use strict";

    ria.__API.Void;

    ria.__API.getProtoOf = function (v) {
        return Object.getPrototypeOf(v) || v.prototype || v.__proto__;
    };

    ria.__API.getConstructorOf = function (v) {
        return getProtoOf(v).constructor;
    };

    ria.__API.inheritFrom = function (superClass) {
        function InheritanceProxyClass() {}

        InheritanceProxyClass.prototype = superClass.prototype;
        return new InheritanceProxyClass();
    };

    ria.__API.extend = function (subClass, superClass) {
        subClass.prototype = ria.__API.inheritFrom(superClass);
        subClass.prototype.constructor = subClass;

        subClass.super_ = superClass.prototype;
    };

    ria.__API.getInstanceOf = function (ctor, name) {
        var f = function InstanceOfProxy() {};
        //#ifdef DEBUG
            if (ria.__CFG.prettyStackTraces)
                f = new Function('return ' + f.toString().replace('InstanceOfProxy', name))();
        //#endif

        f.prototype = ctor.prototype;
        return new f();
    };

    function TypeOf(type) {}

    /**
     * @param {String} name
     * @param {ANY} ret
     * @param {ANY[]} argsTypes
     * @param {String[]} argsNames
     * @constructor
     */
    function MethodDescriptor(name, ret, argsTypes, argsNames) {
        this.name = name;
        this.ret = ret;
        this.argsTypes = argsTypes;
        this.argsNames = argsNames;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    /**
     * @param {String} name
     * @param {ANY} [ret_]
     * @param {ANY[]} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @return {Function}
     */
    ria.__API.delegate = function (name, ret_, argsTypes_, argsNames_) {
        function DelegateProxy(fn) {
            // TODO ensure args names & count
            return function () {
                var args = [].slice.call(arguments);
                //#ifdef DEBUG
                    ria.__API.checkArgs(argsNames_, argsTypes_, args);
                //#endif
                var res = fn.apply(this, args);
                //#ifdef DEBUG
                    ria.__API.checkReturn(ret_, res);
                //#endif
                return res;
            }
        }

        DelegateProxy.__META = new MethodDescriptor(name, ret_, argsTypes_, argsNames_);

        //#ifdef DEBUG
            Object.freeze(DelegateProxy);
        //#endif
        return DelegateProxy;
    };

    /**
     * @param {String} name
     * @param {ANY[]} argsTypes
     * @param {String[]} argsNames
     * @constructor
     */
    function AnnotationDescriptor(name, argsTypes, argsNames) {
        this.name = name;
        this.argsNames = argsNames;
        this.argsTypes = argsTypes;

        //#ifdef DEBUG
            Object.freeze(this);
        //#endif
    }

    /**
     * @param {String} name
     * @param {ANY[]} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @return {Function}
     */
    ria.__API.annotation = function(name, argsTypes_, argsNames_) {
        function AnnotationProxy() {

        }

        AnnotationProxy.__META = new AnnotationDescriptor(name, argsTypes_, argsNames_);

        //#ifdef DEBUG
            Object.freeze(AnnotationProxy);
        //#endif
        return AnnotationProxy;
    };

    /**
     * @param {String} name
     * @constructor
     */
    function InterfaceDescriptor(name) {
        this.name = name;
    }

    InterfaceDescriptor.prototype.addMethod = function (name, ret, argsTypes, argsNames, anns) {};

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__API.ifc = function(name) {
        function InterfaceProxy() {
            // TODO instantiate anonymous implementation
            return null;
        }

        InterfaceProxy.__META = new InterfaceDescriptor(name);

        return InterfaceProxy;
    };

    /**
     * @param {String} name
     * @param {TypeOf(Class)} base
     * @param {TypeOf(Interface)[]} ifcs
     * @param {Annotation[]} anns
     */
    function ClassDescriptor(name, base, ifcs, anns) {
        this.name = name;
        this.base = base;
        this.ifcs = ifcs;
        this.anns = anns;
    }

    ClassDescriptor.prototype.addProperty = function (name, ret, anns) {};
    ClassDescriptor.prototype.addMethod = function (impl, name, ret, argsTypes, argsNames, anns) {};
    ClassDescriptor.prototype.setCtor = function (impl, argsTypes, argsNames, anns) {};

    /**
     * @param {TypeOf(Class)} clazz
     * @param {String} name
     * @param {TypeOf(Cass)} [base_]
     * @param {TypeOf(Interface)[]} [ifcs_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.clazz = function (clazz, name, base_, ifcs_, anns_) {
        clazz.__META = new ClassDescriptor(name, base_, ifcs_, anns_);
    };

    /**
     * @param {TypeOf(Class)} clazz
     * @param {String} name
     * @param {ANY} [ret_]
     * @param {AnnotationProxy[]} [anns_]
     */
    ria.__API.property = function (clazz, name, ret_, anns_) {
        if (!(clazz.__META instanceof ClassDescriptor))
            throw Error();

        clazz.__META.addProperty(name, ret_, anns_);
    };

    /**
     * @param {Class|Interface} clazz
     * @param {Function} impl
     * @param {String} name
     * @param {ANY} [ret_]
     * @param {ANY[]} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.method = function (clazz, impl, name, ret_, argsTypes_, argsNames_, anns_) {
        if (clazz.__META instanceof InterfaceDescriptor) {
            clazz.__META.addMethod(name, ret_, argsTypes_, argsNames_, anns_);
            return;
        }

        if (!(clazz.__META instanceof ClassDescriptor))
            throw Error();

        clazz.__META.addMethod(impl, name, ret_, argsTypes_, argsNames_, anns_);
    };

    /**
     * @param {Class} clazz
     * @param {Function} impl
     * @param {ANY[]} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.ctor = function (clazz, impl, argsTypes_, argsNames_, anns_) {
        if (!(clazz.__META instanceof ClassDescriptor))
            throw Error();

        clazz.__META.setCtor(impl, argsTypes_, argsNames_, anns_);
    };

    /**
     * @param {Class} instance
     * @param {Function} clazz
     * @param {Function} ctor
     * @param {Arguments} args
     * @return {Class}
     */
    ria.__API.init = function (instance, clazz, ctor, args) {
        if ((!instance instanceof clazz))
            instance = ria.__API.getInstanceOf(clazz);

        //#ifdef DEBUG
            var publicInstance = instance;
            instance = ria.__API.getInstanceOf(clazz);
            publicInstance.__PROTECTED = instance;
        //#endif

        for(var k in instance) if (typeof instance[k] === 'function' ) {
            var fn = instance[k].bind(instance);
            instance[k] = fn;
            //#ifdef DEBUG
                Object.defineProperty(instance, k, { writable : false });
                publicInstance[k] = fn;
            //#endif
        }

        var res = ctor.apply(instance, args);
        if (res !== undefined)
            throw Error();

        //#ifdef DEBUG
            Object.seal(instance);
            Object.freeze(publicInstance);
        //#endif

        return instance;
    };

    ria.__API.compile = function(clazz) {
        //#ifdef DEBUG
            Object.freeze(clazz);
        //#endif
    };

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

    ria.__API.checkArg = function (name, type, value) {
        //#ifdef DEBUG
            var isOptional = name.match(/^.+\_$/);
            if (value === undefined && isOptional)
                return;

            if (value === undefined && !isOptional)
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

    ria.__API.checkArgs = function (names, types, values) {
        //#ifdef DEBUG
            if (values.length > names.length)
                throw Error('Too many arguments passed');

            for(var index = 0; index < names.length; index++) {
                ria.__API.checkArg(names[index], types[index] || Object, values[index]);
            }
        //#endif
    };

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

    //#ifdef DEBUG
        Object.freeze(ria.__API);
    //#endif
})();
