/**
 * Created by viatsyshyn on 24.10.13.
 */

NAMESPACE('ria.dom', function () {
    "use strict";

    function def(data, def) {
        return ria.__API.extendWithDefault(data || {}, def);
    }

    /** @class ria.dom.Events */
    CLASS(
        FINAL, 'Events', [
            READONLY, Function, 'clazz',
            READONLY, String, 'type',
            READONLY, Object, 'data',

            function $(clazz, type, data_) {
                this.clazz = clazz;
                this.type = type;
                this.data = def(data_, {});
            },

            [[Node]],
            function triggerOn(node) {
                if (document.createEvent) {
                    node.dispatchEvent(new (this.clazz)(this.type, this.data));
                } else {
                    var evt = document.createEventObject();
                    node.fireEvent("on" + evt.type, evt);
                }
            },

            SELF, function CLICK(data_) {
                return new SELF(MouseEvent, 'click', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }))
            },

            SELF, function FOCUS(data_) {
                return new SELF(FocusEvent, 'focus', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            SELF, function CHANGE(data_) {
                return new SELF(UIEvent, 'change', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            SELF, function KEY_UP(data_) {
                return new SELF(KeyboardEvent, 'keyup', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            SELF, function KEY_DOWN(data_) {
                return new SELF(KeyboardEvent, 'keydown', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            SELF, function SUBMIT(data_) {
                return new SELF(UIEvent, 'submit', def(data_, {
                                    'view': window,
                                    'bubbles': true,
                                    'cancelable': true
                                }));
            }
        ])
});