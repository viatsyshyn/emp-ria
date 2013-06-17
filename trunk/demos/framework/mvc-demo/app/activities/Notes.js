REQUIRE('ria.mvc.DomActivity');

REQUIRE('ria.dom.Dom');

REQUIRE('app.templates.Notes');

NAMESPACE('app.activities', function () {

    /** @class app.activities.Notes */
    CLASS(
        [ria.mvc.DomAppendTo('#body')],
        'Notes', EXTENDS(ria.mvc.DomActivity), [
            OVERRIDE, Object, function onDomCreate_() {
                var dom = new ria.dom.Dom();
                return dom.fromHTML('<div>Loading...</div>');
            },

            [ria.mvc.DomEventBind('click', 'p')],
            Boolean, function handleClick(node, event) {
                alert('clicked');
                node.show();
            },

            OVERRIDE, VOID, function onRender_(data) {
                var tpl = new app.templates.Notes;
                tpl.assign(data);
                tpl.renderTo(this.dom.empty());
            }
        ]);
});