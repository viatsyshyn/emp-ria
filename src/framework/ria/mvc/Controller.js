REQUIRE('ria.mvc.IContext');
REQUIRE('ria.async.Future');

REQUIRE('ria.reflection.ReflectionFactory');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /** @class ria.mvc.ControllerUri */
    ANNOTATION(
        function ControllerUri(value) {});

    /** @class ria.mvc.AccessFor */
    ANNOTATION(
        function AccessFor(roles) {});

    function toCamelCase(str) {
        return str.replace(/(\-[a-z])/g, function($1){
            return $1.substring(1).toUpperCase();
        });
    }

    /**
     * @class ria.mvc.Controller
     */
    CLASS(ABSTRACT,
        'Controller', IMPLEMENTS(ria.mvc.IContextable), [

            ria.mvc.IContext, 'context',
            ria.mvc.State, 'state',
            ria.mvc.IView, 'view',

            function $() {
                this.context = null;
                this.state = null;
                this.view = null;
            },

            /**
             * Method is called once Application is starting
             * A magic method 'cause you can load required resources but can not use this to store them
             * Use either global var or session
             */
            ria.async.Future, function onAppStart() {
                return ria.async.DeferredAction();
            },

            VOID, function onInitialize() {
                this.view = this.context.getDefaultView();
                this.state = null;
            },

            /**
             * Redirect to other controller/action
             * @param {String} controller
             * @param {String} action
             * @param {Array} args
             */
            [[String, String, Array]],
            VOID, function redirect_(controller, action, args) {
                this.state.setController(controller);
                this.state.setParams(args);
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
            [[String, String, Array]],
            VOID, function forward_(controller, action, args) {
                this.state.setController(controller);
                this.state.setParams(args);
                this.state.setAction(action);
                this.state.setDispatched(false);
                this.state.setPublic(false);
                this.context.stateUpdated();
            },

            VOID, function preDispatchAction_() {},

            VOID, function postDispatchAction_() {},

            [[ria.mvc.State]],
            VOID, function callAction_(state) {
                var ref = ria.reflection.ReflectionFactory(this.getClass()),
                    action = toCamelCase(state.getAction()) + 'Action',
                    all = ref.getMethodsReflector(),
                    params = state.getParams(),
                    c = params.length;

                var method = ref.getMethodReflector(action);
                if (!method)
                    throw new ria.mvc.MvcException('Controller ' + ref.getName() + ' has no method ' + action
                        + ' for action ' + state.getAction());

                var min = method.getRequiredArguments().length;
                if (min > c)
                    throw new ria.mvc.MvcException('Method ' + method.getName() + ' requires at least ' + min + ' arguments.');

                var max = method.getArguments().length;
                if (max < c)
                    throw new ria.mvc.MvcException('Method ' + method.getName() + ' requires at most ' + max + ' arguments.');

                // TODO: check roles

                try {
                    method.invokeOn(this, params);
                } catch (e) {
                    throw new ria.mvc.MvcException("Exception in action " + methods.getName(), e);
                }
            },

            [[ria.mvc.State]],
            VOID, function dispatch(state) {
                this.state = state;

                this.preDispatchAction_();
                if (!state.isDispatched())
                    return ;

                if (state.isPublic()) {
                    this.view.reset();
                }

                this.callAction_(state);

                if (!state.isDispatched())
                    return ;

                this.postDispatchAction_();
            }
        ]);
});