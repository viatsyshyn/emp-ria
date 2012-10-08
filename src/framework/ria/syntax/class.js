
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    ria.__SYNTAX.buildNs = function (ns, name) {
        return ns ? ns + '.' + name : name;
    };

    ria.__SYNTAX.getFullName = function (name) {
        return name;
    };

    ria.__SYNTAX.define = function (name, def) {
        // TODO: define object in ns
    };

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildClass = function (name, def) {

        // TODO: validate class flags
        // TODO: validate no duplicate methods, ctors, properties
        // TODO: validate properties
        // TODO: validate methods
        // TODO: validate methods overrides
        // TODO: ensure ctor
        // TODO: ensure getters/setters

        function ClassProxy() {
            return ria.__API.init(this, ClassProxy, ClassProxy.prototype.$, arguments);
        }
        ria.__API.clazz(ClassProxy, name, def.base, def.ifcs, def.annotations);

        this.properties
            .filter(function (_1) { return _1.name == '$'})
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                ClassProxy.prototype.$ = method.body;
                ria.__API.ctor(ClassProxy, ClassProxy.prototype.$, method.argsTypes, method.argsNames);
            });

        this.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                ria.__API.property(ClassProxy, property.name, property.type, property.annotations);
            });

        this.properties
            .filter(function (_1) { return _1.name != '$'})
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                var impl = ClassProxy.prototype[method.name] = method.body;
                ria.__API.method(ClassProxy, impl, method.name, method.retType, method.argsTypes, method.argsNames);
            });

        ria.__API.compile(ClassProxy);

        return ClassProxy;
    };

    ria.__SYNTAX.CLASS = function () {
        var def = ria.__SYNTAX.parseClass([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var clazz = ria.__SYNTAX.buildClass(name, def);
        ria.__SYNTAX.define(name, clazz);
    }
})();