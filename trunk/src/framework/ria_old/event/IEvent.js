/** @namespace hwa.event */
NAMESPACE('hwa.event', function () {
    "use strict";

    /**
     * @class hwa.event.IEvent
     */
    INTERFACE('IEvent', [
        /**
         * Trigger event
         */
        VOID, function set() {},
        
        /**
         * reset event
         */
        VOID, function reset() {},

        [Function],
        VOID, function on(handler) {},

        [Function],
        VOID, function un(handler) {}
    ]);
});
