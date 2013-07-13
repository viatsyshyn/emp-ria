/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    function getDefaultGetter(property, name) {
        return {value: new Function ('return ' + function getPropertyProxy() { return this.name; }.toString().replace('name', property).replace('getProperty', name))()};
    }

    function getDefaultSetter(property, name) {
        return {value: new Function ('return ' + function setPropertyProxy(value) { this.name = value; }.toString().replace('name', property).replace('setProperty', name))()};
    }

    function getDefaultCtor(name) {
        return {value: new Function ('return ' + function ConstructorProxy(value) { BASE(); }.toString().replace('Constructor', name))() };
    }

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {MethodDescriptor}
     */
    function findParentMethod(def, name){
        if (!def.base)
            return null;

        var base = ria.__SYNTAX.Registry.find(def.base.value.__META.name);
        var baseMethod = null;
        while (base) {
            baseMethod = base.methods.filter(function(method){ return method.name == name }).pop();
            if (baseMethod)
                break;
            base = base.base && ria.__SYNTAX.Registry.find(base.base.value.__META.name);
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
        for(var flag in def1.flags)  {
            if (flag == 'isReadonly') continue;
            if (def1.flags.hasOwnProperty(flag) && def1.flags[flag] != def2.flags[flag])
                return false;
        }
        return true;
    }

    function validateGetterSetterOverride(method, def, baseSearchResult, processedMethods) {
        if (!method.flags.isOverride)
            throw Error('Method' + method.name + ' have to be marked as OVERRIDE in ' + def.name + ' class');

        var property = baseSearchResult.property;
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

        var newProperty = new ria.__SYNTAX.PropertyDescriptor(property.name, property.type, property.annotations, method.flags);
        newProperty.getterDef = getterInMethods;
        newProperty.setterDef = setterInMethods;
        def.properties.push(newProperty);
    }

    function compileGetterSetterOverride(method, def, baseSearchResult, processedMethods, ClassProxy) {
        var property = baseSearchResult.property;

        var getter, setter;

        var setterInMethods = def.methods.filter(function (_1) { return _1.name == property.getSetterName() }).pop();
        setterInMethods && processedMethods.push(setterInMethods.name);

        var getterInMethods = def.methods.filter(function (_1) { return _1.name == property.getGetterName() }).pop();
        getterInMethods && processedMethods.push(getterInMethods.name);

        var propertyFromMeta = findParentPropertyFromMeta(def, property.name);

        getter = getterInMethods ? getterInMethods.body.value : function () {
            //noinspection JSPotentiallyInvalidConstructorUsage
            return BASE();
        };
        ClassProxy.prototype[getter.name] = getter;
        getter.__BASE_BODY = propertyFromMeta.getter;
        getter.__SELF = ClassProxy;

        if (!property.flags.isReadonly) {
            setter = setterInMethods ? setterInMethods.body.value : function (value) {
                //noinspection JSPotentiallyInvalidConstructorUsage
                BASE(value);
            };
            ClassProxy.prototype[setter.name] = setter;
            setter.__BASE_BODY = propertyFromMeta.setter;
            setter.__SELF = ClassProxy;
        }

        ria.__API.property(ClassProxy, property.name, property.type, property.annotations, getter, setter);
        var newProperty = new ria.__SYNTAX.PropertyDescriptor(property.name, property.type, property.annotations, method.flags);
        def.properties.push(newProperty);
    }

    function validateMethodDeclaration(def, method) {
        var parentMethod = findParentMethod(def, method.name);
        if (method.flags.isOverride && !parentMethod) {
            throw Error('There is no ' + method.name + ' method in base classes of ' + def.name + ' class');
        }

        if (method.flags.isAbstract && parentMethod) {
            throw Error(method.name + ' can\'t be abstract, because there is method with the same name in one of the base classes');
        }

        if (parentMethod && parentMethod.flags.isFinal) {
            throw Error('Final method ' + method.name + ' can\'t be overridden in ' + def.name + ' class');
        }
    }

    function compileMethodDeclaration(def, method, ClassProxy) {
        var parentMethod = findParentMethod(def, method.name);
        if (method.flags.isOverride) {
            method.body.value.__BASE_BODY = parentMethod.body.value;
        }

        if (method.retType instanceof ria.__SYNTAX.Tokenizer.SelfToken) {
            method.retType = new ria.__SYNTAX.Tokenizer.RefToken(ClassProxy);
        }

        if (method.retType
                && method.retType.value instanceof ria.__API.ArrayOfDescriptor
                && method.retType.value.clazz == ria.__SYNTAX.Modifiers.SELF) {
            method.retType = new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ArrayOf(ClassProxy));
        }

        if (method.retType
            && method.retType.value instanceof ria.__API.ClassOfDescriptor
            && method.retType.value.clazz == ria.__SYNTAX.Modifiers.SELF) {
            method.retType = new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ClassOf(ClassProxy));
        }

        method.argsTypes.forEach(function (t, index) {
            if (method.argsTypes[index] instanceof ria.__SYNTAX.Tokenizer.SelfToken)
                method.argsTypes[index] = new ria.__SYNTAX.Tokenizer.RefToken(ClassProxy);

            if (method.argsTypes[index]
                    && method.argsTypes[index].value instanceof ria.__API.ArrayOfDescriptor
                    && method.argsTypes[index].value.clazz == ria.__SYNTAX.Modifiers.SELF) {
                method.argsTypes[index] = new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ArrayOf(ClassProxy));
            }

            if (method.argsTypes[index]
                && method.argsTypes[index].value instanceof ria.__API.ClassOfDescriptor
                && method.argsTypes[index].value.clazz == ria.__SYNTAX.Modifiers.SELF) {
                method.argsTypes[index] = new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ClassOf(ClassProxy));
            }
        });

        var impl = ClassProxy.prototype[method.name] = method.body.value;
        impl.__SELF = ClassProxy;
        ria.__API.method(ClassProxy, impl, method.name,
            method.retType ? method.retType.value : null,
            method.argsTypes.map(function (_) { return _.value }),
            method.argsNames,
            method.annotations.map(function(_) { return _.value }));
    }

    function validatePropertyDeclaration(property, def, processedMethods) {
        var getterName = property.getGetterName();
        var setterName = property.getSetterName();

        var getterDef = def.methods.filter(function (_1) { return _1.name == getterName }).pop();
        if (getterDef && !isSameFlags(property, getterDef))
            throw Error('The flags of getter ' + getterDef.name + ' should be the same with property flags');

        var setterDef = def.methods.filter(function (_1) { return _1.name == setterName }).pop();
        if (setterDef && property.flags.isReadonly)
            throw Error('There is no ability to add setter to READONLY property ' + property.name + ' in ' + def.name + ' class');

        if (setterDef && !isSameFlags(property, setterDef))
            throw Error('The flags of setter ' + setterDef.name + ' should be the same with property flags');

        processedMethods.push(getterName);
        processedMethods.push(setterName);

        property.getterDef = getterDef;
        property.setterDef = setterDef;
    }

    function compilePropertyDeclaration(property, ClassProxy, processedMethods) {
        var getterName = property.getGetterName();
        var setterName = property.getSetterName();

        var getterDef = property.getterDef;
        var setterDef = property.setterDef;

        processedMethods.push(getterName);
        processedMethods.push(setterName);

        if (property.type instanceof ria.__SYNTAX.Tokenizer.SelfToken) {
            property.type = new ria.__SYNTAX.Tokenizer.RefToken(ClassProxy);
        }

        // TODO: handle ArrayOf(SELF) and ClassOf(SELF)

        var getter = getterDef ? getterDef.body : getDefaultGetter(property.name, getterName);
        ClassProxy.prototype[getterName] = getter.value;
        ClassProxy.prototype[getterName].__SELF = ClassProxy;

        var setter = null;
        if (!property.flags.isReadonly) {
            setter = setterDef ? setterDef.body : getDefaultSetter(property.name, setterName);
            ClassProxy.prototype[setterName] = setter.value;
            ClassProxy.prototype[setterName].__SELF = ClassProxy;
        }

        ria.__API.property(ClassProxy, property.name,
            property.type.value,
            property.annotations.map(function (_) { return _.value }),
            getter.value, setter ? setter.value : null);
    }

    function compileCtorDeclaration(def, ClassProxy, processedMethods) {
        var ctorDef = def.methods.filter(function (_1) { return _1.name == '$'}).pop();

        var ctor = ctorDef ? ctorDef.body.value : getDefaultCtor(def.name).value;
        var argsTypes = ctorDef ? ctorDef.argsTypes : [];
        var argsNames = ctorDef ? ctorDef.argsNames : [];
        var anns = ctorDef ? ctorDef.annotations.map(function(item){
            return item.value
        }) : [];

        ClassProxy.prototype.$ = ctor;
        ClassProxy.prototype.$.__BASE_BODY = def.base ? def.base.value.__META.ctor.impl : undefined;
        ClassProxy.prototype.$.__SELF = ClassProxy;
        ria.__API.ctor(ClassProxy, ClassProxy.prototype.$,
            argsTypes.map(function (_) { return _.value }),
            argsNames, anns);

        processedMethods.push('$');
    }

    function validateBaseClassMethodDeclaration(def, baseMethod) {
        var childMethod = def.methods.filter(function (method) { return method.name == baseMethod.name; }).pop();
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

    function validateBaseClassPropertyDeclaration(baseProperty, childGetter, childSetter, def) {
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

    ria.__SYNTAX.validateClassDecl = function (def, baseClass) {
        // validate if base is descendant on Class
        def.base = def.base === null ? new ria.__SYNTAX.Tokenizer.RefToken(baseClass) : def.base;

        if(!ria.__SYNTAX.isDescendantOf(def.base.value, baseClass))
            throw Error('Base class must be descendant of ' + baseClass.__META.name);

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

        var baseSyntaxMeta = ria.__SYNTAX.Registry.find(def.base.value.__META.name);

        if (baseSyntaxMeta.flags.isFinal)
            throw Error('Can NOT extend final class ' + def.base.value.__META.name);

        baseSyntaxMeta.properties.forEach(function(baseProperty){
            var childGetter = def.methods.filter(function(method){ return method.name == baseProperty.getGetterName() }).pop(),
                childSetter = def.methods.filter(function(method){ return method.name == baseProperty.getSetterName() }).pop();

            validateBaseClassPropertyDeclaration(baseProperty, childGetter, childSetter, def);
        });

        baseSyntaxMeta.methods.forEach(function(baseMethod){
            if(baseMethod.name == "$")
                return;

            validateBaseClassMethodDeclaration(def, baseMethod);
        });

        var processedMethods = [];
        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                if(findParentProperty(def, property.name))
                    throw Error('There is defined property ' + property.name + ' in one of the base classes');

                validatePropertyDeclaration(property, def, processedMethods);
            });

        // TODO: validate ctor declaration
        processedMethods.push('$');

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
                    validateGetterSetterOverride(method, def, baseSearchResult, processedMethods);
                    return;
                }

                validateMethodDeclaration(def, method);
            });
    };

    /**
     * @param {String} name
     * @param {ClassDescriptor} def
     * @return {Function}
     */
    ria.__SYNTAX.compileClass = function (name, def) {

        var processedMethods = [];

        var $$Def = def.methods.filter(function (_1) { return _1.name == '$$'}).pop();
        var $$ = $$Def ? $$Def.body.value : ria.__API.init;
        processedMethods.push('$$');

        var ClassProxy = function ClassProxy() {
            var _old_SELF = window.SELF;
            try {
                window.SELF = ClassProxy;
                return $$.call(undefined, this, ClassProxy, ClassProxy.prototype.$, arguments);
            } catch (e) {
                throw new Exception('Error instantiating class ' + name, e);
            } finally {
                window.SELF = _old_SELF;
            }
        };

        ria.__API.clazz(ClassProxy, name,
            def.base.value,
            def.ifcs.values,//.map(function (_) { return _.value }),
            def.annotations.map(function (_) { return _.value }),
            def.flags.isAbstract);

        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
            function (property) {
                compilePropertyDeclaration(property, ClassProxy, processedMethods);
            });

        compileCtorDeclaration(def, ClassProxy, processedMethods);

        def.methods
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
            function (method) {
                // skip processed methods
                if (processedMethods.indexOf(method.name) >= 0)
                    return;

                /*var baseSearchResult = findParentPropertyByGetterOrSetter(def, method.name);
                if (baseSearchResult.property) {
                    compileGetterSetterOverride(method, def, baseSearchResult, processedMethods, ClassProxy);
                    return;
                }*/

                compileMethodDeclaration(def, method, ClassProxy);
            });

        ria.__API.compile(ClassProxy);

        ria.__SYNTAX.Registry.registry(name, def);

        return ClassProxy;
    };

    ria.__SYNTAX.CLASS = function () {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
        ria.__SYNTAX.validateClassDecl(def, ria.__API.Class);
        var name = ria.__SYNTAX.getFullName(def.name);
        var clazz = ria.__SYNTAX.compileClass(name, def);
        ria.__SYNTAX.isProtected(name) || ria.__SYNTAX.define(name, clazz);
        return clazz;
    };

    function BaseIsUndefined() { throw Error('BASE is supported only on method with OVERRIDE'); }

    if (ria.__CFG.enablePipelineMethodCall) {
        ria.__API.addPipelineMethodCallStage('CallInit',
            function (body, meta, scope, callSession) {
                callSession.__OLD_SELF = window.SELF;
                window.SELF = body.__SELF;

                callSession.__OLD_BASE = window.BASE;
                var base = body.__BASE_BODY;
                window.BASE = base
                    ? ria.__API.getPipelineMethodCallProxyFor(base, base.__META, scope)
                    : BaseIsUndefined;
            });

        ria.__API.addPipelineMethodCallStage('CallFinally',
            function (body, meta, scope, callSession) {
                window.SELF = callSession.__OLD_SELF;
                delete callSession.__OLD_SELF;

                window.BASE = callSession.__OLD_BASE;
                delete callSession.__OLD_BASE;
            });
    }
})();