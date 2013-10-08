/**
 * MVC Application basis
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 31 �� 2011
 * @fileoverview MVC Application basis
 */

REQUIRE('ria.reflection.ReflectionClass');

REQUIRE('ria.mvc.MvcException');

REQUIRE('ria.mvc.IContextable');
REQUIRE('ria.mvc.ISession');
REQUIRE('ria.mvc.IStateSerializer');
REQUIRE('ria.mvc.IView');

REQUIRE('ria.mvc.BaseContext');
REQUIRE('ria.mvc.Dispatcher');
REQUIRE('ria.mvc.Session');
REQUIRE('ria.mvc.View');
REQUIRE('ria.mvc.StateSerializer');
REQUIRE('ria.mvc.Controller');

NAMESPACE('ria.mvc', function () {
    "use strict";

    var History = window.History;

    /**@namespace ria.mvc.Application */
    CLASS('Application', [

        ria.mvc.IStateSerializer, 'serializer',
        ria.mvc.IContext, 'context',

        function $() {
            BASE();
            this.serializer = this.initSerializer_();
            this._dispatcher = this.initDispatcher_();
            this.context = this.initContext_();
        },

        ria.mvc.IStateSerializer, function initSerializer_() {
            return new ria.mvc.StateSerializer('/');
        },

        ria.mvc.Dispatcher, function initDispatcher_() {
            return new ria.mvc.Dispatcher;
        },

        ria.mvc.ISession, function initSession_() {
            return new ria.mvc.Session;
        },

        ria.mvc.IView, function initView_() {
            return new ria.mvc.View;
        },

        function initContext_() {
            var context = new ria.mvc.BaseContext;
            context.setDispatcher(this._dispatcher);
            context.setSession(this.initSession_());
            context.setDefaultView(this.initView_());
            context.setServiceCreateDelegate(this._dispatcher.createService);
            return context;
        },

        [[HashChangeEvent]],
        VOID, function onHashChanged_(event) {
            this.dispatch(event.newUrl);
        },

        SELF, function session(obj) {
            var session = this.context.getSession();
            for(var key in obj) if (obj.hasOwnProperty(key)) {
                session.set(key, obj[key], false);
            }
            return this;
        },

        VOID, function run() {
            var me = this;
            ria.async.DeferredAction()
                .then(function () {
                    return me.onInitialize_();
                })
                .then(function () {
                    return me._dispatcher.loadControls();
                })
                .then(function () {
                    return me._dispatcher.loadControllers();
                })
                .then(function () {
                    me._dispatcher.initControls(me.context);
                    return null;
                })
                .then(function () {
                    return me.onStart_();
                })
                .then(function () {
                    return me._dispatcher.initControllers(me.context);
                })
                .then(function() {
                    me.onResume_();
                    return null;
                })
                .then(function() {
                    me.dispatch();
                    return null;
                })
                .catchError(function (e) {
                    throw new ria.mvc.MvcException('Failed to start application', e);
                });
        },

        [[String]],
        VOID, function dispatch(route_) {
            var state = this.serializer.deserialize(route_ || window.location.hash.substr(1));
            state.setPublic(true);
            this._dispatcher.dispatch(state, this.context);
        },

        ria.async.Future, function onInitialize_() {
            window.addEventListener("hashchange", this.onHashChanged_, false);
            //window.addEventListener("beforeunload", this.onBeforeUnload_, false);
            //window.addEventListener("pagehide", this.onStop_, false); !?!?!?
            //window.addEventListener("unload", this.onDispose_, false);

            //window.addEventListener("activate", this.onResume_, false);
            //window.addEventListener("unload", this.onDispose_, false);

            return ria.async.DeferredAction();
        },

        ria.async.Future, function onStart_() { return ria.async.DeferredAction(); },
        VOID, function onResume_() {},
        VOID, function onPause_() {},
        VOID, function onStop_() { return ria.async.DeferredAction(); },
        VOID, function onDispose_() {},

        [[ClassOf(SELF), Object]],
        VOID, function RUN(appClass, session_) {
            new appClass()
                .session(session_ || {})
                .run()
        }
    ]);
});