/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 6/19/13
 * Time: 9:02 PM
 * To change this template use File | Settings | File Templates.
 */


NAMESPACE('app.model', function () {
    "use strict";

    /** @class app.model.PaginatedList */
    CLASS(
        'PaginatedList', [
            [[Function]],
            function $(itemClass) {
                this.itemClass = itemClass;
            },

            READONLY, Function, 'itemClass',

            ArrayOf(Object), 'items',

            Number, 'pageSize',
            Number, 'page',
            Number, 'count',

            VOID, function setItems(values) {
                VALIDATE_ARG('value', [ArrayOf(this.itemClass)], values);

                this.items = values;
            }
        ])
})