REQUIRE('ria.reflection.Exception');
REQUIRE('ria.reflection.ReflectionClass');

/** @namespace hwa.reflection */
NAMESPACE('hwa.reflection', function () {

  var reflectionClassCache = {};
  var ReflectionFactory = function (clazz) {
    if (clazz instanceof hwa.__API.Class)
      clazz = clazz.getClass();

    if (clazz instanceof hwa.__API.ClassDescriptor)
      clazz = clazz.ctor;

    if (!hwa.__API.ClassDescriptor.isClassConstructor(clazz))
      throw new hwa.reflection.Exception('ReflectionFactory works only on hwa.base classes');

    if (!reflectionClassCache.hasOwnProperty(clazz.__IDENTIFIER__))
      reflectionClassCache[clazz.__IDENTIFIER__] = new hwa.reflection.ReflectionClass(clazz);

    return reflectionClassCache[clazz.__IDENTIFIER__];
  };

  /** @class hwa.reflection.ReflectionFactory */
  hwa.__API.addToNamespace('ReflectionFactory', ReflectionFactory);
});