REQUIRE('ria.reflection.Reflector');
REQUIRE('ria.reflection.ReflectionCtor');
REQUIRE('ria.reflection.ReflectionMethod');
REQUIRE('ria.reflection.ReflectionProperty');
REQUIRE('ria.reflection.ReflectionInterface');

/** @namespace ria.reflection*/
NS('ria.reflection', function () {
    "use strict";

    /** @class ria.reflection.ReflectionClass */
    CLASS(
        FINAL, 'ReflectionClass', EXTENDS(ria.reflection.Reflector), [
            READONLY, Function, 'clazz',

            function $(clazz) {
                VALIDATE_ARG('clazz', [ria.__API.ClassDescriptor], clazz.__META);
                this.clazz = clazz;
            },

            String, function getName() { return this.clazz.__META.name; },
            String, function getShortName() { return this.clazz.__META.name.split('.').pop(); },

            //Boolean, function isAbstract() { return this.clazz.__META.flags.isAbstract; },
            //Boolean, function isFinal() { return this.clazz.__META.flags.isFinal; },

            OVERRIDE, Array, function getAnnotations() { return this.clazz.__META.anns; },
            Function, function getBaseClass() { return this.clazz.__META.base || null; },

            SELF, function getBaseClassReflector() {
                var base = this.getBaseClass();
                return base ? this.getCached(SELF, base) : null;
            },

            ArrayOf(Function), function getInterfaces() { return this.clazz.__META.ifcs.slice(); },

            ArrayOf(ria.reflection.ReflectionInterface), function getInterfacesReflector() {
                return this.getInterfaces()
                    .map(function (_) { return this.getCached(ria.reflection.ReflectionInterface, _); }.bind(this));
            },

            ArrayOf(String), function getMethodsNames() { return Object.keys(this.clazz.__META.methods); },

            [[String]],
            ria.reflection.ReflectionMethod, function getMethodReflector(name) {
                var method = this.clazz.__META.methods[name];
                return method ? new ria.reflection.ReflectionMethod(this.clazz, name) : null;
            },

            ArrayOf(ria.reflection.ReflectionMethod), function getMethodsReflector() {
                return this.getMethodsNames()
                    .map(function (_) { return this.getMethodReflector(_); }.bind(this));
            },

            ArrayOf(String), function getPropertiesNames() { return Object.keys(this.clazz.__META.properties); },

            [[String]],
            ria.reflection.ReflectionProperty, function getPropertyReflector(name) {
                var property = this.clazz.__META.properties[name];
                return property ? new ria.reflection.ReflectionProperty(this.clazz, name) : null;
            },

            ArrayOf(ria.reflection.ReflectionProperty), function getPropertiesReflector() {
                return this.getPropertiesNames()
                    .map(function (_) { return this.getPropertyReflector(_); }.bind(this));
            },

            // TODO: fast way to get children
            ArrayOf(Function), function getChildren() {
                return this.clazz.__META.children.slice();
            },

            ArrayOf(SELF), function getChildrenReflector() {
                return this.getChildren()
                    .map(function (_) { return this.getCached(SELF, _);}.bind(this))
            },

            ria.reflection.ReflectionCtor, function getCtorReflector() {
                return new ria.reflection.ReflectionCtor(this.clazz);
            },

            ArrayOf(Function), function getParents() {
                var parents = [];
                var root = this.getBaseClass();
                while (root != null) {
                    parents.push(root);
                    root = root.__META.base;
                }
                return parents;
            },

            ArrayOf(SELF), function getParentsReflector() {
                return this.getParents()
                    .map(function (_) { return this.getCached(SELF, _)}.bind(this));
            },

            Boolean, function extendsClass(parent) {
                return this.clazz == parent || this.getParents()
                    .some(function (_) { return _ == parent; });
            },

            Boolean, function implementsIfc(ifc) {
                if (!ria.__API.isInterface(ifc))
                    throw ria.reflection.Exception('Interface expected, but got ' + ria.__API.getIdentifierOfType(ifc));

                return this.getInterfaces()
                    .some(function (_) { return _ === ifc });
            },

            [[String]],
            Boolean, function hasProperty(name) {
                return this.clazz.__META.properties.hasOwnProperty(name);
            },

            [[String]],
            Boolean, function hasMethod(name) {
                return this.clazz.__META.methods.hasOwnProperty(name);
            },

            [[Array]],
            Class, function instantiate(args_) {
                return ria.__API.init(null, this.clazz, this.clazz.__META.ctor.impl, args_ ? args_ : []);
            }
        ]);
});
