(function () {
    "use strict";

    var parser = hwa.__API.parser;

    function implementedBy(value) {
        if (!hwa.__API.InterfaceDescriptor.isInterfaceProxy(this))
            throw Error('This should not happen ever');

        value = hwa.__API.getConstructorOf(value);
        if (!hwa.__API.ClassDescriptor.isClassConstructor(value))
            return false;

        var id = this.__interfaceDescriptor;
        var base = value.__classDescriptor;
        while(base) {
            if (base.interfaces.indexOf(id) >= 0)
                return true;

            base = base.base;
        }

        return false;
    }

    /**
     * @constructor
     * @param {String} name
     * @param {Array} methods
     */
    function InterfaceDescriptor(name, methods, annotations) {
        this.name = name;
        this.methods = methods;
        this.annotations = annotations;
        this.proxy = this.getInterfaceProxy();
        Object.freeze(this);
    }

    InterfaceDescriptor.prototype.getInterfaceProxy = function () {
        var interfaceDescriptor = this;
        var f = function InterfaceProxy(instance) {
            if (this instanceof InterfaceProxy) {
                var cd = hwa.__API.ClassDescriptor.build(['AnonymousClass', hwa.__API.ImplementsDescriptor.build([f]), instance]);
                return new cd.ctor();
            }

            throw Error('fatal error: expected new when instantiating anonymous class from interface');
        };

        f.implementedBy = implementedBy;

        f.__interfaceDescriptor = interfaceDescriptor;
        return f;
    };

    /**
     *
     * @param {Array} args
     */
    InterfaceDescriptor.build = function (args) {
        var members = args.pop();
        if (!Array.isArray(members))
            throw Error('Expected class declaration array as last argument.');

        var name = args.pop();
        if (typeof name !== 'string')
            throw Error('Expected name as string literal.');

        var annotations = parser.parseAnnotations(args);
        var methods = parser.parseMembers(members, hwa.__API.Visibility.Public);

        return new InterfaceDescriptor(name, methods, annotations);
    };

    InterfaceDescriptor.isInterfaceProxy = function (proxy) {
        return proxy
            && typeof proxy === 'function'
            && proxy.hasOwnProperty('__interfaceDescriptor')
            && proxy.__interfaceDescriptor instanceof InterfaceDescriptor
    };

    Object.freeze(InterfaceDescriptor);

    hwa.__API.InterfaceDescriptor = InterfaceDescriptor;
})();