"use strict";

REQUIRE('hwa.mvc.IDialogActivity');
REQUIRE('hwa.mvc.Activity');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {

    /**
     * Abstract Dialog Activity class
     * @class hwa.mvc.DialogActivity
     * @implements hwa.mvc.IDialogActivity
     * @extends hwa.mvc.Activity
     * @abstract
     */
    CLASS(ABSTRACT, 'DialogActivity', EXTENDS(hwa.mvc.Activity), IMPLEMENTS(hwa.mvc.IDialogActivity), [
        PUBLIC, function __constructor() {
            BASE();

            this.onStopCallback = hwa.emptyFn;
            this.isModalMode = false;
        },

        /**
         * set Close mode
         * @param {Function} callback
         * @param {Boolean} isModal
         * @return DialogActivity
         */
        [Override],
        [Function, Boolean],
        PUBLIC, VOID, function setCloseMode(callback, isModal) {
            this.onStopCallback = callback || hwa.emptyFn;
            this.isModalMode = isModal || false;
        },

        /**
         * Close this dialog
         */
        PUBLIC, VOID, function close() {
            this.close(hwa.mvc.ModalResult.CLOSE);
        },

        /**
         * Close this dialog with modal result
         */
        [Override],
        [hwa.mvc.ModalResult],
        PUBLIC, VOID, function close(modalResult) {
            this.onStopCallback(this, modalResult);
            this.isModalMode = false;
        }
    ]);
});
