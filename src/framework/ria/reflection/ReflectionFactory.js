REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.reflection', function () {

    var reflectionClassCache = {};

    /** @class ria.reflection.ReflectionFactory */
    ria.reflection.ReflectionFactory = function (clazz, reflector) {
        if (reflector == undefined || reflector == ria.reflection.ReflectionClass) {
            if (clazz instanceof ria.__API.Class)
                clazz = clazz.getClass();

            if (clazz instanceof ria.__API.ClassDescriptor)
                clazz = clazz.ctor;

            if (!ria.__API.isClassConstructor(clazz))
                throw new ria.reflection.Exception('ReflectionFactory works only on CLASS');

            var name = clazz.__META.name;
            if (reflectionClassCache.hasOwnProperty(name))
                return reflectionClassCache[name];

            return reflectionClassCache[name] = new ria.reflection.ReflectionClass(clazz);
        } else {
            // TODO other reflectors caching not implemented;
            return new reflector(clazz);
        }
    };
});