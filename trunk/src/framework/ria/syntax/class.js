
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
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {MethodDescriptor}
     */
    function findParentMethod(def, name){
        var base = def.base && def.base.__SYNTAX_META;
        var baseMethod;
        while(base){
            base.methods.forEach(function(method){
                if(method.name == name)
                    baseMethod = method;
            });
            if(baseMethod)
                break;
            base = base.base && base.base.__SYNTAX_META;
        }
        return baseMethod;
    }

    /**
     * @param {Array} args
     * @return {ClassDescriptor}
     */
    ria.__SYNTAX.parseClass = function (args) {
        return ria.__SYNTAX.parseClassDef(args, ria.__API.Class);
    };

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @param {Boolean} skipBaseCheck
     * @return {Function}
     */
    ria.__SYNTAX.buildClass = function (name, def, skipBaseCheck) {

        // validate if base is descendant on Class
        if(!skipBaseCheck && !ria.__SYNTAX.isDescendantOf(def.base ,ria.__API.Class))
            throw Error('Base class must be descendant of Class');

        // validate class flags
        if(def.flags.isOverride)
            throw Error('Modifier OVERRIDE is not supported in classes');

        if(def.flags.isReadonly)
            throw Error('Modifier READONLY is not supported in classes');

        if(def.flags.isAbstract && def.flags.isFinal)
            throw Error('Class can not be ABSTRACT and FINAL simultaneously');

        // TODO: validate no duplicate members
        // TODO: validate properties
        // TODO: validate methods
        // TODO: validate methods overrides

        function ClassProxy() {
            if(def.flags.isAbstract)
                throw Error('You can\'t instantiate abstract class ' + this.name);
            return ria.__API.init(this, ClassProxy, ClassProxy.prototype.$, arguments);
        }

        if(def.base.__SYNTAX_META && def.base.__SYNTAX_META.flags.isFinal)
            throw Error('You can\'t extend final class ' + def.base.__SYNTAX_META.name);

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

        if(def.base.__SYNTAX_META){
            def.base.__SYNTAX_META.methods.forEach(function(baseMethod){
                if(baseMethod.name != "$"){
                    var childMethod;
                    def.methods.forEach(function(method){
                        if(method.name == baseMethod.name)
                            childMethod = method;
                    });
                    if(baseMethod.flags.isFinal){
                        if(childMethod){
                            throw Error('There is no ability to override final method ' + childMethod.name + ' in ' + def.name + ' class');
                        }
                    }else{
                        if(baseMethod.flags.isAbstract){
                            if(!childMethod){
                                throw Error('The abstract method ' + baseMethod.name+ ' have to be overriden in ' + def.name + ' class');
                            }
                            if(!childMethod.flags.isOverride){
                                throw Error('The overriden method ' + childMethod.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');
                            }
                        }else{
                            if(childMethod && !childMethod.flags.isOverride){
                                throw Error('The overriden method ' + childMethod.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');
                            }
                        }
                    }
                }
            });
        }

        def.methods
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                var parentMethod = findParentMethod(def, method.name);
                if(method.flags.isOverride){
                    if(!parentMethod){
                        throw Error('There is no ' + method.name + ' method in base classes of ' + def.name + ' class');
                    }
                }
                if(method.flags.isAbstract){
                    if(parentMethod){
                        throw Error(method.name + ' can\'t be abstract, because there is method with the same name in one of the base classes');
                    }
                }
                if(parentMethod && parentMethod.flags.isFinal){
                    throw Error('Final method ' + method.name + ' can\'t be overriden in ' + def.name + ' class');
                }
                if(method.retType == ria.__SYNTAX.Modifiers.SELF)
                    method.retType = ClassProxy;
                method.argsTypes.forEach(function(t, index){
                    if(method.argsTypes[index] == ria.__SYNTAX.Modifiers.SELF)
                        method.argsTypes[index] = ClassProxy;
                });

                if (processedMethods.indexOf(method.name) < 0) {
                    var impl = ClassProxy.prototype[method.name] = method.body;
                    ria.__API.method(ClassProxy, impl, method.name, method.retType, method.argsTypes, method.argsNames);
                }
            });

        ClassProxy.__SYNTAX_META = def;
        ria.__API.compile(ClassProxy);

        return ClassProxy;
    };

    ria.__SYNTAX.CLASS = function () {
        var def = ria.__SYNTAX.parseClass([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name);
        var clazz = ria.__SYNTAX.buildClass(name, def, false);
        ria.__SYNTAX.define(name, clazz);
    }
})();