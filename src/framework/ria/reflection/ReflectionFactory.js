NAMESPACE('ria.reflection', function () {

    var reflectionClassCache = {};

    /** @class ria.reflection.ReflectionFactory */
    ria.reflection.ReflectionFactory = function (clazz) {
        if (clazz instanceof ria.__API.Class)
            clazz = clazz.getClass();

        if (clazz instanceof hwa.__API.ClassDescriptor)
            clazz = clazz.ctor;

        if (!ria.__API.ClassDescriptor.isClassConstructor(clazz))
            throw new ria.reflection.Exception('ReflectionFactory works only on hwa.base classes');

        var name = clazz.__META.name;
        if (reflectionClassCache.hasOwnProperty(name))
            return reflectionClassCache[name];

        return reflectionClassCache[name] = new hwa.reflection.ReflectionClass(clazz);
    };
});