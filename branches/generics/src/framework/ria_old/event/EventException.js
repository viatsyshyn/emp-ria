/** @namespace hwa.event */
NAMESPACE('hwa.event', function () {
    "use strict";

    /** @class hwa.event.EventException */
    EXCEPTION('EventException', [
        [String],
        PUBLIC, function __constructor(message) {
            BASE(message || 'Event exception');
        }
    ]);
});
