// ==UserScript==
// @name        All-in-One Theater Mode (YouTube, Twitch, Kick) - AUTO FIX
// @namespace   CustomScript/TheaterMode/Fix
// @description Wymusza Tryb Kinowy (Theater Mode) na YouTube, Twitch i Kick po aktualizacji selektorów.
// @include     https://www.youtube.com/*
// @match       https://www.twitch.tv/*
// @match       https://kick.com/*
// @version     3.0.0
// @grant       none
// @run-at      document-start
// @license     MIT
// ==/UserScript==

(function() {
    'use strict';

    // Helper do dodawania stylów
    function addStyle(styleString) {
        const style = document.createElement('style');
        style.textContent = styleString;
        document.head.append(style);
    }

    // ===================================
    // 1. KICK (Naprawiono: Uproszczone style i wczesna aktywacja)
    // ===================================
    if (window.location.host === 'kick.com') {
        
        // Dodajemy style niezbędne do Trybu Kinowego na Kick (używając bardziej ogólnych selektorów)
        addStyle(`
            /* 1. Ukrycie paska nawigacji i sidebar'a */
            nav[role="navigation"], .sidebar {
                display: none !important;
            }
            /* 2. Rozciągnięcie playera na całą wysokość widoku */
            /* Zastępujemy to, co kontroluje układ strony */
            .relative.overflow-hidden,
            main.justify-center.w-full,
            #main-content {
                height: 100vh !important;
                max-height: 100vh !important;
                min-height: 100vh !important;
            }
            /* 3. Upewnienie się, że sam player zajmuje całą dostępną przestrzeń */
            div[id^="vjs_video"] {
                height: 100vh !important; 
                width: 100% !important;
            }
        `);

        // W przypadku Kick wystarczy sam CSS + natychmiastowe załadowanie.
        // Skoro @run-at document-start już dodaje CSS, Tryb Kinowy powinien się aktywować natychmiast.
        // Nie potrzebujemy skomplikowanego observera, jeśli style są wystarczająco silne.
        console.log('Kick: Automatyczny Tryb Kinowy aktywowany za pomocą CSS.');
    }

    // ===================================
    // 2. TWITCH (Naprawiono: Wykorzystanie nowoczesnego atrybutu "mode")
    // ===================================
    else if (window.location.host === 'www.twitch.tv') {
        
        // Na nowoczesnym Twitchu włączanie trybu kinowego to zmiana atrybutu 'data-a-player-state' na głównym kontenerze.
        // Najbezpieczniejsza metoda to kliknięcie przycisku, ale użyjemy też MutationObserver.
        
        const activateTwitchTheaterMode = () => {
            const theaterButton = document.querySelector('button[data-a-target="player-theatre-mode-button"]');

            if (theaterButton) {
                // Sprawdzamy, czy player jest w trybie normalnym, zanim klikniemy
                const playerContainer = document.querySelector('.video-player__container');
                const isTheaterMode = playerContainer && playerContainer.getAttribute('data-a-player-mode') === 'theatre';

                if (!isTheaterMode) {
                    theaterButton.click();
                    console.log('Twitch: Wymuszono kliknięcie przycisku Theater Mode.');
                    return true;
                }
            }
            return false;
        };

        // MutationObserver - czeka na załadowanie przycisku
        const observer = new MutationObserver((mutations, obs) => {
            if (activateTwitchTheaterMode()) {
                // Skrypt aktywowany. Czekamy teraz tylko na nawigację SPA (zmiana kanału).
                obs.disconnect(); 
            }
        });
        
        const startObserver = () => {
             observer.observe(document.body, { childList: true, subtree: true });
        };
        
        startObserver();

        // Obsługa nawigacji SPA (Single Page Application) na Twitchu
        window.addEventListener('popstate', startObserver);
        window.addEventListener('hashchange', startObserver);

        // Dodatkowa obsługa, bo Twitch ma specyficzną nawigację
        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(history, arguments);
            startObserver();
        };
    }

    // ===================================
    // 3. YOUTUBE (Bez zmian: Działa poprawnie)
    // ===================================
    else if (window.location.host === 'www.youtube.com') {
        
        const activateTheaterMode = () => {
            const theaterButton = document.querySelector('button.ytp-size-button');
            const videoContainer = document.getElementsByTagName('ytd-watch-flexy')[0];

            if (theaterButton && videoContainer) {
                // Sprawdzamy, czy jest włączony widok 'default' (brak atrybutu 'full-bleed-player')
                if (videoContainer.getAttribute('full-bleed-player') === null) {
                    theaterButton.click();
                    console.log('YouTube: Wymuszono kliknięcie przycisku Theater Mode.');
                }
            }
        };

        // Obserwujemy nawigację wewnętrzną (YouTube)
        window.addEventListener("yt-navigate-finish", () => {
            setTimeout(activateTheaterMode, 600);
        });

        // Uruchamiamy raz przy pierwszym ładowaniu strony
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(activateTheaterMode, 600);
        });
    }

})();
