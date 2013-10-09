var OVERRIDE = ria.__SYNTAX.Modifiers.OVERRIDE;
var ABSTRACT = ria.__SYNTAX.Modifiers.ABSTRACT;
var VOID = ria.__SYNTAX.Modifiers.VOID;
var SELF = ria.__SYNTAX.Modifiers.SELF;
var FINAL = ria.__SYNTAX.Modifiers.FINAL;
var READONLY = ria.__SYNTAX.Modifiers.READONLY;

var Class = ria.__API.Class;
var Interface = ria.__API.Interface;
var Exception = ria.__API.Exception;

var IMPLEMENTS = ria.__SYNTAX.IMPLEMENTS;
/** @type {Function} */
var EXTENDS = ria.__SYNTAX.EXTENDS;
/** @type {Function} */
var VALIDATE_ARG = ria.__SYNTAX.checkArg;
/** @type {Function} */
var VALIDATE_ARGS = ria.__SYNTAX.checkArgs;
/** @type {Function} */
var ArrayOf = ria.__API.ArrayOf;
/** @type {Function} */
var ClassOf = ria.__API.ClassOf;
/** @type {Function} */
var ImplementerOf = ria.__API.ImplementerOf;
/** @type {Function} */
var GENERIC = ria.__SYNTAX.GENERIC;

function __WRAPPER_E(args, cb) {
    var error = args[0];
    if (error instanceof Error)
        args.shift();
    else
        error = null;

    try {
        cb(args);
    } catch (e) {
        if (e.name == 'AssertError')
            throw e;

        if (error && e.message != error.message) {
            fail('Expected error "' + error.message + '", actual: "' + e.message + '"');
        }

        return;
    }

    fail('Expected error' + (error ? ' "' + error.message + '"': ''));
}

function ANNOTATION(arg) {
    var def = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
    ria.__SYNTAX.validateAnnotationDecl(def);
    return ria.__SYNTAX.compileAnnotation('test.' + def.name, def);
}

function ANNOTATION_E(error, arg) {
    __WRAPPER_E(ria.__API.clone(arguments), function (args) {
        var def = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer(args));
        ria.__SYNTAX.validateAnnotationDecl(def);
        return ria.__SYNTAX.compileAnnotation('test.' + def.name, def);
    });
}


function DELEGATE() {
    var def = ria.__SYNTAX.parseDelegate(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
    ria.__SYNTAX.validateDelegateDecl(def);
    return ria.__SYNTAX.compileDelegate('test.' + def.name, def);
}

function DELEGATE_E(error, arg) {
    __WRAPPER_E(ria.__API.clone(arguments), function (args) {
        var def = ria.__SYNTAX.parseMember(new ria.__SYNTAX.Tokenizer(args));
        ria.__SYNTAX.validateDelegateDecl(def);
        ria.__SYNTAX.compileDelegate('test.' + def.name, def);
    });
}

/**
 * @param [arg*]
 */
function INTERFACE(arg) {
    var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
    ria.__SYNTAX.validateInterfaceDecl(def);
    return ria.__SYNTAX.compileInterface('test.' + def.name, def);
}

/**
 * @param {Error} error
 * @param [arg*]
 * @return {*}
 */
function INTERFACE_E(error, arg) {
    __WRAPPER_E(ria.__API.clone(arguments), function (args) {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(args));
        ria.__SYNTAX.validateInterfaceDecl(def);
        ria.__SYNTAX.compileInterface('test.' + def.name, def);
    });
}

/**
 * @param [arg*]
 */
function CLASS(arg) {
    var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(ria.__API.clone(arguments)));
    ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Class);
    ria.__SYNTAX.validateClassDecl(def, 'Class');
    return ria.__SYNTAX.compileClass('test.' + def.name, def);
}

/**
 * @param {Error} error
 * @param [arg*]
 * @return {*}
 */
function CLASS_E(error, arg) {
    __WRAPPER_E(ria.__API.clone(arguments), function (args) {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(args));
        ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Class);
        ria.__SYNTAX.validateClassDecl(def, 'Class');
        ria.__SYNTAX.compileClass('test.' + def.name, def);
    });
}

/**
 * @param [arg*]
 */
function EXCEPTION(arg) {
    var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(ria.__API.clone(arguments)));
    ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Exception);
    ria.__SYNTAX.validateException(def);
    return ria.__SYNTAX.compileClass('test.' + def.name, def);
}

/**
 * @param {Error} error
 * @param [arg*]
 * @return {*}
 */
function EXCEPTION_E(error, arg) {
    __WRAPPER_E(ria.__API.clone(arguments), function (args) {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer(args));
        ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Exception);
        ria.__SYNTAX.validateException(def);
        ria.__SYNTAX.compileClass('test.' + def.name, def);
    });
}