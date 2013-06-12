REQUIRE('ria.mvc.MvcException');

REQUIRE('ria.mvc.IContext');
REQUIRE('ria.mvc.State');
REQUIRE('ria.mvc.IStateSerializer');
REQUIRE('ria.mvc.IDispatchPlugin');

REQUIRE('ria.async.Future');
REQUIRE('ria.async.wait');
REQUIRE('ria.reflection.ReflectionFactory');

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
                            onAppStartFutures.push(controllerRef.instantiate([]).onAppStart());
                            this.controllers[name] = controllerRef;
                        } catch (e) {
                            throw new ria.mvc.MvcException('Error intializing controller ' + controllerRef.getName(), e);
                        }
                    }

                    this.loadControllers_(controllerRef);
                }.bind(this));

                return ria.async.wait(onAppStartFutures);
            },

            ria.async.Future, function loadControllers() {
                return this.loadControllers_(ria.reflection.ReflectionFactory(ria.mvc.Controller));
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

                            var instanse = this.controllers[state.getController()].instantiate();

                            instanse.setContext(context);
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