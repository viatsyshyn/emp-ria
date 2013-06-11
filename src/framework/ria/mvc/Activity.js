REQUIRE('ria.mvc.IActivity');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /**
     * Abstract Activity class
     * @class ria.mvc.Activity
     */
    CLASS(ABSTRACT,
        'Activity', IMPLEMENTS(ria.mvc.IActivity), [
            function $() {
                BASE();
                this.inited_ = false;
                this.started_ = false;
                this.paused_ = false;
                this.stopped_ = false;
                this.onClose_ = [];
            },

            /**
             * Make this activity visible and active
             * @see ria.mvc.Activity.show
             */
            OVERRIDE, VOID, function show() {
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
            OVERRIDE, VOID, function pause() {
                if (!this.paused_) {
                    this.onPause();
                    this.paused_ = true;
                }
            },

            /**
             * Make this activity non-visible and non-active
             */
            OVERRIDE, VOID, function stop() {
                if (!this.stopped_) {
                    !this.paused_ && this.onPause();
                    this.onStop();
                }

                this.stopped_ = true;
                this.paused_ = false;
            },

            OVERRIDE, Boolean, function isForeground() {
                return this.inited_ && !this.paused_ && !this.stopped_;
            },

            OVERRIDE, Boolean, function isStarted() {
                return this.inited_ && !this.stopped_;
            },

            ABSTRACT, VOID, function onCreate_() {},
            VOID, function onStart_() {},
            VOID, function onRestart_() {},
            VOID, function onResume_() {},
            VOID, function onPause_() {},
            VOID, function onStop_() {},

            OVERRIDE, VOID, function onDispose_() {
                this.stop();
                BASE();
            },

            VOID, function close() {
                var me = this;
                this.onClose_.forEach(function (_) { _(me); });
            },

            /**
             * Configure Close Event
             */
            [[Function]],
            VOID, function addCloseCallback(callback) {
                this.onClose_.unshift(callback);
            }
        ]);
});