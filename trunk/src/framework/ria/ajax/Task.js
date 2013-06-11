/**
 * @class ria.ajax.AjaxTask
 *
    Usage:

    new ria.ajax.Task('/service/')
        .method(ria.async.Method.GET)
        .params({a: 1, b: 3})
        .disableCache()
        .timeout(500) // ms
        .run() // returns Future
            .handleProgress(function (event) {})
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
        'Task', EXTENDS(ria.async.Task), [
            [[String, ria.ajax.Method, Object]],
            function $(url, method_, params_) {
                this.method = method_;
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

            [[ria.ajax.Method]],
            SELF, function method(method) {
                this.method = method;
                return this; // todo: return public version of this
            },

            [[Object]],
            SELF, function params(obj) {
                var p = this.params;
                for(var key in obj) if (obj.hasOwnProperty(key)) {
                    p[key] = obj[key];
                }
                return this; // todo: return public version of this
            },

            [[String]],
            SELF, function disableCache(paramName_) {
                this.params[paramName_ || '_'] = Math.random().toString(36).substr(2) + (new Date).getTime().toString(36);
                return this; // todo: return public version of this
            },

            [[Number]],
            SELF, function timeout(duration) {
                this.requestTimeout = duration;
                return this; // todo: return public version of this
            },

            FINAL, String, function getParamsAsQueryString_() {
                var p = this.params, r = [];
                for(var key in p) if (p.hasOwnProperty(key)) {
                    r.push([key, p[key].map(encodeURIComponent).join('=')]);
                }
                return r.join('&');
            },

            VOID, function updateProgress_(oEvent) {
                this.completer.progress(event);
            },

            VOID, function transferComplete_(evt) {
                this.completer.complete(this.xhr.responseText);
            },

            VOID, function transferFailed_(evt) {
                this.completer.completeError(evt);
            },

            VOID, function transferCanceled_(evt) {
                this.completer.cancel();
            },

            String, function getUrl_() {
                if (this.method != ria.ajax.Method.GET)
                    return this.url;

                return this.url + ((/\?/).test(this.url) ? "&" : "?") + this.getParamsAsQueryString_();
            },

            String, function getBody_() {
                return this.method != ria.ajax.Method.GET ? this.getParamsAsQueryString_() : null;
            },

            FINAL, OVERRIDE, VOID, function do_() {
                try {
                    BASE();
                    this.xhr.open(this.method.valueOf(), this.getUrl_(), true);
                    this.xhr.send(this.getBody_());
                } catch (e) {
                    this.completer.completeError(e);
                }

                // todo change to ria.async.Timer.$once
                this.requestTimeout && new ria.async.Timer(this.requestTimeout, this.timeoutHandler_);
            },

            [[ria.async.Timer, Number]],
            VOID, function timeoutHandler_(timer, lag) {
                timer.cancel(); // todo remove after change to ria.async.Timer.$once
                this.completer.isCompleted() || this.cancel();
            }
        ]);
});