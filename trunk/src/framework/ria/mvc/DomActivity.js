REQUIRE('ria.mvc.MvcException');
REQUIRE('ria.mvc.Activity');

REQUIRE('ria.reflection.ReflectionFactory');

NAMESPACE('ria.mvc', function () {

    function appendTo(content, to) {
        // TODO: remove jQuery
        jQuery(content).appendTo(to);
    }

    function bindEvent(event, selector, dom, f) {
        jQuery(dom).on(event, selector, function (event) {
            return f(jQuery(this), event);
        })
    }

    /** @class ria.mvc.DomAppendTo */
    ANNOTATION(
        function DomAppendTo(node) {});

    /** @class ria.mvc.DomEventBind */
    ANNOTATION(
        function DomEventBind(event, selector_) {});

    /** @class ria.mvc.DomActivity */
    CLASS(
        'DomActivity', EXTENDS(ria.mvc.Activity), [
            Object, 'dom',

            function $() {
                BASE();

                this._domAppendTo = null;
                this._domEvents = [];
                this.processAnnotations_();
            },

            VOID, function processAnnotations_() {
                var ref = ria.reflection.ReflectionFactory(this.getClass());
                if (!ref.isAnnotatedWith(ria.mvc.DomAppendTo))
                    throw new ria.mvc.MvcException('ria.mvc.DomActivity expects annotation ria.mvc.DomAppendTo');

                this._domAppendTo = ref.findAnnotation(ria.mvc.DomAppendTo).pop().node;

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
                    })
            },

            ABSTRACT, Object, function onDomCreate_() {},

            OVERRIDE, VOID, function onCreate_() {
                BASE();

                var dom = this.dom = this.onDomCreate_();

                appendTo(dom, this._domAppendTo);

                var instance = this;
                this._domEvents.forEach(function (_) {
                    bindEvent(_.event, _.selector, dom, function () {
                        return _.methodRef.invokeOn(instance, ria.__API.clone(arguments));
                    });
                })
            }
        ]);
});