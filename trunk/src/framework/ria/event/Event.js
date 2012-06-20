REQUIRE('hwa.event.IEvent');

/** @namespace hwa.event */
NAMESPACE('hwa.event', function () {
    "use strict";
    
    /**
     * @class hwa.event.Event
     * @implements hwa.event.IEvent
     */
    CLASS(ABSTRACT, 'Event', IMPLEMENTS(hwa.event.IEvent), [

        PUBLIC, function __constructor() {
            this.handlers = [];
            this.reset();
        },

        [Override],
        PUBLIC, ABSTRACT, VOID, function set() {},

        [Override],
        PUBLIC, ABSTRACT, VOID, function reset() {},

        [Override],
        [Function],
        PUBLIC, VOID, function on(handler) {
            this.handlers.push(handler);
        },

        [Override],
        [Function],
        PUBLIC, VOID, function un(handler) {
            var index = this.handlers.indexOf(handler);
            if (index >= 0)
                this.handlers.splice(index, 1);
        },

        PROTECTED, VOID, function broadcast(value) {
            this.handlers.forEach(function (fn) {
                fn(value);
            });
        }
    ]);
});
