/**
 * Base exceptions
 */

/** @class NotImplementedException */
EXCEPTION('NotImplementedException', [
    PUBLIC, function __constructor() {
        BASE('Not implemented yet');
    }
]);

/** @class RuntimeException */
EXCEPTION('RuntimeException', [
    [String],
    PUBLIC, function __constructor(message) {
        BASE(message);
    },

    [String, Object],
    PUBLIC, function __constructor(message, inner) {
        BASE(message, inner);
    }
]);

/** @class InstanceIsDisposedException */
EXCEPTION('InstanceIsDisposedException', EXTENDS(RuntimeException), [
    PUBLIC, function __constructor() {
        BASE('Instance is already disposed');
    }
]);
