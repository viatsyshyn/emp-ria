
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    ria.__SYNTAX.buildNs = function (ns, name) {
        return ns ? ns + '.' + name : name;
    };

    /**
     * @param {String} ns
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildClass = function (ns, def) {

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
        ria.__API.clazz(ClassProxy, ria.__SYNTAX.buildNs(ns, def.name), def.base, def.ifcs, def.annotations);

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
    }
})();