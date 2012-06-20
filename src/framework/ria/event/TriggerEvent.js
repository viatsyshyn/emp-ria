REQUIRE('hwa.event.Event');
REQUIRE('hwa.event.EventException');

/** @namespace hwa.event */
NAMESPACE('hwa.event', function () {
    "use strict";

    /**
     * @class hwa.event.TriggerEvent
     * @extends hwa.event.Event
     */
    CLASS('TriggerEvent', EXTENDS(hwa.event.Event), [
        PUBLIC, function __constructor() {
            BASE();
            this.fired = false;
        },

        [Override],
        PUBLIC, VOID, function set() {
            if (this.fired)
                throw new hwa.event.EventException('Event already fired');

            this.setFired(true);
        },

        [Override],
        PUBLIC, VOID, function reset() {
            this.setFired(false);
        },

        [Boolean],
        PRIVATE, VOID, function setFired(value) {
            this.fired = value;
            this.broadcast(value);
        }
    ]);
});