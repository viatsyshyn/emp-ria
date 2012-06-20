REQUIRE('hwa.reflection.Exception');
REQUIRE('hwa.reflection.Reflector');
REQUIRE('hwa.reflection.ReflectionMethod');
REQUIRE('hwa.reflection.ReflectionInterface');
REQUIRE('hwa.reflection.ReflectionProperty');

/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {
    "use strict";

    /** @class hwa.reflection.ReflectionClass */
    CLASS('ReflectionClass', EXTENDS(hwa.reflection.Reflector), [
        PRIVATE, ArrayOf(hwa.reflection.ReflectionInterface), 'interfaces_',
        PRIVATE, ArrayOf(hwa.reflection.ReflectionMethod), 'methods_',
        PRIVATE, ArrayOf(hwa.reflection.ReflectionProperty), 'properties_',
        PRIVATE, Object, 'base_',
        PRIVATE, Array, 'children_',

        [Function],
        PUBLIC, function __constructor(clazz) {
            if (!hwa.__API.ClassDescriptor.isClassConstructor(clazz))
                throw new hwa.reflection.Exception('ReflectionClass works only on hwa.base classes');

            this.clazz = clazz.__classDescriptor;
            this.declaration = clazz;
        },

        [hwa.__API.ClassDescriptor],
        PUBLIC, function __constructor(clazz) {
            this.clazz = clazz;
            this.declaration = clazz.ctor;
        },

        [Override],
        PUBLIC, Boolean, function hasAnnotation(annotation) {
            return this.getAnnotation(annotation) !== null;
        },

        [Override],
        PUBLIC, Object, function getAnnotation(annotation) {
            var a = this.clazz.annotations;
            var index = a.length;
            for(; index > 0; index--)
                if (a[index - 1] instanceof annotation.__annotationDescriptor.ctor)
                    return a[index - 1];
            
            return null;
        },

        [Override],
        PUBLIC, Array, function getAnnotations() {
            return this.clazz.annotations;
        },

        PUBLIC, Function, function getConstructor () {
            return this.clazz.ctor;
        },

        PUBLIC, ArrayOf(hwa.reflection.ReflectionInterface), function getInterfaces() {
            if (!this.interfaces_)
                this.interfaces_ = this.clazz.interfaces.map(function (ifc) {
                    return new hwa.reflection.ReflectionInterface(ifc.proxy);
                });

            return [].slice.call(this.interfaces_);
        },

        PUBLIC, ArrayOf(hwa.reflection.ReflectionMethod), function getMethods() {
            if (!this.methods_)
                this.methods_ = this.clazz.methods.map(function (method) {
                    return new hwa.reflection.ReflectionMethod(method);
                });

            return [].slice.call(this.methods_);
        },

        PUBLIC, Array, function getChildren() {
            if (!this.children_ && hwa.reflection.ReflectionFactory)
                this.children_ = this.clazz.children.map(hwa.reflection.ReflectionFactory);

            if (!this.children_)
                this.children_ = this.clazz.children.map(function (clazz) {
                    return new hwa.reflection.ReflectionClass(clazz);
                });

            return [].slice.call(this.children_);
        },

        PUBLIC, ArrayOf(hwa.reflection.ReflectionProperty), function getProperties() {
            if (!this.properties_)
                this.properties_ = this.clazz.properties.map(function (method) {
                    return new hwa.reflection.ReflectionProperty(method);
                });

            return [].slice.call(this.properties_);
        },

        [Override],
        PUBLIC, String, function getName() {
            return this.declaration.__IDENTIFIER__;
        },

        PUBLIC, function getParentClass() {
            if (!this.clazz.base)
                return null;

            if (!this.base_ && hwa.reflection.ReflectionFactory)
                this.base_ = hwa.reflection.ReflectionFactory(this.clazz.base);

            if (!this.base_)
                this.base_ = new hwa.reflection.ReflectionClass(this.clazz.base);

            return this.base_;
        },

        [Override],
        PUBLIC, String, function getShortName() {
            return this.clazz.name;
        },

        [String],
        PUBLIC, Boolean, function hasMethod(name) {
            var m = this.clazz.methods;
            var index = m.length;
            for(;index > 0; index--)
                if (m[index - 1].name == name)
                    return true;

            return false;
        },

        PUBLIC, Boolean, function isAbstract() {
            return this.clazz.flags.isAbstract;
        },

        PUBLIC, Boolean, function implementsInterface(ifc) {
            if (!hwa.__API.InterfaceDescriptor.isInterfaceProxy(ifc))
                throw new hwa.reflection.Exception('Interface expected');

            var id = ifc.__interfaceDescriptor;
            var base = this.clazz;
            while(base) {
                if (base.interfaces.indexOf(id) >= 0)
                    return true;

                base = base.base;
            }

            return false;
        },

        PUBLIC, Boolean, function isSubclassOf(parentClazz) {
            var p = parentClazz.__classDescriptor;
            var base = this.clazz;
            while(base) {
                if (base == p)
                    return true;

                base = base.base;
            }

            return false;
        },

        PUBLIC, Object, function newInstance() {
            try {
                return new this.declaration();
            } catch (e) {
                throw new hwa.reflection.Exception('Error instantiating ' + this.getName() + '.', e);
            }
        },

        [Array],
        PUBLIC, Object, function newInstanceArgs(args) {
            try {
                return this.clazz.createClassInstance(args);
            } catch (e) {
                throw new hwa.reflection.Exception('Error instantiating ' + this.getName() + '.', e);
            }
        }
    ]);
});