/**
 * MVC Application basis
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 31 �� 2011
 * @fileoverview MVC Application basis
 */

REQUIRE('ria.reflection.ReflectionFactory');

REQUIRE('ria.mvc.MvcException');

REQUIRE('ria.mvc.IContextable');
REQUIRE('ria.mvc.ISession');
REQUIRE('ria.mvc.IStateSerializer');
REQUIRE('ria.mvc.IView');

REQUIRE('ria.mvc.Dispatcher');
REQUIRE('ria.mvc.Controller');
REQUIRE('ria.mvc.Session');
REQUIRE('ria.mvc.View');
REQUIRE('ria.mvc.StateSerializer');

NAMESPACE('ria.mvc', function () {
    "use strict";

    var History = window.History;

    /**@namespace ria.mvc.Application */
    CLASS('Application', [

        ria.mvc.IStateSerializer, 'serializer',
        ria.mvc.ISession, 'session',
        ria.mvc.IContext, 'context',

        function $() {
            this.serializer = this.initSerializer_();
            this.dispatcher = this.initDispatcher_();
            this.session = this.initSession_();
            this.defaultView = this.initView_();
            this.context = this.initContext_();
            this.appns = null;
            this.services = [];
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
            var me = this;
            return null; /*new ria.mvc.IContext([
                ria.mvc.IView, function getDefaultView() {
                    return me.defaultView;
                },

                ria.mvc.IAppSession, function getSession() {
                    return me.session;
                },

                VOID, function stateUpdated() {
                    if (!me.dispatcher.isDispatching())
                        me.dispatcher.dispatch(me.dispatcher.getState());
                },

                ria.mvc.State, function getState() {
                    return me.dispatcher.getState();
                }
            ]);*/
        },

        VOID, function run() {
            var me = this;
            ria.async.DeferredAction()
                .then(function () {
                    return me.onInitialize_();
                })
                .then(function () {
                    return me.dispatcher.loadControllers();
                })
                .then(function () {
                    return me.onStart_();
                })
                .then(function() {
                    me.dispatch();
                    return null;
                })
                .catchError(function (e) {
                    throw new ria.mvc.MvcException('Failed to start application', e);
                });
        },

        VOID, function dispatch() {
            var state = this.serializer.deserialize('');
            state.setPublic(true);
            this.dispatcher.dispatch(state, this.context);
        },

        ria.async.Future, function onInitialize_() {
            return ria.async.DeferredAction();
        },
        ria.async.Future, function onStart_() {
            return ria.async.DeferredAction();
        },
        ria.async.Future, function onStop_() {
            return ria.async.DeferredAction();
        }
    ]);
});