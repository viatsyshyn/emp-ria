(function () {
    "use strict";

    //noinspection JSUnusedLocalSymbols
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
        this.ifcs = [].concat.call(base ? base.__META.ifcs : []).concat(ifcs);
        //noinspection JSUnusedGlobalSymbols
        this.anns = anns;
        this.properties = base ? ria.__API.clone(base.__META.properties) : {};
        this.methods = base ? ria.__API.clone(base.__META.methods) : {};
        this.ctor = null;
        this.children = [];
    }

    ClassDescriptor.prototype.addProperty = function (name, ret, anns, getter, setter) {
        this.properties[name] = {
            retType: ret,
            annotations: anns,
            getter: getter,
            setter: setter
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
    ClassDescriptor.prototype.addChild = function (clazz) {
        if (!ria.__API.isClassConstructor(clazz))
            throw Error('Child should be a CLASS');

        if (clazz.__META.base.__META != this)
            throw Error('Child should extend me.');

        this.children.push(clazz);
    };

    ria.__API.ClassDescriptor = ClassDescriptor;

    var clazzRegister = {};

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__API.getClassByName = function(name) {
        return clazzRegister[name];
    };

    /**
     * @param {Function} clazz
     * @param {String} name
     * @param {Function} [base_]
     * @param {Function[]} [ifcs_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.clazz = function (clazz, name, base_, ifcs_, anns_) {
        clazzRegister[name] = clazz;

        clazz.__META = new ClassDescriptor(name, base_, ifcs_, anns_);
        if (base_) {
            ria.__API.extend(clazz, base_);
            base_.__META.addChild(clazz);
        }
    };

    /**
     * @param {Function} clazz
     * @param {String} name
     * @param {*} [propType_]
     * @param {*[]} [anns_]
     * @param {Function} getter
     * @param {Function} setter
     */
    ria.__API.property = function (clazz, name, propType_, anns_, getter, setter) {
        //noinspection JSUndefinedPropertyAssignment
        getter.__META = new ria.__API.MethodDescriptor('', propType_, [], []);
        if (setter)
        { //noinspection JSUndefinedPropertyAssignment
            setter.__META = new ria.__API.MethodDescriptor('', undefined, [propType_], ['value']);
        }
        clazz.__META.addProperty(name, propType_, anns_, getter, setter);
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
        clazz.__META.addMethod(impl, name, ret_, argsTypes_, argsNames_, anns_);

        impl.__META = new ria.__API.MethodDescriptor(name, ret_, argsTypes_, argsNames_);

        _DEBUG && Object.freeze(impl);
    };

    /**
     * @param {Function} clazz
     * @param {Function} impl
     * @param {Array} [argsTypes_]
     * @param {String[]} [argsNames_]
     * @param {Annotation[]} [anns_]
     */
    ria.__API.ctor = function (clazz, impl, argsTypes_, argsNames_, anns_) {
        clazz.__META.setCtor(impl, argsTypes_, argsNames_, anns_);

        impl.__META = new ria.__API.MethodDescriptor('$', undefined, argsTypes_, argsNames_);
        _DEBUG && Object.freeze(impl);
    };

    function ProtectedMethodProxy() {
        throw Error('Can NOT call protected methods');
    }

    /**
     * @param {Object} instance
     * @param {Function} clazz
     * @param {Function} ctor
     * @param {Arguments} args
     * @return {Object}
     */
    ria.__API.init = function (instance, clazz, ctor, args) {
        if (!(instance instanceof clazz))
            instance = ria.__API.getInstanceOf(clazz, clazz.__META.name.split('.').pop());

        var publicInstance = instance;
        if (_DEBUG) {
            instance = ria.__API.getInstanceOf(clazz, clazz.__META.name.split('.').pop());
            publicInstance.__PROTECTED = instance;
        }

        for(var k in instance) {
            //noinspection UnnecessaryLocalVariableJS,JSUnfilteredForInLoop
            var name_ = k;
            var f_ = instance[name_];
            if (typeof f_ === 'function' && f_ !== ctor && k !== 'constructor') {
                instance[name_] = f_.bind(instance);
                if (ria.__CFG.enablePipelineMethodCall && f_.__META) {
                    var fn = ria.__API.getPipelineMethodCallProxyFor(f_, f_.__META, instance);
                    if (_DEBUG) {
                        Object.defineProperty(instance, name_, { writable : false, configurable: false, value: fn });
                        if (f_.__META.isProtected())
                            fn = ProtectedMethodProxy;
                    }
                    publicInstance[name_] = fn;
                    _DEBUG && Object.defineProperty(publicInstance, name_, { writable : false, configurable: false, value: fn });
                }
            }
        }

        if (_DEBUG) {
            instance.$ = undefined;
            publicInstance.$ = undefined;
        }

        if (ria.__CFG.enablePipelineMethodCall && ctor.__META) {
            ctor = ria.__API.getPipelineMethodCallProxyFor(ctor, ctor.__META, instance);
        }


        if (_DEBUG) for(var name in clazz.__META.properties) {
            if (clazz.__META.properties.hasOwnProperty(name)) {
                instance[name] = null;
            }
        }

        ctor.apply(instance, args);

        _DEBUG && Object.seal(instance);
        _DEBUG && Object.freeze(publicInstance);

        return publicInstance;
    };

    ria.__API.compile = function(clazz) {
        _DEBUG && Object.freeze(clazz);
    };

    ria.__API.isClassConstructor = function(type) {
        return type.__META instanceof ClassDescriptor;
    };

    ria.__API.Class = (function () {
        function Class() { ria.__API.init(this, Class, Class.prototype.$, arguments); }
        ria.__API.clazz(Class, 'Class', null, [], []);

        Class.prototype.$ = function () {
            this.hashCode = Math.random().toString(36);
            _DEBUG && Object.defineProperty(this, 'hashCode', {writable: false, configurable: false});
        };
        ria.__API.ctor(Class, Class.prototype.$, [], [], []);

        Class.prototype.getClass = function () { return ria.__API.getConstructorOf(this); };
        ria.__API.method(Class, Class.prototype.getClass, 'getClass', Function, [], [], []);

        Class.prototype.getHashCode = function () { return this.hashCode; };
        ria.__API.method(Class, Class.prototype.getHashCode, 'getHashCode', String, [], [], []);

        Class.prototype.equals = function (other) { return this.getHashCode() === other.getHashCode(); };
        ria.__API.method(Class, Class.prototype.equals, 'equals', Boolean, [Class], ['other'], []);

        ria.__API.compile(Class);
        return Class;
    })();
})();