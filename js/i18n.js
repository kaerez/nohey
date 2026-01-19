(function() {
    'use strict';

    const LANGUAGES = {
        'en': { name: 'English', rtl: false },
        'he': { name: 'עברית', rtl: true },
        'de': { name: 'Deutsch', rtl: false },
        'es': { name: 'Español', rtl: false },
        'fr': { name: 'Français', rtl: false },
        'it': { name: 'Italiano', rtl: false },
        'pt': { name: 'Português', rtl: false },
        'pt-br': { name: 'Português (Brasil)', rtl: false },
        'ru': { name: 'Русский', rtl: false },
        'uk': { name: 'Українська', rtl: false },
        'pl': { name: 'Polski', rtl: false },
        'cs': { name: 'Čeština', rtl: false },
        'sv': { name: 'Svenska', rtl: false },
        'tr': { name: 'Türkçe', rtl: false },
        'id': { name: 'Bahasa Indonesia', rtl: false },
        'vi': { name: 'Tiếng Việt', rtl: false },
        'zh-cn': { name: '简体中文', rtl: false },
        'fa': { name: 'فارسی', rtl: true }
    };

    const DEFAULT_LANG = 'en';

    function getBasePath() {
        // Get base path for GitHub Pages subdirectory support
        // e.g., /nohey.org/ or / for custom domain
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        
        if (LANGUAGES[lastSegment]) {
            // Current path ends with a language code
            segments.pop();
        }
        
        return '/' + (segments.length ? segments.join('/') + '/' : '');
    }

    function getLangFromPath() {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && LANGUAGES[lastSegment]) {
            return lastSegment;
        }
        return null;
    }

    function getBrowserLang() {
        const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];
        for (const lang of browserLangs) {
            const code = lang.toLowerCase();
            if (LANGUAGES[code]) return code;
            const short = code.split('-')[0];
            if (LANGUAGES[short]) return short;
            // Handle zh-CN -> zh-cn
            const normalized = code.replace('_', '-');
            if (LANGUAGES[normalized]) return normalized;
        }
        return DEFAULT_LANG;
    }

    function parseTOML(text) {
        const result = {};
        const lines = text.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const match = trimmed.match(/^([^=]+)=\s*"""([\s\S]*?)"""/);
            if (match) {
                result[match[1].trim()] = match[2];
                continue;
            }
            const simpleMatch = trimmed.match(/^([^=]+)=\s*"(.*)"/);
            if (simpleMatch) {
                result[simpleMatch[1].trim()] = simpleMatch[2].replace(/\\n/g, '\n');
            }
        }
        return result;
    }

    function markdownToHTML(text) {
        // Replace year placeholder
        text = text.replace(/%1\$s/g, new Date().getFullYear());
        // Bold
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        text = text.replace(/_(.+?)_/g, '<em>$1</em>');
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        // Line breaks and lists
        const lines = text.split('\n');
        let html = '';
        let inList = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += '<li>' + trimmed.substring(2) + '</li>';
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed) {
                    html += '<p>' + trimmed + '</p>';
                }
            }
        }
        if (inList) html += '</ul>';
        return html;
    }

    function renderLanguageList(currentLang, basePath) {
        const container = document.getElementById('language-list');
        if (!container) return;
        const links = Object.entries(LANGUAGES).map(([code, info]) => {
            if (code === currentLang) {
                return `<strong>${info.name}</strong>`;
            }
            return `<a href="${basePath}${code}">${info.name}</a>`;
        });
        container.innerHTML = links.join(' · ');
    }

    function applyTranslations(translations) {
        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
                el.textContent = translations[key];
            }
        });
        // HTML content (with markdown)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[key]) {
                el.innerHTML = markdownToHTML(translations[key]);
            }
        });
        // Alt text
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            if (translations[key]) {
                el.alt = translations[key];
            }
        });
    }

    async function loadLanguage(lang, basePath = '/') {
        try {
            const response = await fetch(`${basePath}locales/${lang}.toml`);
            if (!response.ok) throw new Error('Failed to load');
            const text = await response.text();
            return parseTOML(text);
        } catch (e) {
            console.error(`Failed to load ${lang}, falling back to ${DEFAULT_LANG}`);
            if (lang !== DEFAULT_LANG) {
                return loadLanguage(DEFAULT_LANG, basePath);
            }
            return {};
        }
    }

    async function init() {
        const basePath = getBasePath();
        let lang = getLangFromPath();
        
        // If no language in path, detect and redirect
        if (!lang) {
            lang = getBrowserLang();
            window.location.replace(basePath + lang);
            return;
        }

        // Set document direction and lang
        const langInfo = LANGUAGES[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = langInfo.rtl ? 'rtl' : 'ltr';

        // Load and apply translations
        const translations = await loadLanguage(lang, basePath);
        applyTranslations(translations);
        renderLanguageList(lang, basePath);

        // Initialize typing animation
        if (typeof initTyping === 'function') {
            initTyping();
        }

        // Initialize easter egg
        if (typeof initHey === 'function') {
            initHey();
        }

        // Show content
        document.body.classList.add('loaded');
    }

    // Expose language info for other scripts
    window.i18n = {
        LANGUAGES,
        getLangFromPath,
        loadLanguage
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
