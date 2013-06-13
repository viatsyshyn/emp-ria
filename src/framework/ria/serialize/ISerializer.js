NAMESPACE('ria.serialize', function () {

    /** @class ria.serialize.ISerializer */
    INTERFACE(
        'ISerializer', [
            Object, function serialize(object) {},
            Object, function deserialize(raw, clazz) {}
        ]);
});