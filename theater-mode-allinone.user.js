// ==UserScript==
// @name        All-in-One Theater Mode (YouTube, Twitch, Kick) - AUTO
// @namespace   CustomScript/TheaterMode
// @description Wymusza Tryb Kinowy (Theater Mode) na YouTube, Twitch i Kick, pomagając w problemach z natywnym playerem HTML5.
// @include     https://www.youtube.com/*
// @match       https://www.twitch.tv/*
// @match       https://kick.com/*
// @version     2.0.0
// @grant       none
// @run-at      document-start
// @license     MIT
// ==/UserScript==

(function() {
    'use strict';

    // ===================================
    // 1. KICK (AUTOMATYCZNY Tryb Kinowy)
    // ===================================
    if (window.location.host === 'kick.com') {

        function addStyle(styleString) {
            const style = document.createElement('style');
            style.textContent = styleString;
            document.head.append(style);
        }

        // Dodanie stylów niezbędnych do Trybu Kinowego na Kick
        addStyle(`
            /* Ukrycie paska nawigacji i sidebar'a */
            nav.border-secondary-lighter.bg-secondary-lighter.py-0 {
                display: none !important;
            }
            .sidebar {
                display: none !important;
            }
            /* Rozciągnięcie playera na całą wysokość widoku */
            .relative.overflow-hidden {
                height: 100vh !important;
            }
            div[id^="vjs_video"] {
                height: 100vh !important; 
                width: 100% !important;
            }
        `);

        // Funkcja wymuszająca tryb kinowy
        const activateKickTheaterMode = () => {
            const $header = document.querySelector('nav.border-secondary-lighter.bg-secondary-lighter.py-0');
            const $sidebar = document.querySelector('.relative .sidebar');
            const $videoOverflow = document.querySelector('.relative.overflow-hidden');
            const $videoSize = document.querySelector('div[id^="vjs_video"]');

            if ($header && $sidebar && $videoOverflow && $videoSize) {
                // Dodajemy klasy, aby aktywować style CSS dodane powyżej
                $header.classList.add('theaterMode');
                $sidebar.classList.add('theaterMode');
                $videoOverflow.classList.add('theaterMode');
                $videoSize.classList.add('theaterMode');
                return true; // Sukces
            }
            return false; // Nie znaleziono elementów
        };

        // Obserwator do aktywacji po załadowaniu głównego kontenera wideo
        const kickObserver = new MutationObserver((mutationsList, observer) => {
            if (activateKickTheaterMode()) {
                observer.disconnect(); // Zatrzymujemy obserwatora po pomyślnej aktywacji
            }
        });

        // Nasłuchiwanie na zmiany w body, aby wykryć załadowanie playera
        kickObserver.observe(document.body, { childList: true, subtree: true });
        
        // Opcjonalnie: Uruchomienie próby aktywacji raz po załadowaniu dokumentu (dla szybszego startu)
        document.addEventListener('DOMContentLoaded', () => setTimeout(activateKickTheaterMode, 500));
    }

    // --- Sekcje dla Twitch i YouTube pozostają takie, jakie były ---

    // ===================================
    // 2. TWITCH (Automatyczny Tryb Kinowy - Klikanie Przycisku)
    // ===================================
    else if (window.location.host === 'www.twitch.tv') {
        
        function waitForJQuery(callback) {
            if (typeof $ !== 'undefined' && typeof $ === 'function') {
                callback();
            } else {
                setTimeout(function() {
                    waitForJQuery(callback);
                }, 100);
            }
        }
        
        waitForJQuery(function() {
            var observer = new MutationObserver(function (mutations) {
                mutations.some(function (mutation) {
                    if (!mutation.addedNodes) return false;
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        // Szukamy przycisku trybu kinowego
                        var $node = $(mutation.addedNodes[i]).find('button[data-a-target="player-theatre-mode-button"], button.player-button--theatre');
                        if ($node.length) {
                            setTimeout(function () {
                                $node.click();
                            }, 10);
                            observer.disconnect(); 
                            return true;
                        }
                    }
                });
            });

            function startObserver() {
                observer.observe(document.body, { childList: true, subtree: true });
            }

            startObserver();

            (function (history) {
                var pushState = history.pushState;
                history.pushState = function (state) {
                    if (typeof history.onpushstate === "function") {
                        history.onpushstate({ state: state });
                    }
                    return pushState.apply(history, arguments);
                };
            })(window.history);

            window.onpopstate = history.onpushstate = function (event) {
                if (event.state && event.state.path || window.location.pathname.length > 1 && !window.location.pathname.includes('directory')) {
                     startObserver();
                }
            };
        });

    }

    // ===================================
    // 3. YOUTUBE (Automatyczny Tryb Kinowy - Klikanie Przycisku)
    // ===================================
    else if (window.location.host === 'www.youtube.com') {
        
        const activateTheaterMode = () => {
            const theaterButton = document.querySelector('button.ytp-size-button');
            const videoContainer = document.getElementsByTagName('ytd-watch-flexy')[0];

            if (theaterButton && videoContainer) {
                // Sprawdzamy, czy tryb kinowy jest wyłączony (lub jest to domyślny widok)
                if (videoContainer.getAttribute('full-bleed-player') === null) {
                    // Klikamy oryginalny przycisk
                    theaterButton.click();
                }
            }
        };

        // Obserwujemy nawigację wewnętrzną (YouTube)
        window.addEventListener("yt-navigate-finish", () => {
            setTimeout(activateTheaterMode, 600);
        });

        // Uruchamiamy raz przy pierwszym ładowaniu strony
        window.addEventListener("load", () => {
            setTimeout(activateTheaterMode, 600);
        });
    }

})();
