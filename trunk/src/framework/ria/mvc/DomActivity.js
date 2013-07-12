REQUIRE('ria.mvc.MvcException');
REQUIRE('ria.mvc.Activity');
REQUIRE('ria.dom.Dom');
REQUIRE('ria.mvc.DomEventBind');

REQUIRE('ria.reflection.ReflectionClass');

NAMESPACE('ria.mvc', function () {

    var MODEL_WAIT_CLASS = 'activity-model-wait';

    function camel2dashed(_) {
        return _.replace(/[a-z][A-Z]/g, function(str, offset) {
           return str[0] + '-' + str[1].toLowerCase();
        });
    }

    /** @class ria.mvc.DomAppendTo */
    ANNOTATION(
        [[String]],
        function DomAppendTo(node) {});

    /** @class ria.mvc.DomActivity */
    CLASS(
        'DomActivity', EXTENDS(ria.mvc.Activity), [
            ria.dom.Dom, 'dom',

            function $() {
                BASE();

                this._actitivyClass = null;
                this._domAppendTo = null;
                this._domEvents = [];
                this.processAnnotations_(new ria.reflection.ReflectionClass(this.getClass()));
            },

            [[ria.reflection.ReflectionClass]],
            VOID, function processAnnotations_(ref) {
                this._actitivyClass = camel2dashed(ref.getShortName());

                if (!ref.isAnnotatedWith(ria.mvc.DomAppendTo))
                    throw new ria.mvc.MvcException('ria.mvc.DomActivity expects annotation ria.mvc.DomAppendTo');

                this._domAppendTo = new ria.dom.Dom(ref.findAnnotation(ria.mvc.DomAppendTo).pop().node);

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

            ABSTRACT, ria.dom.Dom, function onDomCreate_() {},

            OVERRIDE, VOID, function onCreate_() {
                BASE();

                var dom = this.dom = this.onDomCreate_().appendTo(this._domAppendTo).addClass(this._actitivyClass);

                var instance = this;
                this._domEvents.forEach(function (_) {
                    dom.on(_.event, _.selector, function (node, event) {
                        return _.methodRef.invokeOn(instance, ria.__API.clone(arguments));
                    });
                })
            },

            [[String]],
            OVERRIDE, VOID, function onModelWait_(msg_) { this.dom.addClass(MODEL_WAIT_CLASS); },
            [[String]],
            OVERRIDE, VOID, function onModelComplete_(msg_) { this.dom.removeClass(MODEL_WAIT_CLASS); },
        ]);
});