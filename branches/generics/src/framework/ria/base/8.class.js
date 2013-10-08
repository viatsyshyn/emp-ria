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
    function ClassDescriptor(name, base, ifcs, anns, isAbstract) {
        this.name = name;
        this.base = base;
        //noinspection JSUnusedGlobalSymbols
        this.ifcs = [].concat.call(base ? base.__META.ifcs : []).concat(ifcs);
        //noinspection JSUnusedGlobalSymbols
        this.anns = anns;
        this.isAbstract = isAbstract;
        this.properties = base ? ria.__API.clone(base.__META.properties) : {};
        this.methods = base ? ria.__API.clone(base.__META.methods) : {};
        this.defCtor = null;
        this.ctors = [];
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
    ClassDescriptor.prototype.addCtor = function (name, impl, argsTypes, argsNames, anns) {
        var def = {
            name: name,
            impl: impl,
            argsNames: argsNames,
            argsTypes:argsTypes,
            annotations: anns
        };

        if (name == '$')
            this.defCtor = def;

        this.ctors.push(def);
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
     * @param {Boolean} [isAbstract_]
     */
    ria.__API.clazz = function (clazz, name, base_, ifcs_, anns_, isAbstract_) {
        clazzRegister[name] = clazz;

        clazz.__META = new ClassDescriptor(name, base_, ifcs_, anns_, isAbstract_ || false);
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
    ria.__API.ctor = function (name, clazz, impl, argsTypes_, argsNames_, anns_) {
        clazz.__META.addCtor(name, impl, argsTypes_, argsNames_, anns_);

        impl.__META = new ria.__API.MethodDescriptor(name, undefined, argsTypes_, argsNames_);
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
        if (clazz.__META.isAbstract)
            throw Error('Can NOT instantiate asbtract class ' + clazz.__META.name);

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

            // TODO: skip all ctors
            if (typeof f_ === 'function' && !(/^\$.*/.test(name_)) && name_ !== 'constructor') {
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

            if (_DEBUG && /^\$.*/.test(name_)) {
                instance[name_] = publicInstance[name_] = undefined;
            }
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

    function StaticScope() {}
    var staticScopeInstance = new StaticScope();
    Object.freeze(staticScopeInstance);

    ria.__API.compile = function(clazz) {
        for(var k in clazz) if (clazz.hasOwnProperty(k)) {
            var name_ = k;
            var f_ = clazz[name_];

            // TODO: skip all ctors
            if (typeof f_ === 'function' && ria.__API.isDelegate(f_)) {
                if (ria.__CFG.enablePipelineMethodCall && f_.__META) {
                    clazz[name_] = ria.__API.getPipelineMethodCallProxyFor(f_, f_.__META, staticScopeInstance);
                } else {
                    clazz[name_] = f_.bind(staticScopeInstance);
                }
            }
        }

        _DEBUG && Object.freeze(clazz);
    };

    ria.__API.extends = function ext(child, base) {
        return child === base || (child != undefined && ext(child.__META.base, base));
    };

    ria.__API.isClassConstructor = function(type) {
        return type && (type.__META instanceof ClassDescriptor);
    };

    ria.__API.Class = (function () {
        function ClassBase() { ria.__API.init(this, ClassBase, ClassBase.prototype.$, arguments); }
        ria.__API.clazz(ClassBase, 'Class', null, [], []);

        ClassBase.prototype.$ = function () {
            this.__hashCode = Math.random().toString(36);
            _DEBUG && Object.defineProperty(this, 'hashCode', {writable: false, configurable: false});
        };
        ria.__API.ctor('$', ClassBase, ClassBase.prototype.$, [], [], []);

        ClassBase.prototype.getClass = function () { return ria.__API.getConstructorOf(this); };
        ria.__API.method(ClassBase, ClassBase.prototype.getClass, 'getClass', Function, [], [], []);

        ClassBase.prototype.getHashCode = function () { return this.__hashCode; };
        ria.__API.method(ClassBase, ClassBase.prototype.getHashCode, 'getHashCode', String, [], [], []);

        ClassBase.prototype.equals = function (other) { return this.getHashCode() === other.getHashCode(); };
        ria.__API.method(ClassBase, ClassBase.prototype.equals, 'equals', Boolean, [ClassBase], ['other'], []);

        ria.__API.compile(ClassBase);
        return ClassBase;
    })();
})();