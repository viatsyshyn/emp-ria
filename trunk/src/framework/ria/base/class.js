/** @namespace ria.__API */
ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    function TypeOf(type) {}


    /**
     * @param {String} name
     * @param {Function} base
     * @param {Function[]} ifcs
     * @param {Annotation[]} anns
     */
    function ClassDescriptor(name, base, ifcs, anns) {
        this.name = name;
        this.base = base;
        //noinspection JSUnusedGlobalSymbols
        this.ifcs = ifcs;
        //noinspection JSUnusedGlobalSymbols
        this.anns = anns;
        this.properties = {};
        this.methods = {};
        this.ctor = null;
    }

    ClassDescriptor.prototype.addProperty = function (name, ret, anns, setter, getter) {
        this.properties[name] = {
            retType: ret,
            annotations: anns,
            setter: setter,
            getter: getter
        };
    };
    ClassDescriptor.prototype.addMethod = function (impl, name, ret, argsTypes, argsNames, anns) {
        this.methods[name] = {
            impl: impl,
            retType: ret,
            argsNames: argsNames,
            argsTypes:argsTypes,
            annotations: anns
        };
    };
    ClassDescriptor.prototype.setCtor = function (impl, argsTypes, argsNames, anns) {
        this.ctor = {
            impl: impl,
            argsNames: argsNames,
            argsTypes:argsTypes,
            annotations: anns
        }
    };

    ria.__API.ClassDescriptor = ClassDescriptor;

    /**
     * @param {Function} clazz
     * @param {String} name
     * @param {Function} [base_]
     * @param {Function[]} [ifcs_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.clazz = function (clazz, name, base_, ifcs_, anns_) {
        ria.__API.checkArg('clazz', [Function], clazz);

        clazz.__META = new ClassDescriptor(name, base_, ifcs_, anns_);
        if (base_)
            ria.__API.extend(clazz, base_);
    };

    /**
     * @param {Function} clazz
     * @param {String} name
     * @param {*} [ret_]
     * @param {*[]} [anns_]
     */
    ria.__API.property = function (clazz, name, ret_, anns_, getter, setter) {
        ria.__API.checkArg('clazz', [ClassDescriptor], clazz.__META);

        getter.__META = new ria.__API.MethodDescriptor('', ret_, [], []);
        setter.__META = new ria.__API.MethodDescriptor('', ria.__SYNTAX.Modifiers.VOID, [ret_], ['value']);
        clazz.__META.addProperty(name, ret_, anns_, getter, setter);
    };

    /**
     * @param {Function} clazz
     * @param {Function} impl
     * @param {String} name
     * @param {*} [ret_]
     * @param {Array} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.method = function (clazz, impl, name, ret_, argsTypes_, argsNames_, anns_) {
        ria.__API.checkArg('clazz', [ClassDescriptor], clazz.__META);

        clazz.__META.addMethod(impl, name, ret_, argsTypes_, argsNames_, anns_);

        impl.__META = new ria.__API.MethodDescriptor(name, ret_, argsTypes_, argsNames_);

        //#ifdef DEBUG
            Object.freeze(impl);
        //#endif
    };

    /**
     * @param {Function} clazz
     * @param {Function} impl
     * @param {Array} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.ctor = function (clazz, impl, argsTypes_, argsNames_, anns_) {
        ria.__API.checkArg('clazz', [ClassDescriptor], clazz.__META);

        clazz.__META.setCtor(impl, argsTypes_, argsNames_, anns_);

        impl.__META = new ria.__API.MethodDescriptor('$', undefined, argsTypes_, argsNames_);
        //#ifdef DEBUG
            Object.freeze(impl);
        //#endif
    };

    /**
     * @param {Object} instance
     * @param {Function} clazz
     * @param {Function} ctor
     * @param {Arguments} args
     * @return {Object}
     */
    ria.__API.init = function (instance, clazz, ctor, args) {
        if ((!instance instanceof clazz))
            instance = ria.__API.getInstanceOf(clazz);

        var publicInstance = instance;
        //#ifdef DEBUG
            instance = ria.__API.getInstanceOf(clazz);
            publicInstance.__PROTECTED = instance;
        //#endif

        for(var k in instance) {
            var f_ = instance[k];
            if (typeof f_ === 'function' && f_ !== ctor && k !== 'constructor') {
                instance[k] = f_.bind(instance);
                //#ifdef DEBUG
                    if (f_.__META) {
                        var fn = ria.__API.getTypeHintDecorator(f_.__META, instance, f_);
                        Object.defineProperty(instance, k, { writable : false, configurable: false, value: fn });
                        publicInstance[k] = !f_.__META.isProtected() ? fn : undefined; // TODO: maybe throw Exception on call
                    }
                //#endif
            }
        }

        //#ifdef DEBUG
            instance.$ = undefined;
            publicInstance.$ = undefined;

            ctor = ria.__API.getTypeHintDecorator(ctor.__META, instance, ctor);
        //#endif

        // TODO: set fields of properties with null

        ctor.apply(instance, args);

        //#ifdef DEBUG
            Object.seal(instance);
            Object.freeze(publicInstance);
        //#endif

        return publicInstance;
    };

    ria.__API.compile = function(clazz) {
        ria.__API.checkArg('clazz', [ClassDescriptor], clazz.__META);
        //#ifdef DEBUG
            Object.freeze(clazz);
        //#endif
    };

    ria.__API.Class = (function () {
        function Class() { ria.__API.init(this, Class, Class.prototype.$, arguments); }
        ria.__API.clazz(Class, 'Class', null, [], []);

        Class.prototype.$ = function () {
            this.hashCode = Math.random().toString(36);
            //#ifdef DEBUG
                Object.defineProperty(this, 'hashCode', {writable: false, configurable: false});
            //#endif
        };
        ria.__API.ctor(Class, Class.prototype.$, [], [], []);

        Class.prototype.getClass = function () { return ria.__API.getConstructorOf(this); };
        ria.__API.method(Class, Class.prototype.getClass, 'getClass', Function, [], [], []);

        Class.prototype.getHashCode = function () { return this.hashCode; };
        ria.__API.method(Class, Class.prototype.getHashCode, 'getHashCode', String, [], [], []);

        Class.prototype.equals = function (other) { return this.getHashCode() === other.getHasCode(); };
        ria.__API.method(Class, Class.prototype.equals, 'equals', Boolean, [Class], ['other'], []);

        ria.__API.compile(Class);
        return Class;
    })
})();