/**
 * ============================================================================
 * APPLICATION ENTRY POINT (main.js)
 * ============================================================================
 * This script initializes all components, connects the Auth and Database
 * sub-system to the Game engine, binds all user interface buttons, and boots
 * up the initial level.
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators
 * - Always use braces
 * - Descriptive variable names
 * - Heavy comments explaining setup steps for beginners
 */

// Wait until the DOM content is completely loaded before starting the game
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded. Initializing CampCoder...");

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

    // 5. Bind User Interface Buttons with Explicit Event Listeners
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

    // 6. Boot up Level 1 (Index 0)
    gameOrchestrator.loadLevel(0);

    console.log("CampCoder initialized successfully with 40 levels across 4 eras!");
});