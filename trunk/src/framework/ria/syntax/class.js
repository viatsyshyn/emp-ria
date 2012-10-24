
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    function getDefaultGetter(property, name) {
        return new Function ('return ' + function getPropertyProxy() { return this.name; }.toString().replace('name', property).replace('getProperty', name))();
    }

    function getDefaultSetter(property, name) {
        return new Function ('return ' + function setPropertyProxy(value) { this.name = value; }.toString().replace('name', property).replace('setProperty', name))();
    }

    function getDefaultCtor(name) {
        return new Function ('return ' + function ConstructorProxy(value) { BASE(); }.toString().replace('Constructor', name))();
    }

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.buildClass = function (name, def) {

        // TODO: validate class flags
        // TODO: validate no duplicate members
        // TODO: validate properties
        // TODO: validate methods
        // TODO: validate methods overrides

        function ClassProxy() {
            return ria.__API.init(this, ClassProxy, ClassProxy.prototype.$, arguments);
        }
        ria.__API.clazz(ClassProxy, name, def.base, def.ifcs, def.annotations);

        var processedMethods = [];
        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                var getterName = property.getGetterName();
                var getters = def.methods.filter(function (_1) { return _1.name == getterName});
                var getter = getters.length == 1 ? getters[0].body : getDefaultGetter(property.name, getterName);

                var setterName = property.getSetterName();
                var setters = def.methods.filter(function (_1) { return _1.name == setterName});
                var setter = null;
                if (!property.flags.isReadonly)
                    setter = setters.length == 1 ? setters[0].body : getDefaultSetter(property.name, setterName);

                ria.__API.property(ClassProxy, property.name, property.type, property.annotations, getter, setter);

                processedMethods.push(getterName);
                processedMethods.push(setterName);
            });

        var ctors = def.methods
            .filter(function (_1) { return _1.name == '$'});

        var ctor = ctors.length == 1 ? ctors[0].body : getDefaultCtor(def.name);
        var argsTypes = ctors.length == 1 ? ctors[0].argsTypes : [];
        var argsNames = ctors.length == 1 ? ctors[0].argsNames : [];
        ClassProxy.prototype.$ = ctor;
        ria.__API.ctor(ClassProxy, ClassProxy.prototype.$, argsTypes, argsNames);
        processedMethods.push('$');

        def.methods
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                if (processedMethods.indexOf(method.name) < 0) {
                    var impl = ClassProxy.prototype[method.name] = method.body;
                    ria.__API.method(ClassProxy, impl, method.name, method.retType, method.argsTypes, method.argsNames);
                }
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