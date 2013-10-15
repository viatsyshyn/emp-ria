REQUIRE('ria.mvc.IContext');
REQUIRE('ria.mvc.IContextable');
REQUIRE('ria.async.Future');

REQUIRE('ria.serialize.JsonSerializer');

REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /** @class ria.mvc.ControllerUri */
    ANNOTATION(
        [[String]],
        function ControllerUri(value) {});

    /** @class ria.mvc.AccessFor */
    ANNOTATION(
        function AccessFor(roles) {});

    /** @class ria.mvc.Inject */
    ANNOTATION(
        function Inject() {});

    /** @class ria.mvc.SessionBind */
    ANNOTATION(
        [[String]],
        function SessionBind(name_) {});


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
                BASE();
                this.context = null;
                this.state = null;
                this.view = null;
                this._serializer = this.initSerializer_();
            },

            ria.serialize.ISerializer, function initSerializer_() {
                return new ria.serialize.JsonSerializer;
            },

            /**
             * Method is called once Application is starting
             * A magic method 'cause you can load required resources but can not use this to store them
             * Use either global var or session
             */
            ria.async.Future, function onAppStart() {
                return ria.async.DeferredAction();
            },

            /**
             * Method is called once Application pre dispatch
             * A magic method 'cause you can load required resources but can not use this to store them
             * Use either global var or session
             */
            ria.async.Future, function onAppInit() {
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



            ria.reflection.ReflectionMethod, function resolveRoleAction_(state){
                var ref = new ria.reflection.ReflectionClass(this.getClass());
                var action = toCamelCase(state.getAction()) + 'Action';

                var method = ref.getMethodReflector(action);

                if (!method)
                        throw new ria.mvc.MvcException('Controller ' + ref.getName() + ' has no method ' + action
                            + ' for action ' + state.getAction());

                return method;
            },

            [[ria.mvc.State]],
            VOID, function callAction_(state) {
                var params = state.getParams();
                var method = this.resolveRoleAction_(state);
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
                    throw new ria.mvc.MvcException('Method ' + actionRef.getName() + ' requires at least ' + min + ' arguments.');

                var max = actionRef.getArguments().length;
                if (max < c)
                    throw new ria.mvc.MvcException('Method ' + actionRef.getName() + ' requires at most ' + max + ' arguments.');
            },

            [[Array, ria.reflection.ReflectionMethod]],
            Array, function deserializeParams_(params, actionRef) {
                var types = actionRef.getArgumentsTypes(),
                    names = actionRef.getArguments();

                try {
                    return params.map(function (_, index) {
                        try {
                            return (_ === null || _ === undefined || (!Array.isArray(_) && _ instanceof types[index])) ? _ : this._serializer.deserialize(_, types[index]);
                        } catch (e) {
                            throw new ria.mvc.MvcException('Error deserializing action param ' + names[index], e);
                        }
                    }, this);
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

                /*if (state.isPublic()) {
                    this.view.reset();
                }*/

                this.callAction_(state);

                if (!state.isDispatched())
                    return ;

                this.postDispatchAction_();
            },

            [[String, String, Array]],
            function Redirect(controller, action_, arg_) {
                return this.redirect_(controller, action_ || null, arg_ || null);
            },

            [[String, String, Array]],
            function Forward(controller, action_, arg_) {
                return this.forward_(controller, action_ || null, arg_ || null);
            },

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future]],
            function PushView(clazz, data) {
                var instance = new clazz();
                this.prepareActivity(instance);
                this.view.pushD(instance, data);
                this.pushHistoryState();
            },

            [[ria.mvc.IActivity]],
            function prepareActivity(activity){},

            function pushHistoryState(){
                var state = this.getContext().getState();
                var params = state.getParams().slice();
                params.unshift(state.getAction());
                params.unshift(state.getController());
                params = params.map(function(item){
                    return item.valueOf().toString();
                });
                var href = '#' + params.join('/');
                if(href != window.location.hash)
                    history.pushState(null, null, href);
            },

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future]],
            function ShadeView(clazz, data) {
                var instance = new clazz();
                this.view.shadeD(instance, data);
            },

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future, String]],
            function UpdateView(clazz, data, msg_) {
                this.view.updateD(clazz, data, msg_ || '');
            }
        ]);
});