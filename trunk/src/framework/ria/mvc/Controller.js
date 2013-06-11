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

            [[ria.mvc.State]],
            VOID, function preDispatchAction_(state) {},

            [[ria.mvc.State]],
            VOID, function postDispatchAction_(state) {},

            [[ria.mvc.State]],
            VOID, function callAction_(state) {
                var action = toCamelCase(state.getAction()) + 'Action';
                var current_role = this.context.getCurrentRole();

                var ref = ria.reflection.ReflectionFactory(this.getClass());
                var all = ref.getMethods();
                var c = state.getParams().length;
                var methods = [];
                while (all.length) {
                    var method = all.pop();
                    if (!method.isPublic() || method.isAbstract() || method.isStatic() || method.hasVarArgs()
                            || method.getNumberOfParameters() != c || method.getShortName() != action)
                        continue;

                    var role = method.getAnnotation(ria.mvc.AccessFor);
                    if (role && (Array.isArray(role.roles) ? role.roles.indexOf(current_role) < 0 : role.roles != current_role))
                        continue;

                    methods.push(method);
                }

                if (methods.length != 1) {
                    throw new ria.mvc.MvcException('Found ' + methods.length + ' overloads of ' + ref.getName()+ '#'  + action
                            + ' action that accepts exactly ' + c + ' arguments. '
                            + '(filtered for role: \'' + current_role + '\')');
                }

                try {
                    this[action].apply(this.publicInstance, state.getParams());
                } catch (e) {
                    throw new ria.mvc.MvcException("Exception in action " + methods[0].getSignature() + ' of ' + ref.getName(), e);
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
                    // TODO: push2URL(state)
                    // window.History.setHash(dispatcher.serialize(state));
                }

                this.callAction_(state);

                if (!state.isDispatched())
                    return ;

                this.postDispatchAction_();
            }
        ]);
});