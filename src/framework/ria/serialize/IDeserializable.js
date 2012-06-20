/** @namespace hwa.serialize */
NAMESPACE('hwa.serialize', function () {
    "use strict";

    /** @class hwa.serialize.IDeserializable */
    INTERFACE('IDeserializable', [
        VOID, function deserialize(raw) {}
    ])
});