
(function playMusic() {
    "use strict";
    var context,
        myBuffer = null,
        request,
        source;

    function init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
        } catch (e) {
            alert("Web Audio API is not supported in this browser");
        }
    }
    window.addEventListener("load", init, false);

    function loadSound(url) {
        request = new XMLHttpRequest();
        request.open('GET', '/Users/shahnauronas/Documents/Flu 88.2.d.mp3', true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            context.decodeAudioData(request.response,
                function (buffer) {
                    myBuffer = buffer;
                }
            );
        }
        request.send();
    }

    function playSound(buffer) {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
    }      
}())