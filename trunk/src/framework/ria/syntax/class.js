/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    ria.__SYNTAX.toAst = function (x) {
        return new Function ('return ' + x)();
    };

    function isFactoryCtor(name) {
        return name !== '$$' && /^\$.+/i.test(name);
    }

    function getDefaultGetter(property, isOverride) {
        if (isOverride)
            return new ria.__SYNTAX.Tokenizer.FunctionToken(ria.__SYNTAX.toAst(function g() { return BASE(); }.toString().replace('name', property)));

        return new ria.__SYNTAX.Tokenizer.FunctionToken(ria.__SYNTAX.toAst(function g() { return this.name; }.toString().replace('name', property)));
    }

    function getDefaultSetter(property, isOverride) {
        if (isOverride)
            return new ria.__SYNTAX.Tokenizer.FunctionToken(ria.__SYNTAX.toAst(function s(value) { return BASE(value); }.toString().replace('name', property)));

        return new ria.__SYNTAX.Tokenizer.FunctionToken(ria.__SYNTAX.toAst(function s(value) { this.name = value; }.toString().replace('name', property)));
    }

    function getDefaultCtor() {
        return new ria.__SYNTAX.Tokenizer.FunctionToken(ria.__SYNTAX.toAst(function $() { BASE(); }.toString()));
    }

    ria.__SYNTAX.resolveNameFromToken = function (x) {
        return x.value.__META.name;
    };

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {MethodDescriptor}
     */
    function findParentMethodFixed(def, name){
        var base = def.base && ria.__SYNTAX.Registry.find(ria.__SYNTAX.resolveNameFromToken(def.base));
        return base && (
            base.methods.filter(function(method){ return method.name == name }).pop()
            || findParentMethodFixed(base, name));
    }

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {PropertyDescriptor}
     */
    function findParentPropertyFixed(def, name){
        var base = def.base && ria.__SYNTAX.Registry.find(ria.__SYNTAX.resolveNameFromToken(def.base));
        return base &&
            (base.properties.filter(function(property){ return property.name == name }).pop()
            || findParentPropertyFixed(base, name));
    }

    /**
     * @param {ClassDescriptor} def
     * @param {String} name
     * @return {Object}
     */
    function findParentPropertyByGetterOrSetterFixed(def, name){
        var base = def.base && ria.__SYNTAX.Registry.find(ria.__SYNTAX.resolveNameFromToken(def.base));
        return base &&
            (base.properties.filter(function (_) { return _.getSetterName() == name || _.getGetterName() == name;}).pop()
            || findParentPropertyByGetterOrSetterFixed(base, name));
    }

    ria.__SYNTAX.precalcClassOptionalsAndBaseRefs = function (def, baseClass) {
        // validate if base is descendant on Class
        def.base = def.base === null ? new ria.__SYNTAX.Tokenizer.RefToken(baseClass) : def.base;

        var baseSyntaxMeta = ria.__SYNTAX.Registry.find(ria.__SYNTAX.resolveNameFromToken(def.base));

        // add omitted default constructor
        var classCtorDef = def.methods.filter(function (_) {return _.name === '$'; }).pop();
        if (!classCtorDef) {
            classCtorDef = new ria.__SYNTAX.MethodDescriptor('$', [], [], null, {}, getDefaultCtor(), []);
            def.methods.unshift(classCtorDef);
        }

        // defined override properties
        def.methods
            .map(function (method) {
                return findParentPropertyByGetterOrSetterFixed(def, method.name);
            })
            .filter(function (_) { return _; })
            .reduce(function (list, node) {
                if (list.indexOf(node) < 0)
                    list.push(node);

                return list;
            }, [])
            .forEach(function (baseProperty) {
                def.properties.push(new ria.__SYNTAX.PropertyDescriptor(
                    baseProperty.name,
                    baseProperty.type,
                    baseProperty.annotations,
                    baseProperty.flags,
                    true));
            });

        // add omitted getter/setter of properties
        def.properties
            .forEach(function (property) {
                var name = property.name;
                ria.__SYNTAX.validateVarName(name);
                var getterName = property.getGetterName();
                var flags = ria.__API.clone(property.flags);
                flags.isOverride = property.isOverride;
                var getterDef = def.methods.filter(function (_) {return _.name === getterName; }).pop();
                if (!getterDef) {
                    getterDef = new ria.__SYNTAX.MethodDescriptor(
                        getterName,
                        [],
                        [],
                        property.type,
                        flags,
                        getDefaultGetter(name, property.isOverride),
                        []);
                    def.methods.push(getterDef);
                }

                if (!property.flags.isReadonly) {
                    var setterName = property.getSetterName();
                    var setterDef = def.methods.filter(function (_) {return _.name === setterName; }).pop();
                    if (!setterDef) {
                        setterDef = new ria.__SYNTAX.MethodDescriptor(
                            setterName,
                            ['value'],
                            [property.type],
                            new ria.__SYNTAX.Tokenizer.VoidToken(),
                            flags,
                            getDefaultSetter(name, property.isOverride),
                            []);
                        def.methods.push(setterDef);
                    }
                }

                property.__GETTER_DEF = getterDef;
                property.__SETTER_DEF = setterDef;
            });

        // TODO: ensure optional type hints
        /*def.methods
         .forEach(function (method) {

         });*/

        // find BASE for each method (including ctor, getters & setters)
        def.methods
            .forEach(function (method) {
                method.__BASE_META = findParentMethodFixed(def, method.name);
            });
    };

    function checkXxxOfIsSELF(token, descriptor) {
        return token.value instanceof descriptor
            && token.value.clazz == ria.__SYNTAX.Modifiers.SELF;
    }

    function processSelf(token, SELF) {
        if (Array.isArray(token))
            return token.map(function (_) { return processSelf(_, SELF); });

        if (!token)
            return token;

        if (token instanceof ria.__SYNTAX.Tokenizer.SelfToken)
            return new ria.__SYNTAX.Tokenizer.RefToken(SELF);

        if (checkXxxOfIsSELF(token, ria.__API.ArrayOfDescriptor))
            return new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ArrayOf(SELF));

        if (checkXxxOfIsSELF(token, ria.__API.ClassOfDescriptor))
            return new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ClassOf(SELF));

        if (checkXxxOfIsSELF(token, ria.__API.ClassOfDescriptor))
            return new ria.__SYNTAX.Tokenizer.RefToken(ria.__API.ClassOf(SELF));

        return token;
    }

    /* VALIDATE */

    function isSameFlags(def1, def2){
        for(var flag in def1.flags)  {
            if (flag == 'isReadonly') continue;
            if (flag == 'isOverride') continue;
            if (def1.flags.hasOwnProperty(flag) && def1.flags[flag] != def2.flags[flag])
                return false;
        }
        return true;
    }

    function validateMethodDeclaration(def, method) {
        var parentMethod = method.__BASE_META;
        if (method.flags.isOverride && !parentMethod) {
            throw Error('There is no ' + method.name + ' method in base classes of ' + def.name + ' class');
        }

        if (!method.flags.isOverride && parentMethod) {
            throw Error('Method ' + method.name + ' of ' + def.name + ' should be marked with OVERRIDE as one base classes has same method');
        }

        if (method.flags.isAbstract && parentMethod) {
            throw Error('Method ' + method.name + ' can\'t be abstract, because there is method with the same name in one of the base classes');
        }

        if (parentMethod && parentMethod.flags.isFinal) {
            throw Error('Final method ' + method.name + ' can\'t be overridden in ' + def.name + ' class');
        }
    }

    function validatePropertyDeclaration(property, def, processedMethods) {
        var getterName = property.getGetterName();
        var setterName = property.getSetterName();

        var getterDef = property.__GETTER_DEF;
        if (!isSameFlags(property, getterDef))
            throw Error('The flags of getter ' + getterName + ' should be the same with property flags');

        var setterDef = property.__SETTER_DEF;
        if (property.flags.isReadonly) {
            if (setterDef) throw Error('There is no ability to add setter to READONLY property ' + property.name + ' in ' + def.name + ' class');
        } else if (!isSameFlags(property, setterDef)) {
            throw Error('The flags of setter ' + setterName + ' should be the same with property flags');
        }

        processedMethods.push(getterName);
        processedMethods.push(setterName);
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

    function isDescendantOf(token, rootClassMeta) {
        var meta = ria.__SYNTAX.Registry.find(ria.__SYNTAX.resolveNameFromToken(token));
        return meta === rootClassMeta || meta.base && isDescendantOf(meta.base, rootClassMeta);
    }

    ria.__SYNTAX.validateClassDecl = function (def, rootClassName) {

        if(!isDescendantOf(def.base, ria.__SYNTAX.Registry.find(rootClassName)))
            throw Error('Base class must be descendant of ' + rootClassName);

        ria.__SYNTAX.validateVarName(def.name);

        // validate class flags
        if(def.flags.isOverride)
            throw Error('Modifier OVERRIDE is not supported in classes');

        if(def.flags.isReadonly)
            throw Error('Modifier READONLY is not supported in classes');

        if(def.flags.isAbstract && def.flags.isFinal)
            throw Error('Class can not be ABSTRACT and FINAL simultaneously');

        // validate no duplicate members
        def.methods
            .forEach(function (_) {
                var name = _.name;
                ria.__SYNTAX.validateVarName(name);

                if (isFactoryCtor(name))
                    throw Error('Factory constructors are not supported in this version.');

                if (def.methods.filter(function (_) { return _.name === name}).length > 1)
                    throw Error('Duplicate method declaration "' + name + '"');
            });

        // validate no duplicate properties
        def.properties
            .forEach(function (_) {
                var name = _.name;
                if (def.properties.filter(function (_) { return _.name === name}).length > 1)
                    throw Error('Duplicate property declaration "' + name + '"');
            });

        var processedMethods = [];
        var baseSyntaxMeta = ria.__SYNTAX.Registry.find(ria.__SYNTAX.resolveNameFromToken(def.base));

        if (baseSyntaxMeta.flags.isFinal)
            throw Error('Can NOT extend final class ' + ria.__SYNTAX.resolveNameFromToken(def.base));

        // TODO: validate ctor declaration
        processedMethods.push('$');

        // validate methods overrides
        baseSyntaxMeta.methods.forEach(function(baseMethod) {
            if(baseMethod.name == "$")
                return;

            validateBaseClassMethodDeclaration(def, baseMethod);
        });

        // validate methods
        def.methods
            .forEach(
            /**
             * @param {MethodDescriptor} method
             */
                function (method) {
                // skip processed methods
                if (processedMethods.indexOf(method.name) >= 0)
                    return;

                validateMethodDeclaration(def, method);
            });

        // validate properties overrides
        baseSyntaxMeta.properties.forEach(function(baseProperty){
            var childGetter = def.methods.filter(function(method){ return method.name == baseProperty.getGetterName() }).pop(),
                childSetter = def.methods.filter(function(method){ return method.name == baseProperty.getSetterName() }).pop();

            validateBaseClassPropertyDeclaration(baseProperty, childGetter, childSetter, def);
        });

        // validate properties
        def.properties.forEach(
            /**
             * @param {PropertyDescriptor} property
             */
                function (property) {
                if (property.isOverride)
                    return;

                if(findParentPropertyFixed(def, property.name))
                    throw Error('There is defined property ' + property.name + ' in one of the base classes');

                validatePropertyDeclaration(property, def, processedMethods);
            });
    };

    /* COMPILE */

    /**
     *
     * @param {Function} body
     * @param SELF
     * @param [method]
     * @returns {Function}
     */
    function addSelfAndBaseBody(body, SELF, method) {
        body.__SELF = SELF;
        if (method && method.__BASE_META) {
            if (method.flags.isOverride) {
                body.__BASE_BODY = method.__BASE_META.body.value;
            }

            body.__BASE_BODY = method.__BASE_META.body.value;
        }

        return body;
    }

    function compileMethodDeclaration(def, method, ClassProxy) {
        method.retType = processSelf(method.retType, ClassProxy);
        method.argsTypes = processSelf(method.argsTypes, ClassProxy);

        var impl = ClassProxy.prototype[method.name] = addSelfAndBaseBody(method.body.value, ClassProxy, method);
        ria.__API.method(
            ClassProxy,
            impl,
            method.name,
            method.retType ? method.retType.value : null,
            method.argsTypes.map(function (_) { return _.value }),
            method.argsNames,
            method.annotations.map(function(_) { return _.value }));
    }

    function compilePropertyDeclaration(property, ClassProxy, processedMethods) {
        var getterName = property.getGetterName();
        var setterName = property.getSetterName();

        var getterDef = property.__GETTER_DEF;
        var setterDef = property.__SETTER_DEF;

        processedMethods.push(getterName);
        processedMethods.push(setterName);

        property.type = processSelf(property.type, ClassProxy);

        var getter = ClassProxy.prototype[getterName] = addSelfAndBaseBody(getterDef.body.value, ClassProxy, getterDef);

        if (!property.flags.isReadonly) {
            var setter = ClassProxy.prototype[setterName] = addSelfAndBaseBody(setterDef.body.value, ClassProxy, setterDef);
        }

        ria.__API.property(
            ClassProxy,
            property.name,
            property.type.value,
            property.annotations.map(function (_) { return _.value }),
            getter,
            setter || null);
    }

    function compileCtorDeclaration(def, ClassProxy, processedMethods) {
        var ctorDef = def.methods.filter(function (_1) { return _1.name == '$'}).pop();

        processedMethods.push('$');

        ClassProxy.prototype.$ = ctorDef.body.value;
        ClassProxy.prototype.$.__BASE_BODY = def.base.value.__META.ctor.impl;
        ClassProxy.prototype.$.__SELF = ClassProxy;
        ria.__API.ctor(
            ClassProxy,
            ClassProxy.prototype.$,
            ctorDef.argsTypes.map(function (_) { return _.value }),
            ctorDef.argsNames,
            ctorDef.annotations.map(function(item){
                return item.value
            })
        );
    }

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

                compileMethodDeclaration(def, method, ClassProxy);
            });

        ria.__API.compile(ClassProxy);

        ria.__SYNTAX.Registry.registry(name, def);

        return ClassProxy;
    };

    ria.__SYNTAX.CLASS = function () {
        var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
        ria.__SYNTAX.precalcClassOptionalsAndBaseRefs(def, ria.__API.Class);
        ria.__SYNTAX.validateClassDecl(def, 'Class');
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