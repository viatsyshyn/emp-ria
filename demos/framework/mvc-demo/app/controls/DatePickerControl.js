REQUIRE('ria.mvc.DomControl');

NAMESPACE('app.controls', function () {

    /** @class app.controls.DatePickerControl */
    CLASS(
        'DatePickerControl', EXTENDS(ria.mvc.DomControl), [
            OVERRIDE, VOID, function onCreate_() {
                BASE();
                ASSET('~/assets/jade/controls/date-picker.jade')(this);
            },

            [[String, Object, Object]],
            Object, function processAttrs(name, value, attrs) {
                attrs.id = attrs.id || ria.dom.NewGID();
                attrs.name = name;
                if (typeof value !== 'undefined')
                    attrs.value = value;

                var options = attrs['data-options'];
                this.queueReanimation_(attrs.id, options);

                return attrs;
            },

            VOID, function queueReanimation_(id, options) {
                this.context.getDefaultView()
                    .onActivityRefreshed(function (activity, model) {
                        this.reanimate_(ria.dom.Dom('#' + id), options, activity, model)
                    }.bind(this));
            },

            [[ria.dom.Dom, Object, ria.mvc.IActivity, Object]],
            VOID, function reanimate_(node, options, activity, model) {
                jQuery(node.valueOf().shift())
                    .datepicker(options);
            }
        ]);
});