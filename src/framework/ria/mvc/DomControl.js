REQUIRE('ria.mvc.Control');
REQUIRE('ria.dom.Dom');
REQUIRE('ria.mvc.DomEventBind');

REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.mvc', function () {
    "use strict";

    /** @class ria.mvc.DomControl */
    CLASS(
        'DomControl', EXTENDS(ria.mvc.Control), [
            function $() {
                BASE();
                this._dom = null;
                this._domEvents = [];

                this.bind_();
            },

            OVERRIDE, VOID, function onCreate_() {
                BASE();

                var dom = this._dom = new ria.dom.Dom();

                var instance = this;
                this._domEvents.forEach(function (_) {
                    dom.on(_.event, _.selector, function (node, event) {
                        return _.methodRef.invokeOn(instance, ria.__API.clone(arguments));
                    });
                })
            },

            VOID, function bind_() {
                var ref = new ria.reflection.ReflectionClass(this.getClass());

                this._domEvents = ref.getMethodsReflector()
                    .filter(function (_) { return _.isAnnotatedWith(ria.mvc.DomEventBind)})
                    .map(function(_) {
                        if (_.getArguments().length != 2)
                            throw new ria.mvc.MvcException('Methods, annotated with ria.mvc.DomBindEvent, are expected to accept two arguments (node, event)');

                        var annotation = _.findAnnotation(ria.mvc.DomEventBind).pop();
                        return {
                            event: annotation.event,
                            selector: annotation.selector_,
                            methodRef: _
                        }
                    });
            }
        ]);
});