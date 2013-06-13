REQUIRE('ria.mvc.Application');

REQUIRE('app.controllers.NotesController');

NAMESPACE('app', function (){

    /** @class app.Application */
    CLASS(
        'Application', EXTENDS(ria.mvc.Application), [
            OVERRIDE, ria.async.Future, function onStart_() {
                return BASE()
                    .then(function (data) {
                        jQuery('#main').empty().html(ASSET('~/assets/jade/index.jade')());
                        return data;
                    });
            }
        ]);
});
