REQUIRE('ria.mvc.MvcException');
REQUIRE('ria.mvc.IContext');
REQUIRE('ria.mvc.State');
REQUIRE('ria.mvc.IStateSerializer');
REQUIRE('ria.mvc.IDispatchPlugin');
REQUIRE('ria.mvc.Controller');
REQUIRE('ria.mvc.Control');

REQUIRE('ria.async.Future');
REQUIRE('ria.async.wait');

REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.mvc', function () {
    "use strict";

    function capitalize(str) {
        return str.toLowerCase().replace(/\w/,function (x){
            return x.toUpperCase();
        });
    }

    function toDashed(str) {
        return str.replace(/([A-Z])/g, function($1){
            return "-" + $1.toLowerCase();
        });
    }

    function controllerNameToUri(name) {
        return toDashed(name.replace('Controller', '').toLowerCase());
    }

    function toCamelCase(str) {
        return str.replace(/(\-[a-z])/g, function($1){
            return $1.substring(1).toUpperCase();
        });
    }

    /** @class ria.mvc.Dispatcher */
    CLASS(
        'Dispatcher', [
            String, 'defaultControllerId',
            String, 'defaultControllerAction',
            ria.mvc.State, 'state',
            READONLY, Boolean, 'dispatching',

            function $() {
                this.defaultControllerId = 'index';
                this.defaultControllerAction = 'index';
                this.plugins = [];
                this.dispatching = false;
                this.controllers = {};
                this.cache = {};
                this.controls = [];
            },

            [[ria.mvc.IDispatchPlugin]],
            VOID, function addPlugin(plugin) {
                this.plugins.push(plugin);
            },

            [[ria.mvc.IDispatchPlugin]],
            VOID, function removePlugin(plugin) {
                var index = this.plugins.indexOf(plugin);
                (index >= 0) && this.plugins.splice(index, 1);
            },

            [[ria.reflection.ReflectionClass]],
            ria.async.Future, function loadControllers_(baseRef) {
                var onAppStartFutures = [];
                baseRef.getChildrenReflector().forEach(function (controllerRef) {
                    var name = controllerRef.getShortName();
                    if (name.match(/.*Controller$/)) {
                        if (controllerRef.isAnnotatedWith(ria.mvc.ControllerUri))
                            name = controllerRef.findAnnotation(ria.mvc.ControllerUri).shift().value;
                        else
                            name = controllerNameToUri(name);

                        try {
                            if (!controllerRef.isAbstract()){
                                onAppStartFutures.push(controllerRef.instantiate().onAppStart());
                                this.controllers[name] = controllerRef;
                            }
                        } catch (e) {
                            throw new ria.mvc.MvcException('Error intializing controller ' + controllerRef.getName(), e);
                        }
                    }

                    this.loadControllers_(controllerRef);
                }.bind(this));

                return ria.async.wait(onAppStartFutures);
            },

            ria.async.Future, function loadControllers() {
                return this.loadControllers_(new ria.reflection.ReflectionClass(ria.mvc.Controller));
            },

            [[ria.mvc.IContext]],
            ria.async.Future, function initControllers(context) {
                var onAppInitFutures = [];
                for(var name in this.controllers) if (this.controllers.hasOwnProperty(name)) {
                    onAppInitFutures.push(this.prepareInstance_(this.controllers[name], context).onAppInit());
                }

                return ria.async.wait(onAppInitFutures);
            },

            [[ria.reflection.ReflectionClass]],
            ria.async.Future, function loadControl_(baseRef) {
                var onAppStartFutures = [];
                baseRef.getChildrenReflector().forEach(function (controlRef) {
                    var name = controlRef.getShortName();
                    if (name.match(/.*Control$/)) {
                        try {
                            this.controls.push(controlRef);
                            onAppStartFutures.push(controlRef.instantiate().onAppStart());
                        } catch (e) {
                            throw new ria.mvc.MvcException('Error intializing control ' + controlRef.getName(), e);
                        }
                    }

                    this.loadControl_(controlRef);
                }.bind(this));

                return ria.async.wait(onAppStartFutures);
            },

            ria.async.Future, function loadControls() {
                return this.loadControl_(new ria.reflection.ReflectionClass(ria.mvc.Control));
            },

            [[ria.mvc.IContext]],
            VOID, function initControls(context) {
                var getC = this.prepareInstance_;
                this.controls.forEach(function (_) {
                    getC(_, context).init();
                })
            },

            [[ClassOf(Class), ria.mvc.IContext]],
            Class, function getCached_(type, context) {
                var ref = new ria.reflection.ReflectionClass(type);
                var name = ref.getName();

                if (this.cache.hasOwnProperty(name)) {
                    return this.cache[name];
                }

                var instanse = this.cache[name] = ref.instantiate();

                if (ref.implementsIfc(ria.mvc.IContextable)) {
                    ref.getPropertyReflector('context').invokeSetterOn(instanse, context);
                }

                return instanse;
            },

            [[ria.reflection.ReflectionClass, ria.mvc.IContext]],
            Class, function prepareInstance_(ref, context) {
                var instanse = ref.instantiate();

                ref.getPropertiesReflector().forEach(function (_) {
                    if (_.isReadonly()) return;
                    if (!_.isAnnotatedWith(ria.mvc.Inject)) return;

                    _.invokeSetterOn(instanse, this.getCached_(_.getType(), context));
                }.bind(this));

                if (ref.implementsIfc(ria.mvc.IContextable)) {
                    ref.getPropertyReflector('context').invokeSetterOn(instanse, context);
                }
                return instanse;
            },

            [[ClassOf(Class), ria.mvc.IContext]],
            Class, function createService(clazz, context) {
                return this.getCached_(clazz, context);
            },

            /**
             * @class ria.mvc.Dispatcher.dispatch
             * @param {String} query
             */
            [[ria.mvc.State, ria.mvc.IContext]],
            VOID, function dispatch(state, context) {
                var index;
                try {
                    this.dispatching = true;
                    try {
                        for(index = this.plugins.length; index > 0; index--)
                            this.plugins[index - 1].dispatchStartup();

                        state.setController(state.getController() || this.defaultControllerId);
                        state.setAction(state.getAction() || this.defaultControllerAction);

                        this.setState(state);

                        do {
                            state.setDispatched(true);

                            for(index = this.plugins.length; index > 0; index--)
                                this.plugins[index - 1].preDispatch(state);

                            if (!state.isDispatched())
                                continue;

                            if (!this.controllers.hasOwnProperty(state.getController())) {
                                //noinspection ExceptionCaughtLocallyJS
                                throw new ria.mvc.MvcException('Controller with id "' + state.getController() + '" not found');
                            }

                            var instanse = this.prepareInstance_(this.controllers[state.getController()], context);

                            instanse.onInitialize();
                            instanse.dispatch(state);

                            if (!state.isDispatched())
                                continue;

                            for(index = this.plugins.length; index > 0; index--)
                                this.plugins[index - 1].postDispatch(state);

                        } while (!state.isDispatched());

                    } catch (e) {
                        throw new ria.mvc.MvcException('Dispatch failed.', e);
                    }

                    try {
                        for(index = this.plugins.length; index > 0; index--)
                            this.plugins[index - 1].dispatchShutdown();

                    } catch (e) {
                        throw new ria.mvc.MvcException('Dispatch failed.', e);
                    }
                } finally {
                    this.dispatching = false;
                }
            }
        ]);
});