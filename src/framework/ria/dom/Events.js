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
            function CLICK(data_) {
                return new MouseEvent('click', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }))
            },

            function FOCUS(data_) {
                return new FocusEvent('focus', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            function CHANGE(data_) {
                return new UIEvent('change', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            function KEY_UP(data_) {
                return new KeyboardEvent('keyup', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            function KEY_DOWN(data_) {
                return new KeyboardEvent('keydown', def(data_, {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
            },

            function SUBMIT(data_) {
                return new UIEvent('submit', def(data_, {
                                    'view': window,
                                    'bubbles': true,
                                    'cancelable': true
                                }));
            }
        ])
});