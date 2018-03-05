//watch & report resource 404s - self invoking
(function () {
    var url = document.createElement('a'); url.setAttribute('href', window.location.href);
    parentUrl = url.protocol + "//" + url.hostname + (url.port ? ":" + url.port : "");

    var report404s = function (event, url) {
        window.parent.postMessage({
            "messageId": "resource404",
            "details": {
                "url": event.target.tagName == "LINK" ? event.target.href : event.target.src
            }
        }, (parentUrl || '*'));
        return true;// don't show in console
    }
    window.addEventListener("error", report404s, true);
}());

/*
 * Plugin - start
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.designChild = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {
    'use strict';

    //////////////////////////////
    // Variables
    //////////////////////////////

    var designChild = {}; // Object for public APIs
    var supports = !!document.querySelector && !!root.addEventListener; // Feature test
    var settings, eventTimeout;
    var head = document.getElementsByTagName('head')[0];

    // Default settings
    var defaults = {
        parentUrl: '',
        messageIdFromParent: 'processed',
        initClass: 'design-child',
        getDesignTemplate: function () {
            return document.getElementById("template").innerHTML
        },
        callbackAfterProcessing: function (html) { }
    };

    //////////////////////////////
    // Private Functions
    //////////////////////////////

    /**
     * A simple forEach() implementation for Arrays, Objects and NodeLists
     * @private
     * @param {Array|Object|NodeList} collection Collection of items to iterate
     * @param {Function} callback Callback function for each iteration
     * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
     */
    var forEach = function (collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extend = function (defaults, options) {
        var extended = {};

        forEach(defaults, function (value, prop) {
            extended[prop] = defaults[prop];
        });

        forEach(options, function (value, prop) {
            extended[prop] = options[prop];
        });

        return extended;
    };

    /**
	 * Handle events
	 * @private
	 */
    var eventHandler = function (event) {

    }

    /** 
     * Detect parent page's window url, used for messaging parent
     */
    var getParentUrl = function () {
        var url = document.createElement('a'); url.setAttribute('href', window.location.href);
        settings.parentUrl = url.protocol + "//" + url.hostname + (url.port ? ":" + url.port : "");
        return settings.parentUrl;
    }

    var requestProcessingTemplate = function (templateHtml) {
        window.parent.postMessage({
            "messageId": "template",
            "details": {
                "content": templateHtml,
                "framework": "mustache"
            }
        }, (settings.parentUrl || getParentUrl()));
    }

    var sayTemplateApplied = function () {
        window.parent.postMessage({
            "messageId": "templateApplied"
        }, (settings.parentUrl || getParentUrl()));
    }
    //////////////////////////////
    // Public APIs
    //////////////////////////////

    /**
     * Destroy the current initialization.
     * @public
     */
    designChild.destroy = function () {

        // If plugin isn't already initialized, stop
        if (!settings) return;

        // Remove init class for conditional CSS
        document.documentElement.classList.remove(settings.initClass);

        // Remove event listeners
        document.removeEventListener('click', eventHandler, false);

        // Reset variables
        settings = null;
        eventTimeout = null;
    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    designChild.init = function (options) {
        var template = '';
        // Feature test
        if (!supports) return;

        // Destroy any existing initializations
        designChild.destroy();

        // Merge user options with defaults
        settings = extend(defaults, options || {});

        // Add class to HTML element to activate conditional CSS
        document.documentElement.classList.add(settings.initClass);

        // Callback before Processing Template
        template = settings.getDesignTemplate.bind(this, [settings])();

        // Send to Parent for Template Processing
        requestProcessingTemplate(template);

        // Listen for events
        window.addEventListener('click', eventHandler, false);

        return this;
    };

    designChild.onTemplateComplete = function (html) {
        var app = document.getElementById("app");
        app.style.opacity = '1';
        app.style.display = 'block';
        app.innerHTML = html;
        sayTemplateApplied();
        settings.callbackAfterProcessing(html);
    }

    //////////////////////////////
    // Public API
    //////////////////////////////

    return designChild;
});


/*
 * Plugin - end
 */