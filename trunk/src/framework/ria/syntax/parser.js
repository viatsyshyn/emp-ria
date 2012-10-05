
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    function parseName(fn) {
        return fn.name || (fn.substring(9).match(/[a-z0-9_]+/i) || [])[0] || '';
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
        //#ifdef DEBUG
        Object.freeze(Modifiers);
        //#endif
        return Modifiers;
    }();

    ria.__SYNTAX.Modifiers = Modifiers;

    function MethodDescriptor(name, argsNames, argsTypes, retType, modifiers, body, annotation) {
    }

    ria.__SYNTAX.MethodDescriptor = MethodDescriptor;

    ria.__SYNTAX.parseMethod = function (args) {
        var flags = {
            isStatic: false,
            isAbstract: false
        };

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

            if (retType === Modifiers.VOID)
                retType = undefined;
        }

        ria.__SYNTAX.parseModifiers(args, flags);

        if (args.length) {
            argsHints = args.pop();
            if (!Array.isArray(argsHints) || (argsHints.length == 1 && AnnotationDescriptor.isAnnotation(argsHints[0]))) {
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

    ria.__SYNTAX.parseMembers = function (def) {};

    ria.__SYNTAX.parseProperty = function (def) {
        var name = args.pop();
        var type = args.pop();
        if (type === undefined)
            throw Error('Expected type or class for property "' + name + '", but got undefined');

        if (Array.isArray(type) || type instanceof Modifiers) {
            throw Error('Expected property type before property name');
        }

        var flags = {
            isStatic: false,
            isAbstract: false
        };
        ria.__SYNTAX.parseModifiers(args, flags);
        var annotations = parseAnnotations(args);
        return new PropertyDescriptor(name, type, annotations, flags);
    };

    ria.__SYNTAX.parseAnnotations = function (def) {};

    ria.__SYNTAX.parseModifiers = function (def) {};
})();