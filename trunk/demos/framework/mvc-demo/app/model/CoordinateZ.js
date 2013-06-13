/**
 * Created with JetBrains WebStorm.
 * User: viatsyshyn
 * Date: 04.06.13
 * Time: 16:33
 * To change this template use File | Settings | File Templates.
 */

NAMESPACE('app.model', function () {
    "use strict";

    /** @class app.model.CoordinateZ */
    IDENTIFIER('CoordinateZ');

    /** @class app.model.MyViewModel */
    CLASS(
        'MyViewModel', [
            Number, 'field1',
            Boolean, 'field2',
            String, 'desc',
            app.model.CoordinateZ, 'field3'
        ]);

    /** @class app.model.GeneralList */
    CLASS(
        'GeneralList', [
            Function, 'modelClass',
            ArrayOf(Object), 'items',
            Number, 'page',
            Number, 'count',

            Object, function asArrayStore() {

            }
        ])
});