/**
 * MVC Application basis
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 31 �� 2011
 * @fileoverview MVC Application basis
 */

REQUIRE('hwa.reflection.ReflectionFactory');

REQUIRE('hwa.event.IEvent');

REQUIRE('hwa.mvc.IActivity');
REQUIRE('hwa.mvc.IService');
REQUIRE('hwa.mvc.IContextable');
REQUIRE('hwa.mvc.IView');
REQUIRE('hwa.mvc.IAppSession');
REQUIRE('hwa.mvc.State');
REQUIRE('hwa.mvc.IStateSerializer');
REQUIRE('hwa.mvc.Dispatcher');

REQUIRE('hwa.mvc.MvcException');
REQUIRE('hwa.mvc.Controller');
REQUIRE('hwa.mvc.View');

/** @class hwa.global.localStorage */

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    var History = window.History;

    /**@namespace hwa.mvc.Application */
    CLASS('Application', [
        PUBLIC, function __constructor() {
            this.current_role = null;
            this.asyncEvents = [];
            this.defaultView = null;
            this.services = {};
            this.dispatcher = new hwa.mvc.Dispatcher();
            this.defaultView = new hwa.mvc.View();

            this.serializer = new hwa.mvc.IStateSerializer([
                PUBLIC, function __constructor() {
                    this.separator = '/';
                },

                [Override],
                [hwa.mvc.State],
                PUBLIC, String, function serialize(state) {
                    var s = state.getController() + this.separator + state.getAction();
                    var params = state.getParams();
                    if (params.length > 0 && params[0])
                        s += this.separator + params.join(this.separator);
                    return s;
                },

                [Override],
                [String],
                PUBLIC, hwa.mvc.State, function deserialize(value) {
                    var args = value.split(this.separator);
                    var state = new hwa.mvc.State();
                    state.setController(args.shift() || null);
                    state.setAction(args.shift() || null);
                    state.setParams(args || []);
                    return state;
                }
            ]);

            this.session = new hwa.mvc.IAppSession([
                PUBLIC, function __constructor() {
                    this.items = {};
                },

                [Override],
                [Object, Object],
                PUBLIC, Object, function get(key, def) {
                    if (this.items.hasOwnProperty(key))
                        return this.items[key];

                    if (!hwa.global.localStorage)
                        return def;

                    return hwa.global.localStorage.getItem(key) || def;
                },

                [Override],
                [Object, Object, Boolean],
                PUBLIC, VOID, function set(key, value, isPersistent) {
                    if (hwa.global.localStorage && isPersistent) {
                        hwa.global.localStorage.removeItem(key);
                        hwa.global.localStorage.setItem(key, value);
                        return ;
                    }

                    this.items[key] = value;
                },

                [Override],
                [Object],
                PUBLIC, VOID, function remove(key) {
                    if (this.items[key]) {
                        delete this.items[key];
                        return;
                    }

                    if (hwa.global.localStorage)
                        hwa.global.localStorage.removeItem(key);
                }
            ]);

            var that = this;
            this.context = new hwa.mvc.IContext([
                [Override],
                PUBLIC, hwa.mvc.IView, function getDefaultView() {
                    return that.defaultView;
                },

                [Override],
                PUBLIC, hwa.mvc.IAppSession, function getAppSession() {
                    return that.session;
                },

                [Override],
                PUBLIC, hwa.mvc.IService, function getService(clazz) {
                    if (!hwa.__API.ClassDescriptor.isClassConstructor(clazz))
                        throw new hwa.mvc.MvcException('Illegal class passed');

                    var id = clazz.__IDENTIFIER__;
                    if (!that.services.hasOwnProperty(id)) {
                        var servicesRef = hwa.reflection.ReflectionFactory(clazz);
                        if (!servicesRef.implementsInterface(hwa.mvc.IService))
                            throw new hwa.mvc.MvcException('Service need to implement ' + hwa.mvc.IService.__IDENTIFIER__);

                        var instance = servicesRef.newInstance();
                        if (servicesRef.implementsInterface(hwa.mvc.IContextable))
                            instance.setContext(that.getContext());

                        that.services[id] = instance;
                    }

                    return that.services[id];
                },

                [Override],
                [hwa.event.IEvent],
                PUBLIC, VOID, function addAsyncInitEvent(event) {
                    that.asyncEvents.push(event);
                    event.on(function () {
                        that.asyncEvents.splice(that.asyncEvents.indexOf(event), 1);
                        that.start();
                    });
                },

                [Override],
                [Function],
                PUBLIC, VOID, function addExtensionMethod(handler) {
                    if (!handler.getName())
                        throw new hwa.mvc.MvcException('Extension method should be named function');

                    var ctor = hwa.__API.getConstructorOf(this);
                    ctor.prototype[handler.getName()] = handler;
                },

                [Override],
                PUBLIC, String, function getCurrentRole() {
                    return that.dispatcher.getCurrentRole();
                },

                [Override],
                [Object],
                PUBLIC, VOID, function setCurrentRole(role) {
                    that.dispatcher.setCurrentRole(role);
                },

                PUBLIC, VOID, function stateUpdated() {
                    if (!that.dispatcher.isDispatching())
                        that.dispatcher.dispatch(that.dispatcher.getState());
                },

                PUBLIC, hwa.mvc.State, function getState() {
                    return that.dispatcher.getState();
                }
            ]);
            this.appns = null;
            this.services = [];
        },

        /**
         * @public
         */
        PUBLIC, VOID, function run() {
            this.onInitialize();
            this.bindHistoryJs();
            this.dispatcher.loadControllers(this.context);
            this.start();
        },

        PROTECTED, hwa.mvc.IContext, function getContext() {
            return this.context;
        },

        [hwa.mvc.IView],
        PROTECTED, VOID, function setDefaultView(view) {
            this.defaultView = view;
        },

        PRIVATE, VOID, function dispatch() {
            var state = this.serializer.deserialize(History.getHash());
            state.setPublic(true);
            this.dispatcher.dispatch(state);
        },

        PRIVATE, VOID, function bindHistoryJs() {
            if ( !History || !History.enabled )
                throw new hwa.mvc.MvcException('History.js is disabled for this browser. This is because we can optionally choose to support HTML4 browsers or not.');

            // Bind to StateChange Event
            History.Adapter.bind(window, 'statechange', function () {
                this.dispatch();
            }.bind(this));
        },

        PRIVATE, VOID, function start() {
            if (this.asyncEvents.length < 1) {
                this.onStart();
                this.dispatch();
            }
        },

        [hwa.mvc.IStateSerializer],
        PUBLIC, VOID, function setStateSerializer(serializer) {
            this.serializer = serializer;
        },

        PUBLIC, hwa.mvc.Dispatcher, function getDispatcher() {
            return this.dispatcher;
        },

        [Function],
        PUBLIC, VOID, function setErrorHandler(handler) {
            // TODO: implement this
        },

        PROTECTED, ABSTRACT, VOID, function onInitialize() {},
        PROTECTED, VOID, function onStart() {},
        PROTECTED, VOID, function onStop() {}
    ]);

    hwa.ready(function () {
        var ref = hwa.reflection.ReflectionFactory(hwa.mvc.Application);
        var c = ref.getChildren();
        if (c.length == 0)
            throw Error('No class derrives from hwa.mvc.Application');

        if (c.length > 1)
            throw Error('Multiple classes derrive from hwa.mvc.Application');

        var ctor = c[0].getConstructor();
        new ctor().run();
        console.info('inited');
    })
});