/** @namespace ria.__SYNTAX */
(ria = ria || {}).__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    ria.__SYNTAX.isProtected = function (name) {
        return /^.+_$/.test(name);
    };

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
        Object.freeze(Modifiers);
        return Modifiers;
    }();

    ria.__SYNTAX.Modifiers = Modifiers;

    /**
     * @param {ria.__SYNTAX.Tokenizer} tkz
     * @return {Object}
     */
    ria.__SYNTAX.parseModifiers = function (tkz) {
        ria.__SYNTAX.checkArg('tkz', [ria.__SYNTAX.Tokenizer], tkz);

        var flags = {
            isAbstract: false,
            isFinal: false,
            isOverride: false,
            isReadonly: false
        };

        while (!tkz.eot() && tkz.check(ria.__SYNTAX.Tokenizer.ModifierToken)) {
            switch(tkz.next().value) {
                case ria.__SYNTAX.Modifiers.ABSTRACT: flags.isAbstract = true; break;
                case ria.__SYNTAX.Modifiers.FINAL: flags.isFinal = true; break;
                case ria.__SYNTAX.Modifiers.OVERRIDE: flags.isOverride = true; break;
                case ria.__SYNTAX.Modifiers.READONLY: flags.isReadonly = true; break;
            }
        }

        return flags;
    };

    /**
     * @param {ria.__SYNTAX.Tokenizer} tkz
     * @return {Object}
     */
    ria.__SYNTAX.parseAnnotations = function (tkz) {
        ria.__SYNTAX.checkArg('tkz', [ria.__SYNTAX.Tokenizer], tkz);

        var annotations = [];
        while(!tkz.eot() && tkz.check(ria.__SYNTAX.Tokenizer.ArrayToken)) {
            var a = tkz.next();
            console.info(a, a.values, a.values.length);
            if (a.values.length != 1
                //|| !(a.values[0] instanceof Tokenizer.FunctionCallToken || a.values[0] instanceof Tokenizer.RefToken)
                )
                throw Error('Annotation expected, eg [SomeAnnotation] or [SomeAnnotationWithParams("some values here")], or check if annotation is loaded');

            annotations.push(a.values[0]);
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
        return ((this.type.value === Boolean) ? 'is' : 'get') + capitalize(this.name);
    };

    PropertyDescriptor.prototype.getSetterName = function () {
        return 'set' + capitalize(this.name);
    };

    ria.__SYNTAX.PropertyDescriptor = PropertyDescriptor;
    /**
     *
     * @param {ria.__SYNTAX.Tokenizer} tkz
     * @return {MethodDescriptor|PropertyDescriptor}
     */
    ria.__SYNTAX.parseMember = function (tkz) {
        ria.__SYNTAX.checkArg('tkz', [ria.__SYNTAX.Tokenizer], tkz);
        //if (tkz.check(Tokenizer.ArrayToken))

        var annotations = ria.__SYNTAX.parseAnnotations(tkz);
        var argsHints = [];
        if (tkz.check(ria.__SYNTAX.Tokenizer.DoubleArrayToken))
            argsHints = tkz.next().values;

        var flags = ria.__SYNTAX.parseModifiers(tkz);

        var retType = null;
        if (tkz.check(ria.__SYNTAX.Tokenizer.RefToken) || tkz.check(ria.__SYNTAX.Tokenizer.VoidToken) || tkz.check(ria.__SYNTAX.Tokenizer.SelfToken))
            retType = tkz.next();

        if (tkz.check(ria.__SYNTAX.Tokenizer.StringToken))
            return new PropertyDescriptor(tkz.next().value, retType, annotations, flags);

        tkz.ensure(ria.__SYNTAX.Tokenizer.FunctionToken);
        var body = tkz.next();
        return new MethodDescriptor(body.getName(), body.getParameters(), argsHints, retType, flags, body, annotations);
    };

    /**
     *
     * @param {ria.__SYNTAX.Tokenizer} tkz
     */
    ria.__SYNTAX.parseMembers = function (tkz) {
        ria.__SYNTAX.checkArg('tkz', [ria.__SYNTAX.Tokenizer], tkz);
        var members = [];
        while (!tkz.eot())
            members.push(ria.__SYNTAX.parseMember(tkz));

        return members;
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
     * @param {ria.__SYNTAX.Tokenizer} tkz
     * @return {ClassDescriptor}
     */
    ria.__SYNTAX.parseClassDef = function (tkz) {
        ria.__SYNTAX.checkArg('tkz', [ria.__SYNTAX.Tokenizer], tkz);

        var annotations = ria.__SYNTAX.parseAnnotations(tkz);
        var flags = ria.__SYNTAX.parseModifiers(tkz);
        tkz.ensure(ria.__SYNTAX.Tokenizer.StringToken);
        var name = tkz.next().value;
        var base = null;
        if (tkz.check(ria.__SYNTAX.Tokenizer.ExtendsToken))
            base = tkz.next().value;
        var ifcs = [];
        if (tkz.check(ria.__SYNTAX.Tokenizer.ImplementsToken))
            ifcs = tkz.next().values;

        tkz.ensure(ria.__SYNTAX.Tokenizer.ArrayToken);
        var members = ria.__SYNTAX.parseMembers(tkz.next().getTokenizer());

        if (!tkz.eot())
            throw Error('Expected end of class declaration');

        var properties = members.filter(function (_1) {return _1 instanceof PropertyDescriptor; });
        var methods = members.filter(function (_1) {return _1 instanceof MethodDescriptor; });

        return new ClassDescriptor(name, base, ifcs, flags, annotations, properties, methods);
    }
})();