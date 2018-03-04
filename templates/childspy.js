(function () {
    var parentDstn = function () {
        var url = document.createElement('a'); url.setAttribute('href', window.location.href);
        return url.protocol + "//" + url.hostname + (url.port ? ":" + url.port : "");
    }

    // Report 404 On Resources
    var err = function (event, url) {
        window.parent.postMessage({
            "messageId": "resource404",
            "message": {
                "url": event.target.tagName == "LINK" ? event.target.href : event.target.src
            }
        }, parentDstn());
        return true;// don't show in console
    }
    window.addEventListener("error", err, true);

    //Process template after load
    var loaded = function () {
        window.parent.postMessage({
            "messageId": "template",
            "template": {
                "content": document.getElementById("template").innerHTML,
                "framework": "mustache"
            }
        }, parentDstn());
    }
    window.addEventListener("load", loaded, true);

    // Called from Parent after template processing
    this.templatePostProc = function (html) {
        var template = document.getElementById("template");
        template.innerHTML = html;
        template.style.opacity = '1';
    }
})();