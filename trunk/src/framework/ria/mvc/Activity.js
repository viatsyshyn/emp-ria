REQUIRE('ria.mvc.IActivity');

NAMESPACE('ria.mvc', function () {
    "use strict";

    function defer(fn, args_, scope_) {
        setTimeout(function () {
            fn.apply(scope_ || this, args_ || []);
        }, 1);
    }

    /**
     * Abstract Activity class
     * @class ria.mvc.Activity
     */
    CLASS(ABSTRACT,
        'Activity', IMPLEMENTS(ria.mvc.IActivity), [
            function $() {
                BASE();
                this._inited = false;
                this._started = false;
                this._paused = false;
                this._stopped = false;
                this._onClose = [];
                this._onRefresh = [];
            },

            /**
             * Make this activity visible and active
             * @see ria.mvc.Activity.show
             */
            VOID, function show() {
                if (!this._inited) {
                    this.onCreate_();
                    this._inited = true;
                }

                if (!this._paused) {
                    this._stopped && this.onRestart_();
                    this.onStart_();
                }

                this.onResume_();

                this._stopped = false;
                this._paused = false;
            },

            /**
             * Make this activity non-active
             */
            VOID, function pause() {
                if (!this._paused) {
                    this.onPause_();
                    this._paused = true;
                }
            },

            /**
             * Make this activity non-visible and non-active
             */
            VOID, function stop() {
                if (!this._stopped) {
                    !this._paused && this.onPause_();
                    this.onStop_();
                }

                this._stopped = true;
                this._paused = false;
            },

            Boolean, function isForeground() {
                return this._inited && !this._paused && !this._stopped;
            },

            Boolean, function isStarted() {
                return this._inited && !this._stopped;
            },

            [[Object]],
            VOID, function refresh(model) {
                this.onModelReady_(model);
                this.onRender_(model);
                defer(this.onRefresh_, [model], this);
            },

            ABSTRACT, VOID, function onCreate_() {},
            VOID, function onStart_() {},
            VOID, function onRestart_() {},
            VOID, function onResume_() {},
            VOID, function onPause_() {},
            VOID, function onStop_() {},
            [[Object]],
            VOID, function onModelReady_(data) {},
            [[Object]],
            VOID, function onRender_(data) {},
            [[Object]],
            VOID, function onRefresh_(data) {
                var me = this;
                this._onRefresh.forEach(function (_) { _(me, data); });
            },

            VOID, function onDispose_() {
                this.stop();
            },

            VOID, function close() {
                var me = this;
                this._onClose.forEach(function (_) { _(me); });
            },

            /**
             * Configure Close Event
             */
            [[ria.mvc.ActivityClosedEvent]],
            VOID, function addCloseCallback(callback) {
                this._onClose.unshift(callback);
            },

            /**
             * Configure Refresh Event
             */
            [[ria.mvc.ActivityRefreshedEvent]],
            VOID, function addRefreshCallback(callback) {
                this._onRefresh.unshift(callback);
            }
        ]);
});