NAMESPACE('ria.mvc', function() {
    "use strict";

    /**
     * @class ria.mvc.State
     */
    CLASS(
        'State', [
            String, 'controller',
            String, 'action',
            Array, 'params',
            Boolean, 'public',
            Boolean, 'dispatched',

            function $() {
                this.dispatched = false;
                this.public = false;
            }
        ]);
});