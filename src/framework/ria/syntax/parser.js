/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    /**
     * Checks if type is native js constructor
     * @param {*} type
     * @return {Boolean}
     */
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

    /**
     * Checks if type is ria enabled custom constructor
     * @param {*} type
     * @return {Boolean}
     */
    function isCustomType(type) {
        return ria.__API.isClassConstructor(type)
            || ria.__API.isInterface(type)
            || ria.__API.isEnum(type)
            || ria.__API.isIdentifier(type)
            //|| ArrayOfDescriptor.isArrayOfDescriptor(type)
            ;
    }

    /**
     * Checks if type is ria enabled external constructor
     * @param type
     * @return {Boolean}
     */
    function isImportedType(type) {
        return false;
    }

    /**
     * Check if type is embedded or ria enabled type
     * @param {*} type
     * @return {Boolean}
     */
    function isType(type) {
        return isBuildInType(type) || isCustomType(type) || isImportedType(type);
    }

    function parseName(fn) {
        return fn.name || (fn.toString().substring(9).match(/[a-z0-9_$]+/i) || [])[0] || '';
    }

    function getParameters(fn) {
        var body = fn.toString().substring(8);
        var start = body.indexOf('(');
        var params = body.substring(start + 1, body.indexOf(')', start));
        return params.length > 0 ? params.replace(/ /g, '').split(',') : [];
    }

    var Modifiers = function () {
        function Modifiers() { throw Error(); }
        ria.__API.enum(Modifiers, 'Modifiers');
        function ModifiersImpl(raw) { this.valueOf = function () { return raw; } }
        ria.__API.extend(ModifiersImpl, Modifiers);
        Modifiers.OVERRIDE = new ModifiersImpl(1);
        Modifiers.ABSTRACT = new ModifiersImpl(2);
        Modifiers.VOID = new ModifiersImpl(3);
        Modifiers.SELF = new ModifiersImpl(4);
        Modifiers.FINAL = new ModifiersImpl(5);
        Modifiers.READONLY = new ModifiersImpl(6);
        //#ifdef DEBUG
        Object.freeze(Modifiers);
        //#endif
        return Modifiers;
    }();

    ria.__SYNTAX.Modifiers = Modifiers;

    /**
     * @param {Array} args
     * @return {Object}
     */
    ria.__SYNTAX.parseModifiers = function (args) {
        var flags = {
            isAbstract: false,
            isFinal: false,
            isOverride: false
        };
        while (args.length > 0) {
            var modifier = args.pop();
            if (!(modifier instanceof Modifiers)) {
                args.push(modifier);
                break;
            }

            switch(modifier) {
                case Modifiers.ABSTRACT: flags.isAbstract = true; break;
                case Modifiers.FINAL: flags.isFinal = true; break;
                case Modifiers.OVERRIDE: flags.isOverride = true; break;
                case Modifiers.READONLY: flags.isReadonly = true; break;
            }
        }
        return flags;
    };

    ria.__SYNTAX.parseAnnotations = function (args) {
        var annotations = [];
        while(args.length > 0) {
            var a = args.pop();
            if (!Array.isArray(a) || a.length != 1 || a[0] == undefined || !ria.__API.isAnnotation(a[0]))
                throw Error('Annotation expected, eg [SomeAnnotation] or [SomeAnnotationWithParams("some values here")], or check if annotation is loaded');

            var annotation = a[0];
            if (typeof annotation === 'function')
                annotation = annotation();

            annotations.push(annotation);
        }

        return annotations;
    };

    function MethodDescriptor(name, argsNames, argsTypes, retType, flags, body, annotations) {
        this.name = name;
        this.argsNames = argsNames;
        this.argsTypes = argsTypes;
        this.retType = retType;
        this.body = body;
        this.annotations = annotations;
        this.flags = flags;
    }

    ria.__SYNTAX.MethodDescriptor = MethodDescriptor;

    ria.__SYNTAX.parseMethod = function (args) {
        var body = args.pop();
        var name = parseName(body);
        var argsNames = getParameters(body);
        var argsCount = argsNames.length;

        var retType = null; // ANY
        var argsHints = [];

        if (args.length) {
            retType = args.pop();
            if (retType === undefined )
                throw Error('Expected return type or class of method "' + name + '", but got undefined');

            if (Array.isArray(retType) || ((retType instanceof Modifiers) && retType != Modifiers.VOID && retType != Modifiers.SELF)) {
                args.push(retType);
                retType = null;
            }

            if (retType === Modifiers.VOID) {
                retType = undefined;
            }
        }

        var flags = ria.__SYNTAX.parseModifiers(args);

        if (args.length) {
            argsHints = args.pop();
            if (!Array.isArray(argsHints) || (argsHints.length == 1 && ria.__API.isAnnotation(argsHints[0]))) {
                args.push(argsHints);
                argsHints = [];
            }
        }

        for (var i = 0; i < argsHints.length; i++)
            if (argsHints[i] === undefined)
                throw Error('Expected type or class as hint for argument "' + body.getParameters()[i] + '" of "' + body.getName() + '", but got undefined');

        var annotations = ria.__SYNTAX.parseAnnotations(args);

        while (argsHints.length < argsCount)
            argsHints.push(Object);

        return new MethodDescriptor(name, argsNames, argsHints, retType, flags, body, annotations);
    };

    function capitalize(str) {
        return str.replace(/\w/,function (_1){ return _1.toUpperCase(); });
    }

    function PropertyDescriptor(name, type, annotations, flags) {
        this.name = name;
        this.type = type;
        this.annotations = annotations;
        this.flags = flags;
    }

    PropertyDescriptor.prototype.getGetterName = function () {
        return ((this.type === Boolean) ? 'is' : 'get') + capitalize(this.name);
    };

    PropertyDescriptor.prototype.getSetterName = function () {
        return 'set' + capitalize(this.name);
    };

    ria.__SYNTAX.PropertyDescriptor = PropertyDescriptor;

    ria.__SYNTAX.parseProperty = function (args) {
        var name = args.pop();

        // TODO: validate property name

        var type = args.pop();
        if (type === undefined)
            throw Error('Expected type or class for property "' + name + '", but got undefined');

        if (Array.isArray(type) || (type instanceof Modifiers && type !== Modifiers.SELF)) {
            throw Error('Expected property type before property name');
        }

        var flags = ria.__SYNTAX.parseModifiers(args);
        var annotations = ria.__SYNTAX.parseAnnotations(args);
        return new PropertyDescriptor(name, type, annotations, flags);
    };

    ria.__SYNTAX.parseMembers = function (args) {
        args = [].slice.call(args);
        var members = [];
        var end = 0;
        while (args.length > 0 && end < args.length) {
            var arg = args[end];

            if (arg === undefined) {
                throw Error('Unexpected [undefined], please check if type is defined or comma is present before [');
            }

            if (typeof arg === 'string') {
                members.push(ria.__SYNTAX.parseProperty(args.splice(0, end + 1)));
                end = 0;
                continue;
            }

            if (typeof arg === 'function' && !isType(arg)) {
                members.push(ria.__SYNTAX.parseMethod(args.splice(0, end + 1)));
                end = 0;
                continue;
            }

            end ++;
        }

        if (args.length != 0)
            throw Error('Incomplete member declaration');

        return members;
    };

    /**
     * @param {Function} base
     * @constructor
     */
    function ExtendsDescriptor(base) {
        this.base = base;
    }

    ria.__SYNTAX.ExtendsDescriptor = ExtendsDescriptor;

    ria.__SYNTAX.EXTENDS = function (base) {
        if (base === undefined)
            throw Error('Class expected, but got undefined. Check if it is defined already');

        if (!(base.__META instanceof ria.__API.ClassDescriptor))
            throw Error('Class expected, but got ' + ria.__API.getIdentifierOfType(base));

        return new ExtendsDescriptor(base);
    };

    /**
     * @param {Function[]} ifcs
     * @constructor
     */
    function ImplementsDescriptor(ifcs) {
        this.ifcs = ifcs;
    }

    ria.__SYNTAX.ImplementsDescriptor = ImplementsDescriptor;

    ria.__SYNTAX.IMPLEMENTS = function () {
        var ifcs = [].slice.call(arguments);

        if (ifcs.length < 1)
            throw Error('Interfaces expected, but got nothing');

        for(var index = 0; index < ifcs.length; index++) {
            var ifc = ifcs[index];

            if (ifc === undefined)
                throw Error('Interface expected, but got undefined. Check if it is defined already');

            if (!(ifc.__META instanceof ria.__API.InterfaceDescriptor))
                throw Error('Interface expected, but got ' + ria.__API.getIdentifierOfType(ifc));
        }

        return new ImplementsDescriptor(ifcs);
    };

    /**
     * @param {String} name
     * @param {Function} base
     * @param {Function[]} ifcs
     * @param {Object} flags
     * @param {AnnotationInstance[]} annotations
     * @param {PropertyDescriptor[]} properties
     * @param {MethodDescriptor[]} methods
     * @constructor
     */
    function ClassDescriptor(name, base, ifcs, flags, annotations, properties, methods) {
        this.name = name;
        this.base = base;
        this.ifcs = ifcs;
        this.flags = flags;
        this.annotations = annotations;
        this.properties = properties;
        this.methods = methods;
    }

    ria.__SYNTAX.ClassDescriptor = ClassDescriptor;

    /**
     * @param {Array} args
     * @param {Function} baseClass
     * @returns {ClassDescriptor}
     */
    ria.__SYNTAX.parseClassDef = function (args, baseClass) {
        var body = args.pop();

        var ifcs = [];
        var ifcs_ = args.pop();
        if (ifcs_ instanceof ImplementsDescriptor) {
            ifcs = ifcs_.ifcs;
        } else {
            args.push(ifcs_);
        }

        var base = baseClass;
        var base_ = args.pop();
        if (base_ instanceof ExtendsDescriptor) {
            base = base_.base;
        } else {
            args.push(base_);
        }

        var name = args.pop();
        var flags = ria.__SYNTAX.parseModifiers(args);
        var annotations = ria.__SYNTAX.parseAnnotations(args);
        var members = ria.__SYNTAX.parseMembers(body);
        var properties = members.filter(function (_1) {return _1 instanceof ria.__SYNTAX.PropertyDescriptor; });
        var methods = members.filter(function (_1) {return _1 instanceof ria.__SYNTAX.MethodDescriptor; });

        return new ClassDescriptor(name, base, ifcs, flags, annotations, properties, methods);
    };

    /**
     * @param {ClassDescriptor} object
     * @param {ClassDescriptor} constructor
     * @returns {Boolean}
     */
    ria.__SYNTAX.isInstanceOf = function(object, constructor){
        var o = object;
        while (o.__proto__ != null) {
            if (o.__proto__ === constructor.prototype)
                return true;
            o = o.__proto__;
        }
        return false;
    };

    /**
     * @param {ClassDescriptor} clazz
     * @param {ClassDescriptor} constructor
     * @returns {Boolean}
     */
    ria.__SYNTAX.isDescendantOf = function(clazz, constructor){
        var o = clazz;
        while (o.__META != null) {
            if (o === constructor)
                break;

            o = o.__META.base;
        }
        return o === constructor;
    }

})();