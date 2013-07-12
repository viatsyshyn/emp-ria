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
                BASE();

                this._method = method_;
                this._url = url;
                this._params = params_ || {};
                this._requestTimeout = null;

                this._xhr = new XMLHttpRequest();

                this._xhr.addEventListener("progress", this.updateProgress_, false);
                this._xhr.addEventListener("load", this.transferComplete_, false);
                this._xhr.addEventListener("error", this.transferFailed_, false);
                this._xhr.addEventListener("abort", this.transferCanceled_, false);
            },

            OVERRIDE, function cancel() {
                this._xhr.abort();
            },

            [[ria.ajax.Method]],
            SELF, function method(method) {
                this._method = method;
                return this;
            },

            [[Object]],
            SELF, function params(obj) {
                var p = this._params;
                for(var key in obj) if (obj.hasOwnProperty(key) && (obj[key] != undefined) && (obj[key] != null)) {
                    p[key] = obj[key];
                }
                return this;
            },

            [[String]],
            SELF, function disableCache(paramName_) {
                this._params[paramName_ || '_'] = Math.random().toString(36).substr(2) + (new Date).getTime().toString(36);
                return this;
            },

            [[Number]],
            SELF, function timeout(duration) {
                this._requestTimeout = duration;
                return this;
            },

            FINAL, String, function getParamsAsQueryString_() {
                var p = this._params, r = [];
                for(var key in p) if (p.hasOwnProperty(key)) {
                    r.push([key, p[key]].map(encodeURIComponent).join('='));
                }
                return r.join('&');
            },

            FINAL, String, function getParamsString_(){
                var p = this._params, r = [];
                for(var key in p) if (p.hasOwnProperty(key)) {
                    r.push([key, p[key]].join('='));
                }
                return r.join('&');
            },

            VOID, function updateProgress_(oEvent) {
                this._completer.progress(oEvent);
            },

            VOID, function transferComplete_(evt) {
                this._completer.complete(this._xhr.responseText);
            },

            VOID, function transferFailed_(evt) {
                this._completer.completeError(Error(evt));
            },

            VOID, function transferCanceled_(evt) {
                this._completer.cancel();
            },

            String, function getUrl_() {
                if (this._method != ria.ajax.Method.GET)
                    return this._url;

                return this._url + ((/\?/).test(this._url) ? "&" : "?") + this.getParamsAsQueryString_();
            },

            String, function getBody_() {
                return this._method != ria.ajax.Method.GET ? this.getParamsAsQueryString_() : this.getParamsString_();
            },

            FINAL, OVERRIDE, VOID, function do_() {
                try {
                    BASE();
                    this._xhr.open(this._method.valueOf(), this.getUrl_(), true);
                    if (this._method != ria.ajax.Method.GET){
                        if (this._params){
                            this._xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        }
                    }
                    this._xhr.send(this.getBody_());
                } catch (e) {
                    this._completer.completeError(e);
                }

                // todo change to ria.async.Timer.$once
                this._requestTimeout && new ria.async.Timer(this._requestTimeout, this.timeoutHandler_);
            },

            [[ria.async.Timer, Number]],
            VOID, function timeoutHandler_(timer, lag) {
                timer.cancel(); // todo remove after change to ria.async.Timer.$once
                this._completer.isCompleted() || this.cancel();
            }
        ]);
});