/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 6/1/13
 * Time: 9:16 PM
 * To change this template use File | Settings | File Templates.
 */

REQUIRE('app.controllers.Base');
REQUIRE('app.services.NotesService');

REQUIRE('app.activities.Notes');

NAMESPACE('app.controllers', function () {
    "use strict";

    /** @class app.controllers.NotesController */
    CLASS(
        [ria.mvc.ControllerUri('index')],
        'NotesController', EXTENDS(app.controllers.Base), [

            [ria.mvc.Inject],
            app.services.NotesService, 'service',

            ria.async.Future, function validateResponse_() {
                var head
                    , me = this;

                (head = new ria.async.Future)
                    .catchError(function (error) {
                        throw app.services.DataException('Failed to load data', error);
                    })
                    .then(function (data) {
                        // TODO: check response here
                        /*if (!data.isOkResponse())
                         throw app.services.DataException('Failed to load data: ' + $L(data.getErrorCode()));*/

                        return data;
                    })
                    .catchException(app.services.DataException, function (error) {
                        this.BREAK(); // failed with exception, stop further processing

                        console.error(error.toString());
                        // todo: scoping !?
                        //me.view.showAlertBox(error.getMessage());
                    });

                return head;
            },

            [[Number, Number, app.model.Note]],
            function indexAction() {
                var result = this.service
                    .getNotes()
                    .attach(this.validateResponse_());

                /* Put activity in stack and render when result is ready */
                return this.PushView(app.activities.Notes, result);
            },
        ]);
})