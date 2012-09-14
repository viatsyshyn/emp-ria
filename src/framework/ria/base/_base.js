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

(function () {
    "use strict";

    ria.__API.Void;

    function TypeOf(type) {}

    /**
     * @param {String} name
     * @param {ANY} ret
     * @param {ANY[]} argsTypes
     * @param {String[]} argsNames
     * @constructor
     */
    function DelegateDescriptor(name, ret, argsTypes, argsNames) {
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
                //TODO ria.__API.verifyArguments(args, DelegateProxy.__META);
                var res = fn.apply(this, args);
                //TODO ria.__API.verifyReturn(res, DelegateProxy.__META);
                return res;
            }
        }

        DelegateProxy.__META = new DelegateDescriptor(name, ret_, argsTypes_, argsNames_);

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
     * @param {TypeOf(CLass)} clazz
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
            instance = getInstanceOf(clazz);

        //#ifdef DEBUG
        var publicInstance = instance;
        instance = getInstanceOf(clazz);
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

    //#ifdef DEBUG
    Object.freeze(ria.__API);
    //#endif
})();
