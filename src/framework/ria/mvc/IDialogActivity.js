/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /** @class hwa.mvc.ModalResult */
    ENUM('ModalResult', {
        OK: 'ok',
        CANCEL: 'cancel',
        CLOSE: 'close'
    });

    /**
     * Base Activity Interface
     *
     * @class hwa.mvc.IDialogActivity
     * @interface
     */
    INTERFACE('IDialogActivity', [
        /**
         * Configure Close Event
         */
        [Function, Boolean],
        VOID, function setCloseMode(callback, isModal) {},

        /**
         * Close dialog
         */
        [hwa.mvc.ModalResult],
        VOID, function close(modalResult) {}
    ]);
});

