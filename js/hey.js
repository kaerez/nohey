(function() {
    'use strict';

    const SECRET = 'hey';
    let buffer = '';
    let activated = false;

    function activate() {
        if (activated) return;
        activated = true;

        // Change typed word from "hello" to "hey"
        if (typeof setTypedWord === 'function') {
            setTypedWord('hey');
        }

        // Add background effect
        document.body.classList.add('hey-mode');

        // Optional: show why.gif as background
        document.body.style.backgroundImage = 'url(imgs/why.gif)';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }

    function handleKeyPress(e) {
        // Only track letter keys
        if (e.key.length !== 1 || !e.key.match(/[a-z]/i)) {
            buffer = '';
            return;
        }

        buffer += e.key.toLowerCase();

        // Keep buffer at secret length
        if (buffer.length > SECRET.length) {
            buffer = buffer.slice(-SECRET.length);
        }

        // Check for secret
        if (buffer === SECRET) {
            activate();
        }
    }

    function initHey() {
        document.addEventListener('keypress', handleKeyPress);
    }

    window.initHey = initHey;
})();
