/*
 * Default syntax
 */

var PUBLIC = hwa.__API.Modifiers.PUBLIC;
var PRIVATE = hwa.__API.Modifiers.PRIVATE;
var PROTECTED = hwa.__API.Modifiers.PROTECTED;
var STATIC = hwa.__API.Modifiers.STATIC;
var ABSTRACT = hwa.__API.Modifiers.ABSTRACT;
var VOID = hwa.__API.Modifiers.VOID;
var SELF = hwa.__API.Modifiers.SELF;

(function () {
    /** @class Annotation */
    hwa.__API.addToNamespace('Annotation', hwa.__API.Annotation.proxy);
    /** @class Override */
    hwa.__API.addToNamespace('Override', hwa.__API.Override.proxy);
    /** @class Class */
    hwa.__API.addToNamespace('Class', hwa.__API.Class);
    /** @class Exception */
    hwa.__API.addToNamespace('Exception', hwa.__API.Exception.ctor);
})();

function ArrayOf(clazz) {
    if (clazz == undefined)
        throw Error('Expected class or type, but gor undefined');

    return new hwa.__API.ArrayOfDescriptor(clazz);
}

function REQUIRE(dep) {
    var deps = Array.prototype.slice.call(arguments);
    var _loader = hwa.__API._loader;
    var cb;

    var root = _loader.getCallerModuleDescriptor();
    deps.forEach(function (value) {
        if (!value.match(/\.js$/) && !value.match(/\.html$/) && !value.match(/\.json$/)) {
            cb = function (value, module) {
                var path = value.split(/\./);
                var root = this;
                while (path.length) {
                    root = root[path.shift()];
                    if (!root)
                        throw Error('Class ' + value + ' not loaded, required by ' + module.id);
                }
            }.bind(hwa.global, value, root);
            value = value.replace(/\./gi, '/') + '.js';
        }

        var module = _loader.getModuleDescriptor(_loader.getFullModuleId(value));
        root.addDependency(module);
        cb && root.addReadyCallback(cb);
    });
}

REQUIRE.get = function (id) {
    var _loader = hwa.__API._loader;
    return _loader.getStaticContent(_loader.getFullModuleId(id));
};

function NAMESPACE(name, cb) {
    if (name instanceof Function) {
        cb = name;
        name = cb.getName();
    }

    var root = hwa.__API._loader.getCallerModuleDescriptor();
    root.addReadyCallback(hwa.__API.defineNamespace.bind(hwa.global, name, cb));
}

function NS(name, cb) {
    NAMESPACE(name, cb);
}

function ENUM(name, values) {
    var enumDecl = hwa.__API.buildEnum(name, values);
    hwa.__API.addToNamespace(name, enumDecl);
    Object.freeze(enumDecl);
}

function IDENTIFIER(name) {
    var idDecl = hwa.__API.buildIdentifier(name);
    hwa.__API.addToNamespace(name, idDecl);
    Object.freeze(idDecl);
}

function ANNOTATION(declaration) {
    var ds = hwa.__API.AnnotationDescriptor.build([].slice.call(arguments));
    hwa.__API.addToNamespace(ds.name, ds.proxy);
    Object.freeze(ds.proxy);
}

function INTERFACE() {
    var interfaceDescriptor = hwa.__API.InterfaceDescriptor.build([].slice.call(arguments));
    hwa.__API.addToNamespace(interfaceDescriptor.name, interfaceDescriptor.proxy);
    Object.freeze(interfaceDescriptor.proxy);
}

function EXTENDS() {
    return hwa.__API.ExtendsDescriptor.build([].slice.call(arguments));
}

function IMPLEMENTS() {
    return hwa.__API.ImplementsDescriptor.build([].slice.call(arguments));
}

function CLASS() {
    var classDescriptor = hwa.__API.ClassDescriptor.build([].slice.call(arguments));
    hwa.__API.addToNamespace(classDescriptor.name, classDescriptor.ctor);
    Object.freeze(classDescriptor.ctor);
}

function EXCEPTION() {
    var exceptionDescriptor = hwa.__API.ClassDescriptor.build([].slice.call(arguments), hwa.__API.Exception);
    hwa.__API.addToNamespace(exceptionDescriptor.name, exceptionDescriptor.ctor);
    Object.freeze(exceptionDescriptor.ctor);
}

function SAFE_CAST(instance, to) {
    return hwa.__API.castAs(instance, to);
}

function DYNAMIC_CAST(instance, to) {
    return hwa.__API.castTo(instance, to);
}
