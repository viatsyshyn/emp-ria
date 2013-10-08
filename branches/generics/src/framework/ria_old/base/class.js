var BASE, SELF;

/** @namespace hwa.__API */
(function () {
    "use strict";

    var prettyStackTraces = false;

    //noinspection BadExpressionStatementJS
    false && (Object.prototype.BASE = undefined);

    var parser = hwa.__API.parser;
    /** @class Visibility */
    var Visibility = hwa.__API.Visibility;
    var Modifiers = hwa.__API.Modifiers;

    function inheritFrom(superClass) {
        function InheritanceProxyClass() {}

        InheritanceProxyClass.prototype = superClass.prototype;
        return new InheritanceProxyClass();
    }

    function extend(subClass, superClass) {

        subClass.prototype = inheritFrom(superClass);
        subClass.prototype.constructor = subClass;

        subClass.super_ = superClass.prototype;
    }

    function getInstanceOf(ctor, name) {
        var f = function InstanceOfProxy() {};
        if (prettyStackTraces)
            f = new Function('return ' + f.toString().replace('InstanceOfProxy', name))();

        f.prototype = ctor.prototype;
        return new f();
    }

    /**
     * @constructor
     * @param {Array} interfaces
     */
    function ImplementsDescriptor(interfaces) {
        this.interfaces = interfaces;
        Object.freeze(this);
    }

    /**
     *
     * @param {Array} args
     * @returns ImplementsDescriptor
     */
    ImplementsDescriptor.build = function (args) {
        if (args.length < 1)
            throw Error('Expected at least one interface to implement.');

        var ifcs = [];
        for(var index = 0; index < args.length; index++) {
            var ifc = args[index];
            if (typeof ifc !== 'function' || !(ifc.__interfaceDescriptor instanceof hwa.__API.InterfaceDescriptor))
                throw Error('Expected INTERFACE to implement');

            ifcs.push(ifc.__interfaceDescriptor);
        }

        return new ImplementsDescriptor(ifcs);
    };

    /** @class hwa.__API.ImplementsDescriptor */
    hwa.__API.ImplementsDescriptor = ImplementsDescriptor;

    function ExtendsDescriptor(clazz) {
        this.clazz = clazz;
        Object.freeze(this);
    }

    ExtendsDescriptor.build = function (args) {
        if (args.length > 1 || args.length < 1)
            throw Error('Expected exactly one class to derive from.');

        var clazz = args[0];
        if (typeof clazz != 'function' || !(clazz.__classDescriptor instanceof ClassDescriptor))
            throw Error('Expected CLASS to derive from');

        return new ExtendsDescriptor(clazz.__classDescriptor);
    };

    /** @class hwa.__API.ExtendsDescriptor */
    hwa.__API.ExtendsDescriptor = ExtendsDescriptor;

    function ensureBaseConstructorCall(ctor) {
        var body = ctor.toString();
        if (BASE !== undefined && !(/[^a-z0-9\.]BASE(\.__constructor)?\s*\(/.test(body)) && !(/[^a-z0-9\.]this(\.__constructor)?\s*\(/.test(body)))
            BASE();
    }

    /**
     * @class ClassDescriptor
     * @constructor
     * @param {String} name
     * @param {Object} base
     * @param {Array} interfaces
     * @param {Array} methods
     * @param {Array} annotations
     */
    function ClassDescriptor(name, base, interfaces, methods, annotations, flags) {
        this.name = name;
        this.base = base;
        this.interfaces = interfaces;
        this.annotations = annotations;
        this.flags = flags;
        this.children = [];
        this.properties = [];

        this.properties = [];
        this.methods = [];
        for (var index = 0; index < methods.length; index++) {
            var descriptor = methods[index];
            if (descriptor instanceof hwa.__API.MethodDescriptor)
                this.methods.push(descriptor);
            else if (descriptor instanceof hwa.__API.PropertyDescriptor)
                this.properties.push(descriptor);
        }

        this.ensureGettersAndSetters();
        this.ensureDefaultConstructor();
        this.ensureInterfaceMethodsImplemented();

        this.ctor = this.getClassConstructor();

        this.replaceSELF();

        Object.freeze(this);

        if (this.base)
            this.base.children.push(this);
    }

    ClassDescriptor.prototype.replaceSELF = function () {
        var index = this.methods.length;
        for(;index > 0; index--)
            this.methods[index - 1].postProcessSELF(this.ctor);

        index = this.properties.length;
        for(;index > 0; index--)
            this.properties[index - 1].postProcessSELF(this.ctor);

    };

    ClassDescriptor.prototype.ensureDefaultConstructor = function () {
        var index = this.methods.length;
        for(;index > 0; index--) {
            if (this.methods[index - 1].name == CONSTRUCTOR_NAME)
                return;
        }

        var ctor = function __constructor() {};
        if (this.base) {
            var ctors = this.base.queryConstructorMethod([], Visibility.Protected);
            if (ctors.length == 0)
                throw Error('Can NOT create default constructor because parent has no visible default constructor');

            if (ctors.length != 1)
                return;

            ctor = function __constructor() { BASE(); };
        }

        this.methods.push(hwa.__API.parser.parseMember([ctor], Visibility.Public));
    };

    ClassDescriptor.prototype.ensureGettersAndSetters = function () {
        var methods;
        for (var index = 0; index < this.properties.length; index++) {
            var property = this.properties[index];
            methods = this.queryOwnMethodBySignature(property.getterName, [], property.visibility);
            if (methods.length == 0) {
                var getterBody = function () { return function getPropertyName() {return this['name'];}; }
                    .getBody().replace('getPropertyName', property.getterName).replace('name', property.name);
                var getter = new Function (getterBody.substr(1, getterBody.length - 2))();
                this.methods.push(hwa.__API.parser.parseMember([property.type, getter], property.visibility));
            }

            methods = this.queryOwnMethodBySignature(property.setterName, [property.type], property.visibility);
            if (methods.length == 0) {
                var setterBody = function () { return function setPropertyName(value) {this['name']=value;}; }
                    .getBody().replace('setPropertyName', property.setterName).replace('name', property.name);
                var setter = new Function (setterBody.substr(1, setterBody.length - 2))();
                this.methods.push(hwa.__API.parser.parseMember([[property.type], Modifiers.VOID, setter], property.visibility));
            }
        }
    };

    ClassDescriptor.prototype.ensureInterfaceMethodsImplemented = function () {
        // TODO: requires implementation
    };

    ClassDescriptor.prototype.ensureAbstractMethods = function () {
        // TODO: requires implementation
    };

    ClassDescriptor.prototype.ensureNoEqualsMethods = function () {
        // TODO: requires implementation
    };

    ClassDescriptor.prototype.queryOwnMethodBySignature = function(name, hints, visibility) {
        var classScopeDescriptor = this;
        var methods = {};
        var methodClassScope = {};
        var inClassScope = {};
        var scopeDepth = 0;
        var inClassScopeFlag = false;
        var providedParamsCount = hints.length;

        var classMethods = classScopeDescriptor.methods;

        var results = [];
        methods: for (var index = classMethods.length - 1; index >= 0 ; index--) {
            var md = classMethods[index];

            if ( (md.visibility > visibility)
              || (md.rpc > providedParamsCount)
              || (md.rpc < providedParamsCount) // TODO: add support for var_args; && !md.hasVarArgs
              || (md.name !== name) )
                continue;

            for (var i = 0; i < md.argsInfo.length; i++)
                if (md.argsInfo[index] != hints[index])
                    continue methods;

            results.push(md);
        }

        return results;
    };

    /**
     * @param {Array} args
     */
    ClassDescriptor.prototype.createClassInstance = function (args) {
        var instance = getInstanceOf(this.ctor);
        this.ctor.apply(instance, args);
        return instance;
    };

    ClassDescriptor.prototype.getClassConstructor = function () {
        var classDescriptor = this;
        var ctor = function ConstructorProxy(instance) { /**@class ConstructorProxy */
            if (!(this instanceof ConstructorProxy))
                throw Error('fatal error: expected new with constructor call');

            return classDescriptor.initializeClassInstance(this, [].slice.call(arguments)) && this;
        };

        if (prettyStackTraces) {
            ctor = new Function('classDescriptor',
                'return ' + ctor.toString().replace(/ConstructorProxy/g, classDescriptor.name))(classDescriptor);
        }

        ctor.__classDescriptor = this;

        if (this.base)
            extend(ctor, this.base.ctor || Object);

        // TODO: attach static methods

        return ctor;
    };

    function checkArgumentHinting(value, type) {
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

                if (hwa.__API.ArrayOfDescriptor.isArrayOfDescriptor(type)) {
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
                }

                return value === type || value instanceof type;
        }
    }

    ClassDescriptor.prototype.preResolveMethodCall = function (name, visibility, classDescriptor, minDepth) {
        var classScopeDescriptor = this;
        var methods = {};
        var inClassScope = {};
        var scopeDepth = 0;
        var classScope = classDescriptor;
        var inClassScopeFlag = false;
        var methodScopeDepths = {};

        while (classScope) {
            inClassScopeFlag = inClassScopeFlag || classScope == classScopeDescriptor;

            var classMethods = classScope.methods;

            for (var index = classMethods.length - 1; index >= 0 ; index--) {
                var md = classMethods[index];

                if ( (scopeDepth < minDepth)
                  || (md.visibility > visibility)
                  || (md.name !== name) )
                    continue;

                inClassScope[md._fullSignature] = inClassScopeFlag;

                if (methods[md._fullSignature])
                    continue;

                methods[md._fullSignature] = md;
                methodScopeDepths[md._fullSignature] = scopeDepth;
            }

            scopeDepth++;
            classScope = classScope.base;
        }

        var results = [];
        for(var key in inClassScope)
            if (inClassScope.hasOwnProperty(key) && inClassScope[key])
                results.push(methods[key]);

        return [results, methodScopeDepths];
    };

    ClassDescriptor.prototype.postResolveMethodCall = function (methodsInfo, args) {
        var providedParamsCount = args.length;
        var results = [];
        var methods = [].slice.call(methodsInfo[0]);
        var methodScopeDepth = methodsInfo[1];
        methods: for (var index = methods.length - 1; index >= 0 ; index--) {
            var md = methods[index];

            // TODO: add support for var_args; && !md.hasVarArgs
            if ( (md.rpc > providedParamsCount)
              || (md.rpc < providedParamsCount))
                continue;

            var hints = md.argsInfo;
            for (var i = 0; i < hints.length; i++)
                if (!checkArgumentHinting(args[i], hints[i] || Object))
                    continue methods;

            md.scopeDepth = methodScopeDepth[md._fullSignature];
            results.push(md);
        }

        if (results.length != 1) {
            var msg = 'No suitable overload found';
            if (results.length > 1)
                msg = 'Too many suitable overloads';

            throw Error(msg + '.'
                + '\nCalled with args: '
                + args.map(function (i) { return hwa.__API.getIdentifierOfValue(i); }).join(', ')
                + '\nAvailable overloads:\n  '
                + methods.map(function (i) { return i.getMethodFullSignature(true); }).join('\n  '));
        }

        return results[0];
    };

    function getNamedWrapper(name, fn) {
        return new Function('f', 'return function ' + name + 'Proxy(){return f.apply(this, arguments);}')(fn);
    }
    
    ClassDescriptor.prototype.getCallProxy = function getCallProxy(classScope, scopes, name, visibility, minDepth) {

        var methods = classScope.preResolveMethodCall(name, visibility, this, minDepth);

        var MethodCallProxy = function MethodCallProxy() {
            var oldB = BASE;
            var oldS = SELF;
            try {
                var args = [].slice.call(arguments);
                var method = classScope.postResolveMethodCall(methods, args);
                BASE = scopes[method.scopeDepth] ? scopes[method.scopeDepth].BASE : undefined;
                SELF = classScope.ctor;

                var result = method.body.apply(scopes[method.scopeDepth], args);

                if (method.retType === undefined && result !== undefined)
                    throw Error('Method "' + method.getMethodFullSignature(true) + '" expects no return, but got '
                        + hwa.__API.getIdentifierOfValue(result) );

                if (method.retType !== undefined) {
                    if (!checkArgumentHinting(result, method.retType)) {
                        throw Error('Method "' + method.getMethodFullSignature(true) + '" expected to return ' +
                            hwa.__API.getIdentifierOfType(method.retType) + ', but got '
                            + hwa.__API.getIdentifierOfValue(result));
                    }

                    return result;
                }

            } finally {
                BASE = oldB;
                SELF = oldS;
            }
        };

        return prettyStackTraces
            ? getNamedWrapper(name, MethodCallProxy)
            : MethodCallProxy;
    };

    var CONSTRUCTOR_NAME = '__constructor';

    /**
     *
     * @param {Array} args
     */
    ClassDescriptor.prototype.queryConstructorMethod = function (args, visibility) {
        var classDescriptor = this;
        var providedParamsCount = args.length;

        var classMethods = classDescriptor.methods;
        var results = [];
        methods: for (var index = classMethods.length - 1; index >= 0 ; index--) {
            var md = classMethods[index];

            if ( (md.visibility > visibility)
              || (md.rpc > providedParamsCount)
              || (md.rpc < providedParamsCount) // TODO: add support for var_args; && !md.hasVarArgs
              || (md.name !== CONSTRUCTOR_NAME) )
                continue;

            var hints = md.argsInfo;
            for (var i = 0; i < hints.length; i++)
                if (!checkArgumentHinting(args[i], hints[i] || Object))
                    continue methods;

            results.push(md);
        }

        return results;
    };

    ClassDescriptor.prototype.queryMethodsNames = function queryMethodsNames(visibility) {
        var classDescriptor = this;
        var names = {};

        var classScope = classDescriptor;
        while (classScope) {
            var methods = classScope.methods;
            for(var index = methods.length - 1; index >= 0; index-- ) {
                var md = methods[index];
                if (md.name == CONSTRUCTOR_NAME)
                    continue;

                if (md.visibility <= visibility)
                    names[md.name] = true;
            }

            classScope = classScope.base;
            visibility = Math.min(visibility, Visibility.Protected.valueOf());
        }

        return Object.keys(names);
    };

    ClassDescriptor.prototype.preResolveConstructorCall = function (visibility) {
        var classDescriptor = this;
        var classMethods = classDescriptor.methods;
        var results = [];
        for (var index = classMethods.length - 1; index >= 0 ; index--) {
            var md = classMethods[index];

            if ( (md.visibility > visibility)
                || (md.name !== CONSTRUCTOR_NAME) )
                continue;

            results.push(md);
        }

        return results;
    };

    ClassDescriptor.prototype.getConstructorCallProxy = function getConstructorCallProxy(classScope, scopes, visibility, scopeDepth) {
        var ctors = classScope.preResolveConstructorCall(visibility);

        var ConstructorClassProxy = function ConstructorCallProxy() {
            var args = [].slice.call(arguments);
            var ctor = classScope.postResolveMethodCall([ctors, []], args);
            var oldB = BASE;
            try {
                BASE = scopes[scopeDepth].BASE;
                ensureBaseConstructorCall(ctor.body);
                ctor.body.apply(scopes[scopeDepth], args);
            } finally {
                BASE = oldB;
            }
        };

        return prettyStackTraces
            ? getNamedWrapper(classScope.name, ConstructorClassProxy)
            : ConstructorClassProxy;
    };

    /**
     * @param {Object} instance
     * @param {Array} args
     * @returns {Object} public proxy to instance
     */
    ClassDescriptor.prototype.initializeClassInstance = function initializeClassInstance(instance, args) {
        var classDescriptor = this;

        // create scopes stack
        var scopes = [];

        var classScope = classDescriptor;
        var scopeDepth = 0;
        // init scopes stack
        while (classScope) {
            var scope = getInstanceOf(classScope.ctor, classScope.name);
            classScope.attachCallResolvers(Visibility.Private, scope, classDescriptor, scopes, 0);

            for(var i = 0; i < classScope.properties.length; i++)
                scope[classScope.properties[i].name] = null;

            if (classScope == Class)
                scope.__CLASS = classDescriptor.ctor;

            var BASE = undefined;
            if (classScope.base) {
                BASE = classDescriptor.getConstructorCallProxy(classScope.base, scopes, Visibility.Protected, scopeDepth + 1);
                classScope.base.attachCallResolvers(Visibility.Protected, BASE, classDescriptor, scopes, scopeDepth + 1);
                Object.freeze(BASE);
            }

            Object.defineProperty(scope, 'BASE', {
                value: BASE,
                writable: false,
                configurable: false,
                enumerable: false
            });

            Object.defineProperty(scope, '__scopesStack', {
                value: scopes,
                writable: false,
                configurable: false,
                enumerable: prettyStackTraces
            });

            if (classScope.base)
                scope[CONSTRUCTOR_NAME] = classDescriptor.getConstructorCallProxy(classScope, scopes, Visibility.Private, scopeDepth);

            scopes.push(scope);
            classScope = classScope.base;
            scopeDepth++;
        }

        // no modification to stack after init
        Object.freeze(scopes);

        var ctor = this.getConstructorCallProxy(classDescriptor, scopes, Visibility.Public, 0);
        ctor.apply(window, args);

        // make scopes not extensible after constructor finished
        for(var index = 0; index < scopes.length; index++) {
            delete scopes[index][CONSTRUCTOR_NAME];
            Object.seal(scopes[index]);
        }

        // query public class interface
        classDescriptor.attachCallResolvers(Visibility.Public, instance, classDescriptor, scopes, 0);

        Object.defineProperty(instance, '__scopesStack', {
            value: scopes,
            writable: false,
            configurable: false,
            enumerable: prettyStackTraces
        });

        Object.freeze(instance);
        return instance;
    };

    /**
     * @param {Array} scopes
     * @param {Visibility} visibility
     * @returns Object
     */
    ClassDescriptor.prototype.queryClassProxy = function queryClassProxy(scopes, classScope, visibility, minDepth) {
        var classDescriptor = this;
        var proxy = getInstanceOf(classDescriptor.ctor);
        if (classScope != undefined)
            classScope.attachCallResolvers(visibility, proxy, classDescriptor, scopes, minDepth);

        Object.freeze(proxy);
        return proxy;
    };

    ClassDescriptor.prototype.attachCallResolvers = function attachCallResolvers(visibility, scope, classDescriptor, scopes, minDepth) {
        var classScopeDescriptor = this;
        // bind methods to scopes with appropriate visibility level
        var methods = [].slice.call(classScopeDescriptor.queryMethodsNames(visibility));
        while (methods.length > 0) {
            var name = methods.pop();
            Object.defineProperty(scope, name, {
                value: classDescriptor.getCallProxy(classScopeDescriptor, scopes, name, visibility, minDepth),
                writable: false,
                enumerable: false,
                configurable: false
            });
        }
    };

    /**
     *
     * @param {Array} args
     * @returns ClassDescriptor
     */
    ClassDescriptor.build = function getClassDescriptor(args, baseDef) {
        var name;
        var base = baseDef || Class;
        var interfaces = [];
        var members = args.pop();
        if (!Array.isArray(members))
            throw Error('Expected class declaration array as last argument.');

        name = args.pop();
        if (name instanceof ImplementsDescriptor) {
            interfaces = name.interfaces;
            name = args.pop();
        }

        if (name instanceof ExtendsDescriptor) {
            base = name.clazz;
            // TODO: ensure that base is descedant of baseDef
            name = args.pop();
        }

        if (typeof name !== 'string')
            throw Error('Expected name as string literal.');

        var flags = {
            visibility: Visibility.Public,
            isStatic: false,
            isAbstract: false
        };
        parser.parseModifiers(args, flags);

        var annotations = parser.parseAnnotations(args);
        var methods = parser.parseMembers(members, Visibility.Private);

        return new ClassDescriptor(name, base, interfaces, methods, annotations, flags);
    };

    ClassDescriptor.isClassConstructor = function isClassConstructor(ctor) {
        return ctor
            && typeof ctor === 'function'
            && ctor.hasOwnProperty('__classDescriptor')
            && ctor.__classDescriptor instanceof hwa.__API.ClassDescriptor
    };

    Object.freeze(ClassDescriptor);
    
    /** @class hwa.__API.ClassDescriptor */
    hwa.__API.ClassDescriptor = ClassDescriptor;

    var globalHashCodeCounter = Math.ceil(Math.random() * 1000000000);

    var Class = ClassDescriptor.build([
        Modifiers.ABSTRACT, 'Class', [
            Modifiers.PUBLIC, function __constructor() {
                this.__HASHCODE = new Number(globalHashCodeCounter++).toString(36);
            },

            Modifiers.PUBLIC, String, function getHashCode() {
                return this.__HASHCODE;
            },

            Modifiers.PUBLIC, Function, function getClass() {
                return this.__CLASS;
            },

            [Object],
            Modifiers.PUBLIC, Boolean, function equals(o) {
                return (o instanceof Class.ctor) ? this.getHashCode() === o.getHashCode() : this == o;
            }
        ]
    ]);

    /** @class hwa.__API.Class */
    hwa.__API.Class = Class.ctor;
    hwa.__API.setPrettyStackTraces = function (value) {
        prettyStackTraces = value === true;
    };
})();