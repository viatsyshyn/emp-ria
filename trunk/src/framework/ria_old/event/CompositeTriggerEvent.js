REQUIRE('hwa.event.IEvent');
REQUIRE('hwa.event.TriggerEvent');

/** @namespace hwa.event */
NAMESPACE('hwa.event', function () {
    "use strict";
  
    /**
     * @class hwa.event.CompositeTriggerEvent
     * @extends hwa.event.TriggerEvent
     */
    CLASS('CompositeTriggerEvent', EXTENDS(hwa.event.TriggerEvent), [
        PUBLIC, function __constructor() {
            BASE();
            this.events = {};
        },

        [hwa.event.IEvent],
        PUBLIC, VOID, function addEvent(event) {
            event.on(function () {
                this.events[event.getHashCode()] = true;
                this.check_();
            }.bind(this));

            this.events[event.getHashCode()] = false;
        },

        [Override],
        PUBLIC, VOID, function reset() {
            for(var k in this.events)
                if (this.events.hasOwnProperty(k))
                    this.events[k] = false;

            BASE.reset();
        },

        PRIVATE, VOID, function check_() {
            for(var k in this.events) {
                if (this.events.hasOwnProperty(k) && this.events[k] === false)
                    return ; // no ready yet
            }

            this.set();
        }
    ]);
});