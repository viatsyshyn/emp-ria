REQUIRE('ria.mvc.IContext');
REQUIRE('ria.mvc.Dispatcher');

NAMESPACE('ria.mvc', function () {

    /** @class ria.mvc.BaseContext */
    CLASS(
        'BaseContext', IMPLEMENTS(ria.mvc.IContext), [
            ria.mvc.IView, 'defaultView',
            ria.mvc.ISession, 'session',
            ria.mvc.Dispatcher, 'dispatcher',

            VOID, function stateUpdated() {
                if (!this.dispatcher.isDispatching())
                    this.dispatcher.dispatch(this.dispatcher.getState(), this);
            },

            ria.mvc.State, function getState() {
                return this.dispatcher.getState();
            }
        ]);
});
