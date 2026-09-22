/**
 * ============================================================================
 * APPLICATION ENTRY POINT (main.js)
 * ============================================================================
 * This script initializes all components, connects the Auth and Database
 * sub-system to the Game engine, handles view routing between the Homepage
 * and the Coding Challenges interface, and binds all user interface buttons.
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators (full if/else blocks only)
 * - Always use braces around statement blocks
 * - Descriptive variable names (no single letters except i, j)
 * - Heavy comments explaining setup steps for beginners
 */

// Wait until the DOM content is completely loaded before initializing
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded. Initializing CampCoder application...");

    // 1. Initialize Authentication and Cloud Database Manager
    const authManager = new AuthManager();

    // 2. Initialize Core Game Sub-systems
    const gridTileSizePixels = 40;
    const playerController = new Player("player", gridTileSizePixels);
    const inventoryController = new Inventory(
        "inventory-panel",
        document.getElementById("stage"),
        gridTileSizePixels
    );
    const workspaceController = new Workspace("workspace", LEVELS_DATA.length);

    // 3. Initialize the Master Game Orchestrator
    const gameOrchestrator = new Game(
        playerController,
        inventoryController,
        workspaceController,
        LEVELS_DATA,
        authManager
    );

    // Connect the Auth manager back to the Game so Firestore updates can refresh the board
    authManager.setGameInstance(gameOrchestrator);

    // 4. Load any existing local progress if playing in Guest Mode
    const localGuestData = authManager.loadLocalGuestProgress();
    if (localGuestData.highestLevelCleared > 0) {
        gameOrchestrator.setHighestLevelCleared(localGuestData.highestLevelCleared);
    }
    if (localGuestData.workspaceCode) {
        gameOrchestrator.restoreWorkspaceCodeMap(localGuestData.workspaceCode);
    }

    // 5. Grab View and Navigation DOM Elements
    const homepageViewElement = document.getElementById("homepage-view");
    const gameContainerElement = document.getElementById("game-container");
    const navHomeLinkElement = document.getElementById("nav-home-link");
    const navPlayLinkElement = document.getElementById("nav-play-link");
    const navLogoLinkElement = document.getElementById("nav-logo-link");

    /**
     * Switches the active screen view between the Homepage and the Coding Workspace.
     * 
     * @param {string} viewName Either "home" or "play".
     */
    function switchActiveView(viewName) {
        if (viewName === "play") {
            // Display game workspace and hide homepage
            if (homepageViewElement) {
                homepageViewElement.style.display = "none";
            }
            if (gameContainerElement) {
                gameContainerElement.style.display = "flex";
            }

            // Add class to body to prevent unnecessary scrollbars during gameplay
            document.body.classList.add("in-game-view");

            // Update active navigation link styles
            if (navHomeLinkElement) {
                navHomeLinkElement.classList.remove("active");
            }
            if (navPlayLinkElement) {
                navPlayLinkElement.classList.add("active");
            }

            // Sync URL hash for bookmarks and browser history
            if (window.location.hash !== "#play") {
                window.location.hash = "#play";
            }
        } else {
            // Display homepage and hide game workspace
            if (homepageViewElement) {
                homepageViewElement.style.display = "flex";
            }
            if (gameContainerElement) {
                gameContainerElement.style.display = "none";
            }

            // Remove game-mode class from body so user can scroll down the homepage
            document.body.classList.remove("in-game-view");

            // Update active navigation link styles
            if (navHomeLinkElement) {
                navHomeLinkElement.classList.add("active");
            }
            if (navPlayLinkElement) {
                navPlayLinkElement.classList.remove("active");
            }

            // Sync URL hash for bookmarks and browser history
            if (window.location.hash !== "#home" && window.location.hash !== "") {
                window.location.hash = "#home";
            }
        }
    }

    // 6. Bind Navigation Bar Links
    if (navHomeLinkElement) {
        navHomeLinkElement.addEventListener("click", function(clickEvent) {
            clickEvent.preventDefault();
            switchActiveView("home");
        });
    }

    if (navPlayLinkElement) {
        navPlayLinkElement.addEventListener("click", function(clickEvent) {
            clickEvent.preventDefault();
            switchActiveView("play");
        });
    }

    if (navLogoLinkElement) {
        navLogoLinkElement.addEventListener("click", function(clickEvent) {
            clickEvent.preventDefault();
            switchActiveView("home");
        });
    }

    // 7. Listen for Browser Back / Forward Button Navigation
    window.addEventListener("hashchange", function() {
        if (window.location.hash === "#play" || window.location.hash === "#game") {
            switchActiveView("play");
        } else {
            switchActiveView("home");
        }
    });

    // 8. Bind Homepage Hero Action Buttons
    const heroLoginButton = document.getElementById("hero-login-btn");
    if (heroLoginButton) {
        heroLoginButton.addEventListener("click", function() {
            authManager.openModal("login");
        });
    }

    const heroGuestButton = document.getElementById("hero-guest-btn");
    if (heroGuestButton) {
        heroGuestButton.addEventListener("click", function() {
            switchActiveView("play");
        });
    }

    const heroContinueButton = document.getElementById("hero-continue-btn");
    if (heroContinueButton) {
        heroContinueButton.addEventListener("click", function() {
            switchActiveView("play");
        });
    }

    // 9. Bind Game Workspace Control Buttons
    const runProgramButton = document.getElementById("run-btn");
    if (runProgramButton) {
        runProgramButton.addEventListener("click", function() {
            gameOrchestrator.startExecution();
        });
    }

    const resetStageButton = document.getElementById("reset-btn");
    if (resetStageButton) {
        resetStageButton.addEventListener("click", function() {
            gameOrchestrator.reset();
        });
    }

    const clearWorkspaceButton = document.getElementById("clear-btn");
    if (clearWorkspaceButton) {
        clearWorkspaceButton.addEventListener("click", function() {
            workspaceController.clear();
        });
    }

    // 10. Load Initial Level (Level 1)
    gameOrchestrator.loadLevel(0);

    // 11. Set Initial View based on URL Hash (Default to Homepage)
    if (window.location.hash === "#play" || window.location.hash === "#game") {
        switchActiveView("play");
    } else {
        switchActiveView("home");
    }

    console.log("CampCoder initialized successfully with educational homepage and 40 levels!");
});