/**
 * @class ria.ajax.AjaxTask
 *
    Usage:

    new ria.ajax.Task(ria.async.Method.GET, '/service/')
        .params({a: 1, b: 3})
        .disableCache()
        .timeout(500) // ms
        .run()
            .progressUpdate(function (event) {})
            .then(function (data) {})
            .catchError(function (event) {})
            .complete(function () {})
 */

REQUIRE('ria.async.Task');
REQUIRE('ria.async.Timer');

NAMESPACE('ria.ajax', function () {
    "use strict";

    /** @class ria.ajax.Method */
    ENUM(
        'Method', {
            GET: 'get',
            POST: 'post',
            PUT: 'put',
            DELETE: 'delete'
        });

    /** @class ria.ajax.Task */
    CLASS(
        'Task', [
            [[ria.ajax.Method, String, Object]],
            function $(method, url, params_) {
                this.method = method;
                this.url = url;
                this.params = params_ || {};
                this.requestTimeout = null;

                this.xhr = new XmlHttpRequest();

                this.xhr.addEventListener("progress", this.updateProgress_, false);
                this.xhr.addEventListener("load", this.transferComplete_, false);
                this.xhr.addEventListener("error", this.transferFailed_, false);
                this.xhr.addEventListener("abort", this.transferCanceled_, false);
            },

            OVERRIDE, function cancel() {
                this.xhr.abort();
            },

            [[Object]],
            SELF, function params(obj) {
                var p = this.params;
                for(var key in obj) if (obj.hasOwnProperty(key)) {
                    p[key] = obj[key];
                }
            },

            [[String]],
            SELF, function disableCache(paramName_) {
                this.params[paramName_ || '_'] = Math.random().toString(36).substr(2) + (new Date).getTime().toString(36);
                return this;
            },

            [[Number]],
            SELF, function timeout(duration) {
                this.requestTimeout = duration;
            },

            FINAL, String, function getParamsAsQueryString_() {
                var p = this.params, r = [];
                for(var key in p) if (p.hasOwnProperty(key)) {
                    r.push([key, p[key].map(encodeURIComponent).join('=')]);
                }
                return r.join('&');
            },

            function updateProgress_(oEvent) {
                this.completer.progress(event);
            },

            function transferComplete_(evt) {
                this.completer.complete(this.xhr.responseText);
            },

            function transferFailed_(evt) {
                this.completer.completeError(this.xhr);
            },

            function transferCanceled_(evt) {
                this.completer.cancel();
            },

            function getUrl_() {
                if (this.method != ria.ajax.Method.GET)
                    return this.url;

                return this.url + ((/\?/).test(this.url) ? "&" : "?") + this.getParamsAsQueryString_();
            },

            OVERRIDE, VOID, function do_() {
                this.xhr.open(this.method.valueOf(), this.getUrl_(), true);
                this.xhr.send(this.method != ria.ajax.Method.GET ? this.getParamsAsQueryString_() : null);

                // todo change to ria.async.Timer.$once
                this.requestTimeout && new ria.async.Timer(this.requestTimeout, this.timeoutHandler_);
            },

            [[ria.async.Timer, Number]],
            function timeoutHandler_(timer, lag) {
                timer.cancel(); // todo remove after change to ria.async.Timer.$once
                this.comleter.isComplete() || this.cancel();
            }
        ]);
});