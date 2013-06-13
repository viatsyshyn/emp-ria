NAMESPACE('ria.templates', function () {

    /** @class ria.templates.Exception */
    CLASS(
        'Exception', [
            function $(msg, inner_) {
                BASE(msg, inner_);
            }
        ]);
});
