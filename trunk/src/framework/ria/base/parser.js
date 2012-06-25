(function (__API, ria) {
    "use strict";

    var Modifiers = __API.buildEnum('Modifiers', {
        VOID: 0,
        PUBLIC: 1,
        PROTECTED: 2,
        PRIVATE: 3,
        ABSTRACT: 4,
        STATIC: 5,
        SELF: 6,
        OVERRIDE: 7
    }),

    Visibility = __API.buildEnum('Visibility', {
        Public: 1,
        Protected: 2,
        Private: 3
    });

    /**
     * @constructor
     * @param {String} name
     * @param {Array} argsInfo
     * @param {Object} retType
     * @param {Object} flags
     * @param {Array} annotations
     * @param {Function} body
     */
    function MethodDescriptor(name, argsInfo, retType, annotations, body, flags) {
        this.name = name;
        this.argsInfo = argsInfo;
        this.retType = retType;
        this.annotations = annotations;
        this.body = body;
        this.visibility = flags.visibility;
        this.isStatic = flags.isStatic;
        this.isAbstract = flags.isAbstract;
        this.rpc = body.getParametersCount();
        this.hasVarArgs = body.hasVarArgs();
    }

    MethodDescriptor.prototype.postProcessSELF = function (ctor) {
        if (this.retType === Modifiers.SELF)
            this.retType = ctor;

        var hints = this.argsInfo,
            j = hints.length;
        for(;j > 0; j--) {
            if(hints[j - 1] == Modifiers.SELF)
                hints[j - 1] = ctor;
        }

        this._fullSignature = this.getMethodFullSignature(false);
    };

    MethodDescriptor.prototype.getMethodShortSignature = function () {
        var args = [].slice.call(this.body.getParameters());
        for(var i = 0; i < args.length; i++) {
            args[i] = __API.getIdentifierOfType(this.argsInfo[i]);
        }

        return args.join(', ');
    };

    MethodDescriptor.prototype.getMethodFullSignature = function (includeNames) {
        var args = this.body.getParameters();
        for(var i = 0; i < args.length; i++)
            args[i] = __API.getIdentifierOfType(this.argsInfo[i]) + (includeNames === true ? ' ' + args[i] : '');

        return    ['', 'public ', 'protected ', 'private '][this.visibility.valueOf()]
                + ['', 'static '][this.isStatic ? 1 : 0]
                + (this.name != '__constructor' ? hwa.__API.getIdentifierOfType(this.retType) + ' ' : '')
                + (this.name) + '(' + args.join(', ') + ')';
    };

    Object.freeze(MethodDescriptor);

    hwa.__API.MethodDescriptor = MethodDescriptor;

    function capitalize(str) {
        return str.replace(/\w/,function (x){
            return x.toUpperCase();
        });
    }

    /**
     * @class PropertyDescriptor
     * @param {String} name
     * @param {Object} type
     * @param {Array} annotations
     * @param {Object} flags
     */
    function PropertyDescriptor(name, type, annotations, flags) {
        this.name = name;
        this.type = type;
        this.annotations = annotations;
        this.flags = flags;
        this.visibility = flags.visibility;
        this.isStatic = flags.isStatic;

        this.getterName = 'get' + capitalize(name);
        this.setterName = 'set' + capitalize(name);
    }

    PropertyDescriptor.prototype.getPropertySignature = function () {
        return    ['', 'public ', 'protected ', 'private '][this.visibility.valueOf()]
                + ['', 'static '][this.isStatic ? 1 : 0]
                + hwa.__API.getIdentifierOfType(this.type) + ' '
                + this.name;
    };

    PropertyDescriptor.prototype.postProcessSELF = function (ctor) {
        if(this.type == Modifiers.SELF)
            this.type = ctor;
    };

    Object.freeze(PropertyDescriptor);

    hwa.__API.PropertyDescriptor = PropertyDescriptor;

    var AnnotationDescriptor = hwa.__API.AnnotationDescriptor;

    function parseAnnotations(args) {
        var annotations = [];
        while(args.length > 0) {
            var a = args.pop();
            if (!Array.isArray(a) || a.length != 1 || a[0] == undefined || !AnnotationDescriptor.isAnnotation(a[0]))
                throw Error('Annotation expected, eg [SomeAnnotation] or [SomeAnnotationWithParams("some values here")], or check if annotation is loaded');

            annotations.push(AnnotationDescriptor.normalize(a[0]));
        }
        return annotations;
    }

    function parseModifiers(args, flags) {
        while (args.length) {
            var flag = args.pop();
            if (Array.isArray(flag)) {
                args.push(flag);
                break;
            } else if (flag instanceof Modifiers) {
                switch (flag) {
                    case Modifiers.STATIC: flags.isStatic = true; break;
                    case Modifiers.ABSTRACT: flags.isAbstract = true; break;
                    case Modifiers.PRIVATE:
                    case Modifiers.PROTECTED:
                    case Modifiers.PUBLIC:
                        flags.visibility = Visibility.fromValue(flag.valueOf());
                        break;
                }
            }
        }
    }

    function parseMember(args, defVisibility) {
        var flags = {
            visibility: defVisibility,
            isStatic: false,
            isAbstract: false
        };

        var body = args.pop();
        var name;
        var argsCount = 0;
        name = body.getName();
        argsCount = body.getRequiredParametersCount();

        var retType = Object;
        var argsHints = [];
        var annotations = [];

        if (args.length) {
            retType = args.pop();
            if (retType === undefined )
                throw Error('Expected return type or class of method "' + body.getName() + '", but got undefined');

            if (Array.isArray(retType) || ((retType instanceof Modifiers) && retType != Modifiers.VOID && retType != Modifiers.SELF)) {
                args.push(retType);
                retType = Object;
            }

            if (retType === Modifiers.VOID)
                retType = undefined;
        }

        parseModifiers(args, flags);

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

        annotations = parseAnnotations(args);

        while (argsHints.length < argsCount)
            argsHints.push(Object);

        return new MethodDescriptor(name, argsHints.slice(0, argsCount), retType, annotations, body, flags);
    }

    function parseProperty(args, defVisibility) {
        var name = args.pop();
        var type = args.pop();
        if (type === undefined)
            throw Error('Expected type or class for property "' + name + '", but got undefined');

        if (Array.isArray(type) || type instanceof Modifiers) {
            throw Error('Expected property type before property name');
        }

        var flags = {
            visibility: defVisibility,
            isStatic: false,
            isAbstract: false
        };
        parseModifiers(args, flags);
        var annotations = parseAnnotations(args);
        return new PropertyDescriptor(name, type, annotations, flags);
    }

    function parseMembers(args, defVisibility) {
        var members = [];
        var end = 0;
        while (args.length > 0 && end < args.length) {
            var arg = args[end];
            if (typeof arg === 'string') {
                members.push(parseProperty(args.splice(0, end + 1), defVisibility));
                end = 0;
            }
            
            if (typeof arg === 'function' && !hwa.__API.isType(arg)) {
                members.push(parseMember(args.splice(0, end + 1), defVisibility));
                end = 0;
            }

            end ++;
        }

        if (args.length != 0)
            throw Error('Function declaration was not found');

        return members;
    }

    hwa.__API.parser = {
        parseMembers: parseMembers,
        parseMember: parseMember,
        parseModifiers: parseModifiers,
        parseAnnotations: parseAnnotations
    };

    Object.freeze(hwa.__API.parser);
})(ria.__API, ria);