REQUIRE('hwa.reflection.ReflectionFactory');

REQUIRE('hwa.serialize.SerializeProperty');
REQUIRE('hwa.serialize.IDeserializable');

/** @namespace hwa.serialize */
NAMESPACE('hwa.serialize', function () {
    "use strict";

    /** @class hwa.serialize.JsonSerializer */
    CLASS('JsonSerializer', [

        PUBLIC, Object, function serialize(raw) { },

        [Object, Object],
        PUBLIC, Object, function deserialize(raw, clazz) {
            var value;

            if (clazz === Number || clazz === Boolean || clazz === String)
                return clazz(raw || '');

            if (hwa.__API.isIdentifier(clazz))
                return raw !== undefined ? clazz(raw) : null;

            if (clazz === Object)
                return raw || {};

            if (clazz === Array && (Array.isArray(raw) || raw == null))
                return raw || [];

            if (hwa.__API.isEnum(clazz)) {
                if (raw === null || raw === undefined)
                    return null;

                value = clazz(raw);
                if (value == undefined)
                    throw new Exception('Unknown value "' + raw + '" of enum ' + clazz.__IDENTIFIER__);

                return value;
            }

            if (hwa.__API.ClassDescriptor.isClassConstructor(clazz)) {
                if (raw === null || raw === undefined)
                    return null;

                var ref = hwa.reflection.ReflectionFactory(clazz);
                value = new clazz();

                if (hwa.serialize.IDeserializable.implementedBy(value)) {
                    try {
                        value.deserialize(raw);
                    } catch (e) {
                        throw new Exception('Error in deserialize method of class ' + ref.getName(), e);
                    }
                    return value;
                }

                var properties = ref.getProperties();
                for (var index = 0; index < properties.length; index++) {
                    var property = properties[index];
                    if (!property.isPublic())
                        continue;

                    var name = property.getShortName();
                    if (property.hasAnnotation(hwa.serialize.SerializeProperty))
                        name = property.getAnnotation(hwa.serialize.SerializeProperty).name;

                    try {
                        var tmp = null;
                        var r = raw;
                        var path = name.split('.');
                        var subname;
                        while (path.length > 0 && (subname = path.shift()) && r !== null && r !== undefined)
                            r = r[subname];

                        if (r !== null && r !== undefined )
                            tmp = this.deserialize(r, property.getType());

                        value[property.getSetterName()]( tmp );
                    } catch (e) {
                        throw new Exception('Error deserializing property "' + property.getShortName() + '" of class ' + ref.getName() + ', value: ' + JSON.stringify(r), e);
                    }
                }

                return value;
            }

            if (hwa.__API.ArrayOfDescriptor.isArrayOfDescriptor(clazz)) {
                if (raw === null || raw === undefined)
                    return [];

                if (!Array.isArray(raw))
                    throw new Exception('Value expected to be array');

                value = [];
                for (var i = 0; i < raw.length; i++)
                    try {
                        (raw[i]) && value.push(this.deserialize(raw[i], clazz.valueOf()));
                    } catch (e) {
                        throw new Exception('Error deserializing array value with index ' + i, e);
                    }

                return value;
            }

            throw new Exception('Unsupported type "' + Object.prototype.toString.call(clazz) + '"');
        }
    ])
});