REQUIRE('ria.mvc.IContext');
REQUIRE('ria.mvc.IContextable');
REQUIRE('ria.async.Future');

REQUIRE('ria.serialize.JsonSerializer');

REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.mvc', function () {
    "use strict";

    function toDashed(str) {
        return str.replace(/([A-Z])/g, function($1){
            return "-" + $1.toLowerCase();
        });
    }

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

    /** @class ria.mvc.ServiceEvent */
    ANNOTATION(
        [[ClassOf(Class), String]],
        function ServiceEvent(service, name_) {});


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

            /**
             * Internal use only, use onAppInit() ONLY
             */
            FINAL, ria.async.Future, function doAppInit() {
                this.loadSessionBinds_();
                return this
                    .onAppInit()
                    .then(function () {
                        this.storeSessionBinds_();
                    }, this)
                    .then(function () {
                        // let's bind session events to this instance
                        var ref = ria.reflection.ReflectionClass(this);
                        var instance = this;
                        ref.getMethodsReflector()
                            .filter(function (_) { return _.isAnnotatedWith(ria.mvc.ServiceEvent)})
                            .forEach(function (_) {
                                var a = _.findAnnotation(ria.mvc.ServiceEvent).pop();
                                var service = instance.context.getService(a.service);
                                var eventName = a.name_ || _.getShortName();

                                var serviceRef = ria.reflection.ReflectionClass(service);
                                var prop = serviceRef.getPropertyReflector(eventName);

                                prop.invokeGetterOn(service).on(function () {
                                    this.loadSessionBinds_();
                                    _.invokeOn(this, ria.__API.clone(arguments));
                                    this.storeSessionBinds_();
                                }, instance);
                            })
                    }, this);
            },

            VOID, function onInitialize() {
                this.view = this.context.getDefaultView();
                this.state = null;
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
                    this.loadSessionBinds_();

                    var result = method.invokeOn(this, this.deserializeParams_(params, method));
                    if (_DEBUG && result === undefined) {
                        console.warn('WARN: Action ' + method.getName() + ' returned VOID result');
                    }

                    this.storeSessionBinds_();
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
            function Redirect(controller, action_, args_) {
                var state = this.context.getState();
                state.setController(controller);
                state.setAction(action_ || null);
                state.setParams(args_ || []);
                this.context.stateUpdated();
                return null;
            },

            [[String, String, Array]],
            function Forward(controller, action_, args_) {
                _DEBUG && console.warn('WARN this.Forward is deprecated and will be removed soon. Use this.Redirect instead');
                return this.Redirect(controller, action_, args_);
            },

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future]],
            function PushView(clazz, data) {
                var instance = new clazz();
                this.prepareActivity_(instance);
                this.view.pushD(instance, data);
                this.pushHistoryState_();
                return null;
            },

            [[ria.mvc.IActivity]],
            function prepareActivity_(activity){},

            function pushHistoryState_(){
                var state = this.getContext().getState();
                var params = state.getParams().slice();
                params.unshift(state.getAction());
                params.unshift(state.getController());
                params = params.map(function(item){
                    return item.valueOf().toString();
                });
                var href = '#' + params.join('/');
                if(href != window.location.hash && history.pushState)
                    history.pushState(null, null, href);
            },

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future]],
            function ShadeView(clazz, data) {
                var instance = new clazz();
                this.view.shadeD(instance, data);
                return null;
            },

            [[ImplementerOf(ria.mvc.IActivity), ria.async.Future, String]],
            function UpdateView(clazz, data, msg_) {
                this.view.updateD(clazz, data, msg_);
                return null;
            },

            Boolean, function validateSessionBindType_(type) {
                if (ria.__API.isArrayOfDescriptor(type))
                    return this.validateSessionBindType_(type.valueOf());

                return [String, Number, Boolean].indexOf(type) >= 0 || ria.__API.isEnum(type) || ria.__API.isIdentifier(type);
            },

            Object, function serializeSessionBindValue_(value, type) {
                var serializeSessionBindValue_ = this.serializeSessionBindValue_;
                if (ria.__API.isArrayOfDescriptor(type)) {
                    return JSON.stringify(value.map(function (_) { return serializeSessionBindValue_(_, type.valueOf()); }));
                }

                return (value !== undefined && value !== null) ? value.valueOf() : null;
            },

            Object, function deserializeSessionBindValue_(value, type) {
                if (ria.__API.isArrayOfDescriptor(type)) {
                    return JSON.parse(value || '[]').map(function (_) { return deserializeSessionBindValue_(_, type.valueOf()); });
                }

                return (value !== undefined && value !== null) ? type(value) : null;
            },

            VOID, function loadSessionBinds_() {
                var ref = ria.reflection.ReflectionClass(this),
                    context = this.context,
                    instance = this;

                ref.getPropertiesReflector().forEach(function (_) {
                    var t = _.getType();
                    if (!_.isReadonly() && _.isAnnotatedWith(ria.mvc.SessionBind) && this.validateSessionBindType_(t)) {
                        var name = _.findAnnotation(ria.mvc.SessionBind).pop().name_ || toDashed(_.getShortName());
                        _.invokeSetterOn(instance, this.deserializeSessionBindValue_(context.getSession().get(name), t));
                    }
                }.bind(this));
            },

            VOID, function storeSessionBinds_() {
                var ref = ria.reflection.ReflectionClass(this),
                    context = this.context,
                    instance = this;

                ref.getPropertiesReflector().forEach(function (_) {
                    var t = _.getType();
                    if (!_.isReadonly() && _.isAnnotatedWith(ria.mvc.SessionBind) && this.validateSessionBindType_(t)) {
                        var name = _.findAnnotation(ria.mvc.SessionBind).pop().name_ || toDashed(_.getShortName());
                        context.getSession().set(name, this.serializeSessionBindValue_(_.invokeGetterOn(instance), t));
                    }
                }.bind(this));
            }

        ]);
});