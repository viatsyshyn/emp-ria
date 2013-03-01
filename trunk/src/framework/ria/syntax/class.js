/** @namespace ria.__SYNTAX */
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
        var baseMethod = null;
        while (base) {
            baseMethod = base.methods.filter(function(method){ return method.name == name }).pop();
            if (baseMethod)
                break;
            base = base.base && base.base.__SYNTAX_META;
        }
        return baseMethod;
    }

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {PropertyDescriptor}
     */
    function findParentProperty(def, name){
        var base = def.base && def.base.__SYNTAX_META;
        var baseProperty = null;
        while(base){
            baseProperty = base.properties.filter(function(property){ return property.name == name }).pop();
            if(baseProperty)
                break;
            base = base.base && base.base.__SYNTAX_META;
        }
        return baseProperty;
    }

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {PropertyDescriptor}
     */
    function findParentPropertyFromMeta(def, name){
        var base = def.base && def.base.__META;
        var baseProperty;
        while(base){
            baseProperty = base.properties[name];
            if(baseProperty)
                break;
            base = base.base && base.base.__META;
        }
        return baseProperty;
    }

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {Object}
     */
    function findParentPropertyByGetterOrSetter(def, name){
        var base = def.base && def.base.__SYNTAX_META;
        var baseProperty, res={};
        while(base){
            base.properties.forEach(function(property){
                if(property.getSetterName()== name){
                    baseProperty = property;
                    res.isGetter = true;
                }
                if(property.getGetterName()== name){
                    baseProperty = property;
                    res.isSetter = true;
                }
            });
            if(baseProperty)
                break;
            base = base.base && base.base.__SYNTAX_META;
        }
        res.property = baseProperty;
        return res;
    }

    function isSameFlags(def1, def2){
        for(var flag in def1.flags) if (def1.flags.hasOwnProperty(flag)) {
            if(def1.flags[flag] != def2.flags[flag])
                return false;
        }
        return true;
    }

    /**
     * @param {Array} args
     * @return {ClassDescriptor}
     */
    ria.__SYNTAX.parseClass = function (args) {
        return ria.__SYNTAX.parseClassDef(args, ria.__API.Class);
    };

    function processGetterSetterOverride(method, def, baseSearchResult, processedMethods, ClassProxy) {
        if (!method.flags.isOverride)
            throw Error('Method' + method.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');

        var property = baseSearchResult.property;
        var propertyFromMeta = findParentPropertyFromMeta(def, property.name);
        if (property.flags.isFinal)
            throw Error('There is no ability to override setter or getter of final property ' + property.name + ' in ' + def.name + ' class');

        var getter, setter;

        var setterInMethods = def.methods.filter(function (_1) { return _1.name == property.getSetterName() }).pop();
        setterInMethods && processedMethods.push(setterInMethods.name);
        if (setterInMethods && !setterInMethods.flags.isOverride)
            throw Error('Method' + setterInMethods.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');

        var getterInMethods = def.methods.filter(function (_1) { return _1.name == property.getGetterName() }).pop();
        getterInMethods && processedMethods.push(getterInMethods.name);
        if (getterInMethods && !getterInMethods.flags.isOverride)
            throw Error('Method' + getterInMethods.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');

        if (property.flags.isReadonly && setterInMethods)
            throw Error('There is no ability to add setter to READONLY property ' + property.name + ' in ' + def.name + ' class');

        if (setterInMethods && getterInMethods && !isSameFlags(setterInMethods, getterInMethods))
            throw Error('Setter' + setterInMethods.name + ' ang getter' + getterInMethods.name
                + ' have to have to have the same flags in ' + def.name + ' class');

        getter = getterInMethods ? getterInMethods.body : function () {
            //noinspection JSPotentiallyInvalidConstructorUsage
            return BASE();
        };
        ClassProxy.prototype[getter.name] = getter;
        if (_DEBUG) {
            getter.__BASE_BODY = propertyFromMeta.getter;
            getter.__SELF = ClassProxy;
        }

        if (!property.flags.isReadonly) {
            setter = setterInMethods ? setterInMethods.body : function (value) {
                //noinspection JSPotentiallyInvalidConstructorUsage
                BASE(value);
            };
            ClassProxy.prototype[setter.name] = setter;
            if (_DEBUG) {
                setter.__BASE_BODY = propertyFromMeta.setter;
                setter.__SELF = ClassProxy;
            }
        }

        ria.__API.property(ClassProxy, property.name, property.type, property.annotations, getter, setter);
        var newProperty = new ria.__SYNTAX.PropertyDescriptor(property.name, property.type, property.annotations, method.flags);
        def.properties.push(newProperty);
    }

    function processMethodDeclaration(def, method, ClassProxy) {
        var parentMethod = findParentMethod(def, method.name);
        if (method.flags.isOverride) {
            if (!parentMethod) {
                throw Error('There is no ' + method.name + ' method in base classes of ' + def.name + ' class');
            }

            _DEBUG && (method.body.__BASE_BODY = parentMethod.body);
        }

        if (method.flags.isAbstract && parentMethod) {
            throw Error(method.name + ' can\'t be abstract, because there is method with the same name in one of the base classes');
        }

        if (parentMethod && parentMethod.flags.isFinal) {
            throw Error('Final method ' + method.name + ' can\'t be overridden in ' + def.name + ' class');
        }

        if (method.retType == ria.__SYNTAX.Modifiers.SELF) {
            method.retType = ClassProxy;
        }

        method.argsTypes.forEach(function (t, index) {
            if (method.argsTypes[index] == ria.__SYNTAX.Modifiers.SELF)
                method.argsTypes[index] = ClassProxy;
        });

        var impl = ClassProxy.prototype[method.name] = method.body;
        _DEBUG && (impl.__SELF = ClassProxy);
        ria.__API.method(ClassProxy, impl, method.name, method.retType, method.argsTypes, method.argsNames);
    }

    function processPropertyDeclaration(property, def, ClassProxy, processedMethods) {
        var getterName = property.getGetterName();
        var getters = def.methods.filter(function (_1) {
            return _1.name == getterName
        });
        var getter = getters.length == 1 ? getters[0].body : getDefaultGetter(property.name, getterName);

        if (getters[0] && !isSameFlags(property, getters[0]))
            throw Error('The flags of getter ' + getters[0].name + ' should be the same with property flags');

        ClassProxy.prototype[getterName] = getter;
        _DEBUG && (getter.__SELF = ClassProxy);

        var setterName = property.getSetterName();
        var setters = def.methods.filter(function (_1) {
            return _1.name == setterName
        });

        if (setters[0] && !isSameFlags(property, setters[0]))
            throw Error('The flags of setter ' + setters[0].name + ' should be the same with property flags');

        var setter = null;
        if (!property.flags.isReadonly) {
            setter = setters.length == 1 ? setters[0].body : getDefaultSetter(property.name, setterName);

            ClassProxy.prototype[setterName] = setter;
            _DEBUG && (setter.__SELF = ClassProxy);
        } else {
            if (setters.length) {
                throw Error('There is no ability to add setter to READONLY property ' + property.name + ' in ' + def.name + ' class');
            }
        }

        ria.__API.property(ClassProxy, property.name, property.type, property.annotations, getter, setter);

        processedMethods.push(getterName);
        processedMethods.push(setterName);
    }

    function processCtorDeclaration(ctors, def, ClassProxy, processedMethods) {
        var ctor = ctors.length == 1 ? ctors[0].body : getDefaultCtor(def.name);
        var argsTypes = ctors.length == 1 ? ctors[0].argsTypes : [];
        var argsNames = ctors.length == 1 ? ctors[0].argsNames : [];
        ClassProxy.prototype.$ = ctor;
        if (_DEBUG) {
            ctor.__BASE_BODY = def.base ? def.base.__META.ctor.impl : undefined;
            ctor.__SELF = ClassProxy;
        }
        ria.__API.ctor(ClassProxy, ClassProxy.prototype.$, argsTypes, argsNames);
        processedMethods.push('$');
    }

    function processBaseClassMethodDeclaration(def, baseMethod) {
        var childMethod = def.methods.filter(function (method) {
            return method.name == baseMethod.name;
        }).pop();
        if (baseMethod.flags.isFinal) {
            if (childMethod)
                throw Error('There is no ability to override final method ' + childMethod.name + ' in ' + def.name + ' class');

        } else if (baseMethod.flags.isAbstract) {
            if (!childMethod)
                throw Error('The abstract method ' + baseMethod.name + ' have to be overridden in ' + def.name + ' class');

            if (!childMethod.flags.isOverride)
                throw Error('The overridden method ' + childMethod.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');

        } else {
            if (childMethod && !childMethod.flags.isOverride)
                throw Error('The overridden method ' + childMethod.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');
        }
    }

    function processBaseClassPropertyDeclaration(baseProperty, childGetter, childSetter, def) {
        if (baseProperty.flags.isFinal) {
            if (childGetter || childSetter)
                throw Error('There is no ability to override getter or setter of final property '
                    + baseProperty.name + ' in ' + def.name + ' class');

        } else if (baseProperty.flags.isAbstract) {
            if (!childGetter || !childSetter)
                throw Error('The setter and getter of abstract property ' + baseProperty.name
                    + ' have to be overridden in ' + def.name + ' class');

            if (!childGetter.flags.isOverride || !childSetter.flags.isOverride)
                throw Error('The overridden setter and getter of property' + baseProperty.name
                    + ' have to be marked as OVERRIDE in ' + def.name + ' class');

        } else {
            if (childGetter && !childGetter.flags.isOverride || childSetter && !childSetter.flags.isOverride)
                throw Error('The overridden getter or setter of property ' + baseProperty.name
                    + ' have to be marked as OVERRIDE in ' + def.name + ' class');
        }
    }

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @param {Boolean} [skipBaseCheck_]
     * @return {Function}
     */
    ria.__SYNTAX.buildClass = function (name, def, skipBaseCheck_) {

        // validate if base is descendant on Class
        if(!skipBaseCheck_ && !ria.__SYNTAX.isDescendantOf(def.base, ria.__API.Class))
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

        var ClassProxy = function ClassProxy() {
            return ria.__API.init(this, ClassProxy, ClassProxy.prototype.$, arguments);
        };

        if(def.flags.isAbstract)
            ClassProxy = function ClassProxy() { throw Error('Can NOT instantiate abstract class ' + def.name); };

        if(def.base.__SYNTAX_META && def.base.__SYNTAX_META.flags.isFinal)
            throw Error('Can NOT extend final class ' + def.base.__SYNTAX_META.name);

        ria.__API.clazz(ClassProxy, name, def.base, def.ifcs, def.annotations);

        if(def.base.__SYNTAX_META){
            def.base.__SYNTAX_META.properties.forEach(function(baseProperty){
                var childGetter = def.methods.filter(function(method){ return method.name == baseProperty.getGetterName() }).pop(),
                    childSetter = def.methods.filter(function(method){ return method.name == baseProperty.getSetterName() }).pop();

                processBaseClassPropertyDeclaration(baseProperty, childGetter, childSetter, def);
            });

            def.base.__SYNTAX_META.methods.forEach(function(baseMethod){
                if(baseMethod.name == "$")
                    return;

                processBaseClassMethodDeclaration(def, baseMethod);
            });
        }

        var processedMethods = [];
        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                if(findParentProperty(def, property.name))
                    throw Error('There is defined property ' + property.name + ' in one of the base classes');

                processPropertyDeclaration(property, def, ClassProxy, processedMethods);
            });

        var ctors = def.methods
            .filter(function (_1) { return _1.name == '$'});

        processCtorDeclaration(ctors, def, ClassProxy, processedMethods);

        def.methods
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                // skip processed methods
                if (processedMethods.indexOf(method.name) >= 0)
                    return;

                var baseSearchResult = findParentPropertyByGetterOrSetter(def, method.name);
                if (baseSearchResult.property) {
                    processGetterSetterOverride(method, def, baseSearchResult, processedMethods, ClassProxy);
                    return;
                }

                processMethodDeclaration(def, method, ClassProxy);
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
    };

    ria.__SYNTAX.PRIVATE_CLASS = function () {
        var def = ria.__SYNTAX.parseClass([].slice.call(arguments));
        var name = ria.__SYNTAX.getFullName(def.name + '_' + Math.random().toString(36).substr(2));
        return ria.__SYNTAX.buildClass(name, def, false);
    };

    _DEBUG && ria.__API.addPipelineMethodCallStage('CallInit', function () {
        function BaseIsUndefined() { throw Error('BASE is supported only on method with OVERRIDE'); }

        return function (body, meta, scope, callSession) {
            callSession.__OLD_SELF = window.SELF;
            window.SELF = body.__SELF;

            callSession.__OLD_BASE = window.BASE;
            var base = body.__BASE_BODY;
            window.BASE = base
                ? ria.__API.getPipelineMethodCallProxyFor(base, base.__META, scope)
                : BaseIsUndefined;
        } }());

    _DEBUG && ria.__API.addPipelineMethodCallStage('CallFinally',
        function (body, meta, scope, callSession) {
            window.SELF = callSession.__OLD_SELF;
            delete callSession.__OLD_SELF;

            window.BASE = callSession.__OLD_BASE;
            delete callSession.__OLD_BASE;
        });

})();