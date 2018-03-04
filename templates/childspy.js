(function () {
    var inIframe = function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
    var getParentDstn = function () {
        var url = document.createElement('a'); url.setAttribute('href', window.location.href);
        return url.protocol + "//" + url.hostname + (url.port ? ":" + url.port : "");
    }
    var parentDstn = getParentDstn();

    // Report 404 On Resources
    var err = function (event, url) {
        window.parent.postMessage({
            "messageId": "resource404",
            "details": {
                "url": event.target.tagName == "LINK" ? event.target.href : event.target.src
            }
        }, parentDstn);
        return true;// don't show in console
    }
    window.addEventListener("error", err, true);

    //Process template after window load
    var loaded = function () {
        window.parent.postMessage({
            "messageId": "template",
            "details": {
                "content": document.getElementById("template").innerHTML,
                "framework": "mustache"
            }
        }, parentDstn);
    }
    window.addEventListener("load", loaded, true);

    // Called from Parent after template processing
    this.templatePostProc = function (html) {
        var app = document.getElementById("app");
        app.style.opacity = '1';
        app.style.display = 'block';
        app.innerHTML = html;
        window.parent.postMessage({
            "messageId": "templateApplied"
        }, parentDstn);
        setTimeout(() => {
            document.getElementById("template").remove();
        }, 240);
    }
    if (!inIframe()) {
        setTimeout(() => {
            var app = document.getElementById("app");
            if (app) {
                app.innerHTML = '<h1> Broken page? Go <a href="' + parentDstn + '">Home</a> and select a design.</h1>' + document.getElementById("template").innerHTML;
                app.style.opacity = '1';
                app.style.display = 'block';
            }
        }, 240);
    }
})();