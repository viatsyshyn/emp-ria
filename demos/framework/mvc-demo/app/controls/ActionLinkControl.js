REQUIRE('ria.mvc.DomControl');

NAMESPACE('app.controls', function () {

    /** @class app.controls.ActionLinkControl */
    CLASS(
        'ActionLinkControl', EXTENDS(ria.mvc.DomControl), [
            OVERRIDE, VOID, function onCreate_() {
                BASE();
                ASSET('~/assets/jade/controls/action-link.jade')(this);
            },

            [[Array]],
            String, function getLink(values) {
                return encodeURIComponent(values.map(function(_) { return JSON.stringify(_.valueOf ? _.valueOf() : _) }).join(','));
            },

            [[String]],
            Array, function parseLink_(link) {
                return JSON.parse(String('[' + decodeURIComponent(link) + ']'));
            },

            [ria.mvc.DomEventBind('click', 'A[data-link]')],
            [[ria.dom.Dom, ria.dom.Event]],
            Boolean, function onActionLinkClick(node, event) {
                var link = node.getData('link');
                var args = this.parseLink_(link);
                var controller = args.shift(),
                    action = args.shift();

                var state = this.context.getState();
                state.setController(controller);
                state.setAction(action);
                state.setParams(args);
                state.setPublic(false);

                this.context.stateUpdated();

                return false;
            }
        ]);
});