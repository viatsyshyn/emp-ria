REQUIRE('hwa.mvc.IContext');

REQUIRE('hwa.reflection.ReflectionFactory');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /** @class hwa.mvc.ControllerUri */
    ANNOTATION(function ControllerUri(value) {});

    /** @class hwa.mvc.AccessFor */
    ANNOTATION(function AccessFor(roles) {});

    /** @class hwa.mvc.ServiceInjection */
    ANNOTATION(function ServiceInjection() {});

    function toCamelCase(str) {
        return str.replace(/(\-[a-z])/g, function($1){
            return $1.substring(1).toUpperCase();
        });
    }

    /**
     * @class hwa.mvc.Controller
     */
    CLASS(ABSTRACT, 'Controller', [
        [hwa.mvc.IContext],
        PUBLIC, function __constructor(context) {
            BASE();
            this.context = context;
            this.state = null;
            this.publicInstance = DYNAMIC_CAST(this, this.getClass());
            this.doServiceInjection();
        },

        PRIVATE, VOID, function doServiceInjection() {
            var self = hwa.reflection.ReflectionFactory(this.getClass());
            var properties = self.getProperties();
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                if (!property.isPublic())
                    continue;

                if (property.hasAnnotation(hwa.mvc.ServiceInjection))
                    this.publicInstance[property.getSetterName()](this.context.getService(property.getType()));
            }
        },

        /**
         * Redirect to other controller/action
         * @param {String} controller
         * @param {String} action
         * @param {Array} args
         */
        [String, String, Array],
        PROTECTED, VOID, function redirect(controller, action, args) {
            this.state.setController(controller);
            this.state.setParams(args);
            this.state.setAction(action);
            this.state.setDispatched(false);
            this.state.setPublic(true);
            this.context.stateUpdated();
        },

        /**
         * Redirect to other action of this controller
         * @param {String} action
         * @param {Array} args
         */
        [String, Array],
        PROTECTED, VOID, function redirect(action, args) {
            this.state.setParams(args);
            this.state.setAction(action);
            this.state.setDispatched(false);
            this.state.setPublic(true);
            this.context.stateUpdated();
        },

        /**
         * Redirect to other action of this controller
         * @param {String} action
         */
        [String],
        PROTECTED, VOID, function redirect(action) {
            this.state.setAction(action);
            this.state.setDispatched(false);
            this.state.setPublic(true);
            this.context.stateUpdated();
        },

        /**
         * Forward to other controller/action
         * @param {String} controller
         * @param {String} action
         * @param {Array} args
         */
        [String, String, Array],
        PROTECTED, VOID, function forward(controller, action, args) {
            this.state.setController(controller);
            this.state.setParams(args);
            this.state.setAction(action);
            this.state.setDispatched(false);
            this.state.setPublic(false);
            this.context.stateUpdated();
        },

        /**
         * Forward to other action of this controller
         * @param {String} action
         * @param {Array} args
         */
        [String, Array],
        PROTECTED, VOID, function forward(action, args) {
            this.state.setParams(args);
            this.state.setAction(action);
            this.state.setDispatched(false);
            this.state.setPublic(false);
            this.context.stateUpdated();
        },

        /**
         * Forward to other action of this controller
         * @param {String} action
         */
        [String],
        PROTECTED, VOID, function forward(action) {
            this.state.setAction(action);
            this.state.setDispatched(false);
            this.state.setPublic(false);
            this.context.stateUpdated();
        },

        PROTECTED, hwa.mvc.State, function getState() {
            return this.state;
        },

        PROTECTED, hwa.mvc.IContext, function getContext() {
            return this.context;
        },

        PROTECTED, hwa.mvc.IView, function getView() {
            return this.context.getDefaultView();
        },

        PROTECTED, VOID, function preDispatch() {},

        PROTECTED, VOID, function postDispatch() {},

        [hwa.mvc.State],
        PROTECTED, VOID, function callAction(state) {
            var action = toCamelCase(state.getAction()) + 'Action';
            var current_role = this.context.getCurrentRole();

            var ref = hwa.reflection.ReflectionFactory(this.getClass());
            var all = ref.getMethods();
            var c = state.getParams().length;
            var methods = [];
            while (all.length) {
                var method = all.pop();
                if (!method.isPublic() || method.isAbstract() || method.isStatic() || method.hasVarArgs()
                        || method.getNumberOfParameters() != c || method.getShortName() != action)
                    continue;

                var role = method.getAnnotation(hwa.mvc.AccessFor);
                if (role && (Array.isArray(role.roles) ? role.roles.indexOf(current_role) < 0 : role.roles != current_role))
                    continue;

                methods.push(method);
            }

            if (methods.length != 1) {
                throw new hwa.mvc.MvcException('Found ' + methods.length + ' overloads of ' + ref.getName()+ '#'  + action
                        + ' action that accepts exactly ' + c + ' arguments. '
                        + '(filtered for role: \'' + current_role + '\')');
            }

            try {
                this.publicInstance[action].apply(this.publicInstance, state.getParams());
            } catch (e) {
                throw new hwa.mvc.MvcException("Exception in action " + methods[0].getSignature() + ' of ' + ref.getName(), e);
            }
        },

        [hwa.mvc.State],
        PUBLIC, VOID, function dispatch(state) {
            this.state = state;

            this.preDispatch();
            if (!state.isDispatched())
                return ;

            if (state.isPublic()) {
                this.context.getDefaultView().reset();
                // TODO: push2URL(state)
                // window.History.setHash(dispatcher.serialize(state));
            }

            this.callAction(state);
            
            if (!state.isDispatched())
                return ;

            this.postDispatch();
        }
    ]);
});