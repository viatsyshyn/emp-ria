REQUIRE('ria.reflection.ReflectionClass');

REQUIRE('ria.serialize.Exception');
REQUIRE('ria.serialize.SerializeProperty');
REQUIRE('ria.serialize.IDeserializable');
REQUIRE('ria.serialize.ISerializable');
REQUIRE('ria.serialize.ISerializer');

NAMESPACE('ria.serialize', function () {
    "use strict";

    function isValue(_) { return _ !== null && _ !== undefined; }

    /** @class ria.serialize.JsonSerializer */
    CLASS('JsonSerializer', IMPLEMENTS(ria.serialize.ISerializer), [

        Object, function serialize(object) {
            throw Error('Not implemented');
        },

        Object, function deserialize(raw, clazz) {
            var value;

            if (clazz === Object)
                return raw || {};

            if (clazz === Array && (Array.isArray(raw) || raw == null)) {
                return raw || [];
			}

            if (clazz === Boolean) {
                return raw === 'true' || raw === true;
            }

			if(clazz === Number && (raw === '' || raw === null)) {
                return null;
			}

            if (clazz === Number || clazz === String) {                
                return clazz(raw || '');
            }

            if (ria.__API.isIdentifier(clazz))
                return raw !== undefined ? clazz(raw) : null;

            if (ria.__API.isEnum(clazz)) {
                if (raw === null || raw === undefined)
                    return null;

                value = clazz(raw);
                if (value == undefined)
                    throw new ria.serialize.Exception('Unknown value "' + JSON.stringify(raw) + '" of enum ' + clazz.__IDENTIFIER__);

                return value;
            }

            var deserialize = this.deserialize;

            if (ria.__API.isArrayOfDescriptor(clazz)) {
                if (raw === null || raw === undefined)
                    return [];

                if (!Array.isArray(raw))
                    throw new ria.serialize.Exception('Value expected to be array, but got: ' + JSON.stringify(raw));

                var type = clazz.valueOf();
                return raw.filter(isValue).map(function (_, i) {
                    try {
                        return deserialize(_, type);
                    } catch (e) {
                        throw new ria.serialize.Exception('Error deserializing ' + clazz + ' value with index ' + i, e);
                    }
                });
            }

            if (ria.__API.isClassConstructor(clazz)) {
                if (raw === null || raw === undefined)
                    return null;

                var ref = new ria.reflection.ReflectionClass(clazz);
                value = ref.instantiate();

                if (ref.implementsIfc(ria.serialize.IDeserializable)) {
                    try {
                        ref.getMethodReflector('deserialize').invokeOn(value, [raw]);
                    } catch (e) {
                        throw new ria.serialize.Exception('Error in deserialize method of class ' + ref.getName(), e);
                    }
                    return value;
                }

                ref.getPropertiesReflector().forEach(function (property) {
                    if (property.isReadonly())
                        return ;

                    var name = property.getShortName();
                    if (property.isAnnotatedWith(ria.serialize.SerializeProperty))
                        name = property.findAnnotation(ria.serialize.SerializeProperty).pop().name;

                    try {
                        var tmp = null;
                        var r = raw;
                        var path = name.split('.').filter(isValue);
                        while (isValue(r) && path.length)
                            r = r[path.shift()];

                        if (isValue(r))
                            tmp = deserialize(r, property.getType());

                        property.invokeSetterOn(value, tmp);
                    } catch (e) {
                        throw new ria.serialize.Exception('Error deserializing property "' + property.getName() + ', value: ' + JSON.stringify(r), e);
                    }
                });

                return value;
            }

            throw new ria.serialize.Exception('Unsupported type "' + ria.__API.getIdentifierOfType(clazz) + '"');
        }
    ])
});