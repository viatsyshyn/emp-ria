REQUIRE('hwa.mvc.IActivity');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * Abstract Activity class
     * @class hwa.mvc.Activity
     * @implements hwa.mvc.IActivity
     * @abstract
     */
    CLASS(ABSTRACT, 'Activity', IMPLEMENTS(hwa.mvc.IActivity), [
        PUBLIC, function __constructor() {
            BASE();
            this.inited_ = false;
            this.started_ = false;
            this.paused_ = false;
            this.stopped_ = false;
        },

        /**
         * Make this activity visible and active
         * @see hwa.mvc.Activity.show
         */
        [Override],
        PUBLIC, VOID, function show() {
            if (!this.inited_) {
                this.onCreate();
                this.inited_ = true;
            }

            if (!this.paused_) {
                this.stopped_ && this.onRestart();
                this.onStart();
            }

            this.onResume();

            this.stopped_ = false;
            this.paused_ = false;
        },

        /**
         * Make this activity non-active
         */
        [Override],
        PUBLIC, VOID, function pause() {
            if (!this.paused_) {
                this.onPause();
                this.paused_ = true;
            }
        },

        /**
         * Make this activity non-visible and non-active
         */
        [Override],
        PUBLIC, VOID, function stop() {
            if (!this.stopped_) {
                !this.paused_ && this.onPause();
                this.onStop();
            }

            this.stopped_ = true;
            this.paused_ = false;
        },

        [Override],
        PUBLIC, Boolean, function isForeground() {
            return this.inited_ && !this.paused_ && !this.stopped_;
        },

        [Override],
        PUBLIC, Boolean, function isStarted() {
            return this.inited_ && !this.stopped_;
        },

        PROTECTED, ABSTRACT, VOID, function onCreate() {},
        PROTECTED, VOID, function onStart() {},
        PROTECTED, VOID, function onRestart() {},
        PROTECTED, VOID, function onResume() {},
        PROTECTED, VOID, function onPause() {},
        PROTECTED, VOID, function onStop() {},

        [Override],
        PROTECTED, VOID, function onDispose() {
            this.stop();
            BASE.onDispose();
        }
    ]);
});