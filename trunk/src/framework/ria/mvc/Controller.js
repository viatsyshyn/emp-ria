REQUIRE('ria.mvc.IContext');
REQUIRE('ria.async.Future');

REQUIRE('ria.serialize.JsonSerializer');

REQUIRE('ria.reflection.ReflectionFactory');

NAMESPACE('ria.mvc', function () {
    "use strict";

    var jsonSerializer = new ria.serialize.JsonSerializer;

    /** @class ria.mvc.ControllerUri */
    ANNOTATION(
        function ControllerUri(value) {});

    /** @class ria.mvc.AccessFor */
    ANNOTATION(
        function AccessFor(roles) {});

    /** @class ria.mvc.Inject */
    ANNOTATION(
        function Inject() {});

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
                    params = state.getParams();

                var method = ref.getMethodReflector(action);
                if (!method)
                    throw new ria.mvc.MvcException('Controller ' + ref.getName() + ' has no method ' + action
                        + ' for action ' + state.getAction());

                this.validateActionCall_(method, params);

                try {
                    method.invokeOn(this, this.deserializeParams_(params, method));
                } catch (e) {
                    throw new ria.mvc.MvcException("Exception in action " + method.getName(), e);
                }
            },

            [[ria.reflection.ReflectionMethod, Array]],
            VOID, function validateActionCall_(actionRef, params) {
                var c = params.length;

                var min = actionRef.getRequiredArguments().length;
                if (min > c)
                    throw new ria.mvc.MvcException('Method ' + method.getName() + ' requires at least ' + min + ' arguments.');

                var max = actionRef.getArguments().length;
                if (max < c)
                    throw new ria.mvc.MvcException('Method ' + method.getName() + ' requires at most ' + max + ' arguments.');
            },

            [[Array, ria.reflection.ReflectionMethod]],
            Array, function deserializeParams_(params, actionRef) {
                var types = actionRef.getArgumentsTypes(),
                    names = actionRef.getArguments();

                try {
                    return params.map(function (_, index) {
                        try {
                            return jsonSerializer.deserialize(_, types[index]);
                        } catch (e) {
                            throw new ria.mvc.MvcException('Error deserializing action param ' + names[index], e);
                        }
                    });
                } catch (e) {
                    throw new ria.mvc.MvcException('Error deserializing action params', e);
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
            },

            [[String, String, Array]],
            function Redirect(controller, action, arg_) {},

            [[String, String, Array]],
            function Forward(controller, action, arg_) {},

            [[Function, ria.async.Future]],
            function PushView(clazz, data) {
                var instance = new clazz();
                this.view.pushD(instance, data);
            },

            [[Function, ria.async.Future]],
            function ShadeView(clazz, data) {
                var instance = new clazz();
                this.view.shadeD(instance, data);
            },

            [[Function, ria.async.Future, String]],
            function UpdateView(clazz, data, msg_) {
                this.view.updateD(clazz, data, msg_ || '');
            }
        ]);
});