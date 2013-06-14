REQUIRE('ria.mvc.Controller');
//REQUIRE('ria.mvc.DependencyInjector');

NAMESPACE('app.controllers', function () {
    "use strict";

    /** @class app.controllers.Base */
    CLASS(
        'Base', EXTENDS(ria.mvc.Controller), [

            [[Function, ria.async.Future]],
            VOID, function PushView(activityClass, data) {
                var instance = new activityClass;

                data.then(function (data) {
                    instance.refresh(data);
                });

                this.getView().push(instance);
            }
        ])
});