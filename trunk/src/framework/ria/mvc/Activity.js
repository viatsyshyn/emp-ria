REQUIRE('ria.mvc.IActivity');

REQUIRE('ria.async.Future');
REQUIRE('ria.async.Observable');

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
                this._onClose = new ria.async.Observable();
                this._onRefresh = new ria.async.Observable();
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

            ria.async.Future, function getModelEvents_(msg_) {
                var me = this;
                return new ria.async.Future()
                    .progress(function(progress) { me.onModelProgress(progress, msg_); })
                    .complete(function () { me.onModelComplete_(msg_); })
                    .catchError(function (error) {
                        me.onModelError(progress, msg_);
                        this.RETHROW(error);
                    })
                    .next(function (data) { me.onModelReady_(model, msg_); })
            }

            [[ria.async.Future]],
            ria.async.Future, function refreshD(future) {
                var me = this;
                return future
                    .attach(this.getModelEvents_())
                    .next(function (data) { me.onRender_(model); return data; })
                    .next(function (data) { me.onRefresh_(model); return data; })
            },

            [[ria.async.Future, String]],
            ria.async.Future, function partialRefreshD(future, msg_) {
                var msg = msg_ || "";
                var me = this;
                return future
                    .attach(this.getModelEvents_(msg))
                    .next(function (data) { me.onPartialRender_(model, msg); return data; })
                    .next(function (data) { me.onPartialRefresh_(model, msg); return data; })
            },

            /** @deprecated */
            [[Object]],
            VOID, function refresh(model) {
                this.onModelReady_(model);
                this.onRender_(model);
                ria.async.DeferredData(model)
                    .next(this.onRefresh_)
            },

            ABSTRACT, VOID, function onCreate_() {},
            VOID, function onStart_() {},
            VOID, function onRestart_() {},
            VOID, function onResume_() {},
            VOID, function onPause_() {},
            VOID, function onStop_() {},
            [[String]],
            VOID, function onModelWait_(msg_) {},
            [[Object, String]],
            VOID, function onModelProgress_(data, msg_) {},
            [[Object, String]],
            VOID, function onModelError_(data, msg_) {},
            [[Object, String]],
            VOID, function onModelReady_(data, msg_) {},
            [[String]],
            VOID, function onModelComplete_(msg_) {},
            [[Object]],
            VOID, function onRender_(data) {},
            [[Object, String]],
            VOID, function onPartialRender_(data, msg_) {},
            [[Object]],
            VOID, function onRefresh_(data) {
                this._onRefresh.nofity([this, data]);
            },
            [[Object]],
            VOID, function onPartialRefresh_(data) {
                var me = this;
                this._onRefresh.forEach(function (_) { _(me, data); });
            },

            VOID, function onDispose_() {
                this.stop();
            },

            VOID, function close() {
                this._onClose.nofity([this]);
            },

            /**
             * Configure Close Event
             */
            [[ria.mvc.ActivityClosedEvent]],
            VOID, function addCloseCallback(callback) {
                this._onClose.on(callback);
            },

            /**
             * Configure Refresh Event
             */
            [[ria.mvc.ActivityRefreshedEvent]],
            VOID, function addRefreshCallback(callback) {
                this._onRefresh.on(callback);
            }
        ]);
});