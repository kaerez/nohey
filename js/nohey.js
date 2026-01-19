(function() {
    'use strict';

    let currentWord = 'hello';
    const words = ['hello', 'hey', 'hi', 'hola', 'hallo', 'salut', 'ciao', 'olá', 'привет', 'cześć', 'ahoj', 'merhaba', 'halo', 'xin chào', '你好', 'سلام', 'שלום', 'hej'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    let typedElement = null;

    const TYPING_SPEED = 100;
    const DELETING_SPEED = 50;
    const PAUSE_BEFORE_DELETE = 2000;
    const PAUSE_AFTER_DELETE = 500;

    function type() {
        if (!typedElement) return;

        const word = words[wordIndex];

        if (isPaused) {
            return;
        }

        if (isDeleting) {
            charIndex--;
            typedElement.textContent = word.substring(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                    type();
                }, PAUSE_AFTER_DELETE);
                return;
            }
        } else {
            charIndex++;
            typedElement.textContent = word.substring(0, charIndex);

            if (charIndex === word.length) {
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                    isDeleting = true;
                    type();
                }, PAUSE_BEFORE_DELETE);
                return;
            }
        }

        const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
        setTimeout(type, speed);
    }

    function setWord(word) {
        currentWord = word;
        // Replace first word in array
        words[0] = word;
        // If currently showing old word, update display
        if (wordIndex === 0 && !isDeleting) {
            typedElement.textContent = word;
            charIndex = word.length;
        }
    }

    function initTyping() {
        typedElement = document.getElementById('typed-word');
        if (typedElement) {
            type();
        }
    }

    // Expose for other scripts
    window.initTyping = initTyping;
    window.setTypedWord = setWord;
})();
