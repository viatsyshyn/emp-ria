/**
 * Created with JetBrains WebStorm.
 * User: viatsyshyn
 * Date: 04.06.13
 * Time: 16:30
 * To change this template use File | Settings | File Templates.
 */


REQUIRE('ria.async.Future');

REQUIRE('app.model.CoordinateZ');

NAMESPACE('app.services', function () {
    "use strict";

    /** @class app.services.DataException */
    EXCEPTION(
        'DataException', [
            function $(msg, inner_) {
                BASE(msg, inner_);
            }
        ]);

    /** @class app.services.TestService */
    CLASS(
        'TestService', [
            ria.async.Future, function getItems(page) {
                return this.getList('my-server-action', app.model.MyArrayViewModel, {
                    "page": page
                });
            },

            ria.async.Future, function getSector(x_, y_, z_) {
                return ria.async.DeferredAction();
            }
        ])
});