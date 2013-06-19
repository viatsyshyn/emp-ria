REQUIRE('ria.mvc.DomControl');

NAMESPACE('app.controls', function () {

    /** @class app.controls.ActionLinkControl */
    CLASS(
        'ActionLinkControl', EXTENDS(ria.mvc.DomControl), [
            OVERRIDE, VOID, function onCreate_() {
                ASSET('~/assets/jade/controls/action-link.jade')(this);
            },

            [[Array]],
            String, function getLink(values) {
                return values
                    .map(function (_) { return _.valueOf ? _.valueOf() : _})
                    .map(function (_) { return encodeURIComponent(_)})
                    .join(',');
            },

            [ria.mvc.DomEventBind('click', 'A[data-link]')],
            [[ria.dom.Dom, ria.dom.Event]],
            Boolean, function onActionLinkClick(node, event) {
                alert(node.getData('data-link'));
                return false;
            }
        ]);
});