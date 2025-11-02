// ==UserScript==
// @name        All-in-One Theater Mode (YouTube, Twitch, Kick) - FINAL FIX
// @namespace   CustomScript/TheaterMode/FinalFix
// @description Wymusza Tryb Kinowy (Theater Mode) na YouTube, Twitch i Kick, używając precyzyjnych atrybutów.
// @include     https://www.youtube.com/*
// @match       https://www.twitch.tv/*
// @match       https://kick.com/*
// @version     4.0.0
// @grant       none
// @run-at      document-start
// @license     MIT
// ==/UserScript==

(function() {
    'use strict';

    // Helper do aktywacji po znalezieniu elementu
    const waitForElement = (selector, callback) => {
        const obs = new MutationObserver((mutations, observer) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                callback(element);
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    };

    // ===================================
    // 1. KICK (Aktywacja przez Kliknięcie Przycisku)
    // ===================================
    if (window.location.host === 'kick.com') {
        // Kick teraz ma swój przycisk trybu kinowego. Znajdujemy go po ikonie.
        const activateKickTheaterMode = () => {
            // Przycisk trybu kinowego na Kick - znajduje przycisk zawierający odpowiednią ikonę SVG
            const theaterButton = document.querySelector('button[aria-label="Tryb kinowy"]');
            
            if (theaterButton) {
                // Sprawdzamy stan: Tryb Kinowy jest aktywny, gdy body ma atrybut data-theatre="true"
                const isTheaterActive = document.body.getAttribute('data-theatre') === 'true';

                if (!isTheaterActive) {
                    theaterButton.click();
                    console.log('Kick: Wymuszono kliknięcie przycisku Tryb Kinowy.');
                    return true;
                }
            }
            return false;
        };
        
        // Czekamy na załadowanie przycisku i próbujemy kliknąć
        waitForElement('button[aria-label="Tryb kinowy"]', activateKickTheaterMode);
        
        // Czasem przy nawigacji SPA musimy powtórzyć
        window.addEventListener('popstate', () => setTimeout(activateKickTheaterMode, 500));
        
    }

    // ===================================
    // 2. TWITCH (Aktywacja przez Kliknięcie Przycisku)
    // ===================================
    else if (window.location.host === 'www.twitch.tv') {
        
        const activateTwitchTheaterMode = (button) => {
            const playerContainer = document.querySelector('[data-a-player-mode]');
            // Sprawdzamy, czy player jest w trybie innym niż 'theatre'
            const isTheaterMode = playerContainer && playerContainer.getAttribute('data-a-player-mode') === 'theatre';

            if (!isTheaterMode) {
                button.click();
                console.log('Twitch: Wymuszono kliknięcie przycisku Theatre Mode.');
                return true;
            }
            return false;
        };

        // Czekamy na załadowanie przycisku używając jego niezawodnego atrybutu ARIA
        const startTwitchObserver = () => {
             // Używamy aria-label, który jest stały, mimo dynamicznych klas CSS
            waitForElement('button[aria-label^="Theatre Mode"]', activateTwitchTheaterMode);
        };
        
        // Obsługa nawigacji SPA
        window.addEventListener('popstate', () => setTimeout(startTwitchObserver, 500));
        window.addEventListener('hashchange', () => setTimeout(startTwitchObserver, 500));
        
        startTwitchObserver();
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
