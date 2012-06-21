(function (ria) {
    "use strict";

    function inheritFrom(superClass) {
        function InheritanceProxyClass() {}
        InheritanceProxyClass.prototype = superClass.prototype;
        return new InheritanceProxyClass();
    }

    function extend(subClass, superClass) {
        subClass.prototype = inheritFrom(superClass);
        subClass.prototype.constructor = subClass;
    }

    function Annotation() {}

    Annotation.prototype['toString'] = function toString() {
        return this.constructor.getName();
    };

    Object.freeze(Annotation);

    function createAnnotationConstructor (name) {
        var f = (new Function('return function ' + name + '() {}'))();
        extend(f, Annotation);
        return f;
    }

    function AnnotationDescriptor(name, params) {
        this.name = name;
        this.params = params;
        this.ctor = createAnnotationConstructor(name);
        this.proxy = this.getAnnotationProxy();
    }

    AnnotationDescriptor.prototype.getAnnotationProxy = function () {
        var ds = this;
        var f = function AnnotationProxy() {
            if (this instanceof AnnotationProxy)
                throw Error('Annotation can NOT be instantiated');

            var args = [].slice.call(arguments);
            if (args.length > ds.params.length)
                throw Error('Annotation ' + ds.name + ' requires no more then ' + ds.params.length + ' arguments');

            var obj = new ds.ctor();
            for(var index = 0; index < ds.params.length; index++)
                obj[ds.params[index]] = index < args.length ? args[index] : null;

            Object.freeze(obj);

            return obj;
        };

        f.__annotationDescriptor = ds;
        return f;
    };

    AnnotationDescriptor.build = function (args) {
        if (args.length != 1)
            throw Error('Annotation requires one argument');

        var body = args.pop();
        if (typeof body !== 'function')
            throw Error('Annotation declaration should be a function.');

        var name = body.getName();
        var params = body.getParameters();
        return new AnnotationDescriptor(name, params);
    };

    AnnotationDescriptor.isAnnotationProxy = function (value) {
        return value
            && typeof value === 'function'
            && value.__annotationDescriptor instanceof AnnotationDescriptor;
    };

    AnnotationDescriptor.isAnnotation = function (value) {
        return value != Object && value != Array && value != String && value != RegExp && value != Function
            && (value instanceof Annotation || this.isAnnotationProxy(value));
    };

    AnnotationDescriptor.normalize = function (value) {
        if (this.isAnnotationProxy(value))
            return value();

        if (this.isAnnotation(value))
            return value;

        throw Error('Can NOT normalize non Annotation value');
    };

    Object.freeze(AnnotationDescriptor);

    ria.__API.AnnotationDescriptor = AnnotationDescriptor;

    ria.__API.Annotation = AnnotationDescriptor.build([Annotation]);
})(ria);