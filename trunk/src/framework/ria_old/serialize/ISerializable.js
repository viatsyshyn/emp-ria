/** @namespace hwa.serialize */
NAMESPACE('hwa.serialize', function () {
    "use strict";

    /** @class hwa.serialize.ISerializable */
    INTERFACE('ISerializable', [
        Object, function serialize() {}
    ])
});