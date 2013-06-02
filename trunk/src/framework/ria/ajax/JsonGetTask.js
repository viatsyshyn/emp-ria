/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 6/2/13
 * Time: 10:22 AM
 * To change this template use File | Settings | File Templates.
 */

REQUIRE('ria.ajax.Task');

NAMESPACE('ria.ajax', function () {
    "use strict";

    /** @class ria.ajax.JsonGetTask */
    CLASS(
        'JsonGetTask', EXTENDS(ria.ajax.Task), [
            function $(url) {
                BASE(url, ria.ajax.Method.GET);
            },

            OVERRIDE, ria.async.Future, function run() {
                return BASE()
                    .then(function (data) {
                        return JSON.parse(data);
                    })
            }
        ]);
});