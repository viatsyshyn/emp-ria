REQUIRE('hwa.mvc.MvcException');

REQUIRE('hwa.mvc.IContext');
REQUIRE('hwa.mvc.State');
REQUIRE('hwa.mvc.IStateSerializer');
REQUIRE('hwa.mvc.IDispatchPlugin');

REQUIRE('hwa.reflection.ReflectionClass');
REQUIRE('hwa.reflection.ReflectionFactory');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
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

    /** @class hwa.mvc.Dispatcher */
    CLASS('Dispatcher', [
        PUBLIC, function __constructor() {
            this.defaultControllerId = 'index';
            this.defaultControllerAction = 'index';
            this.controllers = {};
            this.state = null;
            this.plugins = [];
            this.role = null;
            this.isDispatching_ = false;
        },

        PUBLIC, String, function getDefaultControllerId() {
            return this.defaultControllerId;
        },

        [String],
        PUBLIC, VOID, function setDefaultControllerId(value) {
            this.defaultControllerId = value;
        },

        PUBLIC, String, function getDefaultControllerAction() {
            return this.defaultControllerAction;
        },

        [String],
        PUBLIC, VOID, function setDefaultControllerAction(value) {
            this.defaultControllerAction = value;
        },

        PUBLIC, hwa.mvc.State, function getState() {
            return this.state;
        },

        [hwa.mvc.State],
        PRIVATE, VOID, function setState(value) {
            this.state = value;
        },

        [hwa.mvc.IDispatchPlugin],
        PUBLIC, VOID, function addPlugin(plugin) {
            this.plugins.push(plugin);
        },

        [hwa.mvc.IDispatchPlugin],
        PUBLIC, VOID, function removePlugin(plugin) {
            var index = this.plugins.indexOf(plugin);
            index >= 0 ? this.plugins.splice(index, 1) : null;
        },

        [hwa.reflection.ReflectionClass, hwa.mvc.IContext],
        PRIVATE, VOID, function loadControllers(baseRef, context) {
            var all = baseRef.getChildren();
            for(var index = all.length; index > 0; index--) {
                var controllerRef = all[index - 1];

                if (controllerRef.isAbstract()) {
                    this.loadControllers(controllerRef, context);
                    continue;
                }

                var name = controllerNameToUri(controllerRef.getShortName());
                if (controllerRef.hasAnnotation(hwa.mvc.ControllerUri))
                    name = controllerRef.getAnnotation(hwa.mvc.ControllerUri).value;

                try {
                    this.controllers[name] = controllerRef.newInstanceArgs([context]);
                } catch (e) {
                    throw new hwa.mvc.MvcException('Error instantiating controller ' + controllerRef.getName(), e);
                }
            }
        },

        [hwa.mvc.IContext],
        PUBLIC, VOID, function loadControllers(context) {
            this.loadControllers(hwa.reflection.ReflectionFactory(hwa.mvc.Controller), context)
        },

        /**
         * @class hwa.mvc.Dispatcher.dispatch
         * @param {String} query
         */
        [hwa.mvc.State],
        PUBLIC, VOID, function dispatch(state) {
            var index;
            try {
                this.isDispatching_ = true;
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
                            throw new hwa.mvc.MvcException('Controller with id "' + state.getController() + '" not loaded');
                        }

                        this.controllers[state.getController()].dispatch(state);

                        if (!state.isDispatched())
                            continue;

                        for(index = this.plugins.length; index > 0; index--)
                            this.plugins[index - 1].postDispatch(state);

                    } while (!state.isDispatched());

                } catch (e) {
                    throw new hwa.mvc.MvcException('Dispatch failed.', e);
                }

                try {
                    for(index = this.plugins.length; index > 0; index--)
                        this.plugins[index - 1].dispatchShutdown();

                } catch (e) {
                    throw new hwa.mvc.MvcException('Dispatch failed.', e);
                }
            } finally {
                this.isDispatching_ = false;
            }
        },

        PUBLIC, String, function getCurrentRole() {
            return this.role;
        },

        [String],
        PUBLIC, VOID, function setCurrentRole(role) {
            this.role = role;
        },

        PUBLIC, Boolean, function isDispatching() {
            return this.isDispatching_;
        }
    ]);
});