/**
 * ============================================================================
 * GAME ENGINE ORCHESTRATOR (Game.js)
 * ============================================================================
 * The Game class is the central coordinator for CampCoder.
 * 
 * Responsibilities:
 * - Level loading, stage rendering, and clean teardown
 * - Collision detection against walls, closed doors, and grid boundaries
 * - Dynamic mechanics: Switch & Door activation, Ice tile continuous sliding
 * - Conditional logic evaluation for "If" blocks (pathAhead, wallAhead, itemPresent, onIce)
 * - Gauntlet block limit enforcement (maxBlocks)
 * - Step-by-step block execution loop with visual execution highlighting
 * - Progress saving to Firebase Firestore / LocalStorage
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators (full if/else blocks only)
 * - Always use braces
 * - Descriptive variable names (no single letters except i, j)
 * - Heavy comments explaining every logic block for beginners
 */
class Game {
    /**
     * Initializes the game orchestrator with all necessary sub-systems.
     * 
     * @param {Player} playerInstance The player controller.
     * @param {Inventory} inventoryInstance The inventory/collectibles controller.
     * @param {Workspace} workspaceInstance The workspace block controller.
     * @param {Array} levelsDataArray The master database of 40 levels.
     * @param {AuthManager} authManagerInstance The Firebase Auth & Database manager.
     */
    constructor(playerInstance, inventoryInstance, workspaceInstance, levelsDataArray, authManagerInstance) {
        this.player = playerInstance;
        this.inventory = inventoryInstance;
        this.workspace = workspaceInstance;
        this.levels = levelsDataArray;
        this.auth = authManagerInstance;

        // Stage and control DOM elements
        this.stageContainerElement = document.getElementById("stage");
        this.runButtonElement = document.getElementById("run-btn");
        this.resetButtonElement = document.getElementById("reset-btn");
        this.clearButtonElement = document.getElementById("clear-btn");
        this.levelSelectElement = document.getElementById("level-select");
        this.eraBadgeElement = document.getElementById("era-badge");
        this.levelInstructionsElement = document.getElementById("level-instructions");

        // Game state variables
        this.currentLevelIndex = 0;
        this.highestLevelCleared = 0;
        this.isProgramRunning = false;
        this.isEngineInitialized = false;

        // Dynamic entities active in the current level
        this.activeSwitches = [];
        this.activeDoors = [];

        // Grid tile dimensions (40px)
        this.gridTileSize = 40;

        // Delay in milliseconds between block execution steps
        this.stepExecutionDelayMs = 350;

        // Delay in milliseconds for ice sliding steps
        this.iceSlideStepDelayMs = 180;

        // Connect workspace code changes to auto-save
        this.workspace.setOnCodeChangeListener(() => {
            this.handleWorkspaceCodeChange();
        });

        // Initialize the level select dropdown
        this.setupLevelSelect();
    }

    /**
     * Sets the highest level cleared by the user (from Firestore or LocalStorage)
     * and refreshes the unlocked level options.
     * 
     * @param {number} levelCount Highest level cleared index.
     */
    setHighestLevelCleared(levelCount) {
        if (typeof levelCount === "number" && levelCount > this.highestLevelCleared) {
            this.highestLevelCleared = levelCount;
        }
        this.updateLevelSelectOptions();
    }

    /**
     * Restores an entire map of saved level workspace codes into the workspace
     * and reloads the current level's code.
     * 
     * @param {Object} codeMap Object with level index keys and JSON string values.
     */
    restoreWorkspaceCodeMap(codeMap) {
        this.workspace.loadCodeMap(codeMap);
        this.workspace.loadState(this.currentLevelIndex);
    }

    /**
     * Auto-saves the current workspace blocks whenever the user modifies code.
     */
    handleWorkspaceCodeChange() {
        if (!this.isEngineInitialized) {
            return;
        }

        const serializedJsonString = this.workspace.saveState(this.currentLevelIndex);
        if (this.auth) {
            // isImmediate = false ensures editing changes are debounced to protect free quotas
            this.auth.saveUserProgress(
                this.currentLevelIndex,
                this.highestLevelCleared,
                serializedJsonString,
                false
            );
        }
    }

    /**
     * Populates the level select dropdown menu with all 40 levels.
     */
    setupLevelSelect() {
        if (!this.levelSelectElement) {
            return;
        }

        this.levelSelectElement.innerHTML = "";

        for (let i = 0; i < this.levels.length; i = i + 1) {
            const levelData = this.levels[i];
            const optionElement = document.createElement("option");
            optionElement.value = i.toString();

            const levelNumber = i + 1;
            optionElement.innerText = "Level " + levelNumber + ": " + levelData.name;

            // Levels beyond highestLevelCleared are initially locked
            if (i > this.highestLevelCleared) {
                optionElement.disabled = true;
                optionElement.innerText = "🔒 Level " + levelNumber + ": " + levelData.name;
            }

            this.levelSelectElement.appendChild(optionElement);
        }

        this.levelSelectElement.addEventListener("change", (changeEvent) => {
            const chosenIndex = parseInt(changeEvent.target.value, 10);
            this.loadLevel(chosenIndex);
        });
    }

    /**
     * Updates the disabled state and lock icons of the level select dropdown.
     */
    updateLevelSelectOptions() {
        if (!this.levelSelectElement) {
            return;
        }

        const optionElements = this.levelSelectElement.options;

        for (let i = 0; i < optionElements.length; i = i + 1) {
            const option = optionElements[i];
            const levelIndex = parseInt(option.value, 10);
            const levelNumber = levelIndex + 1;
            const levelData = this.levels[levelIndex];

            if (levelIndex <= this.highestLevelCleared) {
                option.disabled = false;
                option.innerText = "Level " + levelNumber + ": " + levelData.name;
            } else {
                option.disabled = true;
                option.innerText = "🔒 Level " + levelNumber + ": " + levelData.name;
            }
        }
    }

    /**
     * Loads a level by index, sets up grid entities, and restores workspace code.
     * 
     * @param {number} levelIndex The 0-based index of the level (0 to 39).
     */
    loadLevel(levelIndex) {
        // Save current level code before leaving it
        if (this.isEngineInitialized) {
            const savedCodeJson = this.workspace.saveState(this.currentLevelIndex);
            if (this.auth) {
                this.auth.saveUserProgress(
                    this.currentLevelIndex,
                    this.highestLevelCleared,
                    savedCodeJson,
                    true
                );
            }
        }

        this.currentLevelIndex = levelIndex;
        const currentLevelData = this.levels[levelIndex];

        if (this.levelSelectElement) {
            this.levelSelectElement.value = levelIndex.toString();
        }

        // Clean up previous stage DOM entities
        this.clearStageEntities();

        // Setup Player
        this.player.setup(currentLevelData.start);

        // Setup Inventory Collectibles
        this.inventory.setupLevel(currentLevelData.items);

        // Render Objective Goal
        this.renderObjective(currentLevelData.objective);

        // Render Walls
        this.renderWalls(currentLevelData.walls);

        // Render Ice Tiles
        this.renderIceTiles(currentLevelData.ice);

        // Render Switches and Doors
        this.renderSwitchesAndDoors(currentLevelData.switches, currentLevelData.doors);

        // Update Header and Instructions UI
        if (this.eraBadgeElement) {
            this.eraBadgeElement.innerText = currentLevelData.era;
        }

        if (this.levelInstructionsElement) {
            this.levelInstructionsElement.innerText = currentLevelData.instructions;
        }

        // Apply Gauntlet block limit if applicable
        this.workspace.setMaxBlocks(currentLevelData.maxBlocks);

        // Load saved workspace code for this level
        this.workspace.loadState(levelIndex);

        this.isEngineInitialized = true;
    }

    /**
     * Removes all dynamic and static grid elements from the stage except the player.
     */
    clearStageEntities() {
        const entityElements = this.stageContainerElement.querySelectorAll(
            ".wall, .objective, .item, .switch-tile, .door-tile, .ice-tile"
        );

        for (let i = 0; i < entityElements.length; i = i + 1) {
            entityElements[i].remove();
        }

        this.activeSwitches = [];
        this.activeDoors = [];
    }

    /**
     * Renders the glowing gold objective tile.
     * 
     * @param {Object} objectiveCoordinate Object with x and y.
     */
    renderObjective(objectiveCoordinate) {
        if (!objectiveCoordinate) {
            return;
        }

        const objectiveElement = document.createElement("div");
        objectiveElement.className = "grid-entity objective";
        objectiveElement.style.left = (objectiveCoordinate.x * this.gridTileSize) + "px";
        objectiveElement.style.top = (objectiveCoordinate.y * this.gridTileSize) + "px";
        this.stageContainerElement.appendChild(objectiveElement);
    }

    /**
     * Renders all wall obstacle tiles for the level.
     * 
     * @param {Array} wallsList Array of { x, y } coordinates.
     */
    renderWalls(wallsList) {
        if (!wallsList) {
            return;
        }

        for (let i = 0; i < wallsList.length; i = i + 1) {
            const wallCoordinate = wallsList[i];
            const wallElement = document.createElement("div");
            wallElement.className = "grid-entity wall";
            wallElement.style.left = (wallCoordinate.x * this.gridTileSize) + "px";
            wallElement.style.top = (wallCoordinate.y * this.gridTileSize) + "px";
            this.stageContainerElement.appendChild(wallElement);
        }
    }

    /**
     * Renders slippery ice tiles for Era 3 and Era 4 levels.
     * 
     * @param {Array} iceList Array of { x, y } coordinates.
     */
    renderIceTiles(iceList) {
        if (!iceList) {
            return;
        }

        for (let i = 0; i < iceList.length; i = i + 1) {
            const iceCoordinate = iceList[i];
            const iceElement = document.createElement("div");
            iceElement.className = "grid-entity ice-tile";
            iceElement.style.left = (iceCoordinate.x * this.gridTileSize) + "px";
            iceElement.style.top = (iceCoordinate.y * this.gridTileSize) + "px";
            this.stageContainerElement.appendChild(iceElement);
        }
    }

    /**
     * Renders interactive switches and locked doors.
     * 
     * @param {Array} switchesList Array of switch definitions.
     * @param {Array} doorsList Array of door definitions.
     */
    renderSwitchesAndDoors(switchesList, doorsList) {
        this.activeSwitches = [];
        this.activeDoors = [];

        // 1. Render Doors
        if (doorsList) {
            for (let i = 0; i < doorsList.length; i = i + 1) {
                const doorData = doorsList[i];
                const doorElement = document.createElement("div");
                doorElement.className = "grid-entity door-tile";
                doorElement.id = doorData.id;
                doorElement.style.left = (doorData.x * this.gridTileSize) + "px";
                doorElement.style.top = (doorData.y * this.gridTileSize) + "px";

                this.stageContainerElement.appendChild(doorElement);

                this.activeDoors.push({
                    id: doorData.id,
                    x: doorData.x,
                    y: doorData.y,
                    isOpen: false,
                    domElement: doorElement
                });
            }
        }

        // 2. Render Switches
        if (switchesList) {
            for (let i = 0; i < switchesList.length; i = i + 1) {
                const switchData = switchesList[i];
                const switchElement = document.createElement("div");
                switchElement.className = "grid-entity switch-tile";
                switchElement.id = switchData.id;
                switchElement.style.left = (switchData.x * this.gridTileSize) + "px";
                switchElement.style.top = (switchData.y * this.gridTileSize) + "px";

                this.stageContainerElement.appendChild(switchElement);

                this.activeSwitches.push({
                    id: switchData.id,
                    x: switchData.x,
                    y: switchData.y,
                    doorId: switchData.doorId,
                    isActive: false,
                    domElement: switchElement
                });
            }
        }
    }

    /**
     * Resets the stage back to the level's starting state.
     */
    reset() {
        this.isProgramRunning = false;

        const currentLevelData = this.levels[this.currentLevelIndex];

        // Reset player coordinates
        this.player.setup(currentLevelData.start);

        // Reset inventory items
        this.inventory.resetLevel();

        // Reset doors to closed
        for (let i = 0; i < this.activeDoors.length; i = i + 1) {
            const doorRecord = this.activeDoors[i];
            doorRecord.isOpen = false;
            if (doorRecord.domElement) {
                doorRecord.domElement.classList.remove("door-open");
            }
        }

        // Reset switches to inactive
        for (let i = 0; i < this.activeSwitches.length; i = i + 1) {
            const switchRecord = this.activeSwitches[i];
            switchRecord.isActive = false;
            if (switchRecord.domElement) {
                switchRecord.domElement.classList.remove("switch-active");
            }
        }

        // Remove running highlight from workspace blocks
        const highlightedBlocks = document.querySelectorAll(".running");
        for (let i = 0; i < highlightedBlocks.length; i = i + 1) {
            highlightedBlocks[i].classList.remove("running");
        }

        // Re-enable run button
        if (this.runButtonElement) {
            this.runButtonElement.disabled = false;
        }
    }

    /**
     * Initiates execution of the workspace block program.
     */
    async startExecution() {
        const currentLevelData = this.levels[this.currentLevelIndex];

        // 1. Gauntlet check: verify block count does not exceed limit
        if (currentLevelData.maxBlocks !== null && typeof currentLevelData.maxBlocks === "number") {
            const totalBlocksUsed = this.workspace.getTotalBlockCount();
            if (totalBlocksUsed > currentLevelData.maxBlocks) {
                alert(
                    "Block Limit Exceeded!\n\nYou used " + totalBlocksUsed +
                    " blocks, but this Gauntlet puzzle requires solving in " +
                    currentLevelData.maxBlocks + " blocks or fewer.\n\nTry using a Loop or optimizing your logic!"
                );
                return;
            }
        }

        // 2. Prepare execution state
        this.isProgramRunning = true;
        if (this.runButtonElement) {
            this.runButtonElement.disabled = true;
        }

        // Reset board before running
        this.player.setup(currentLevelData.start);
        this.inventory.resetLevel();

        // Reset doors and switches
        for (let i = 0; i < this.activeDoors.length; i = i + 1) {
            this.activeDoors[i].isOpen = false;
            if (this.activeDoors[i].domElement) {
                this.activeDoors[i].domElement.classList.remove("door-open");
            }
        }
        for (let i = 0; i < this.activeSwitches.length; i = i + 1) {
            this.activeSwitches[i].isActive = false;
            if (this.activeSwitches[i].domElement) {
                this.activeSwitches[i].domElement.classList.remove("switch-active");
            }
        }

        await this.sleep(400);

        // 3. Recursively execute blocks in workspace
        await this.executeBlocks(this.workspace.workspaceContainerElement);

        // 4. Verify Win Condition
        const targetObjective = currentLevelData.objective;
        const isAtObjective = (this.player.gridPositionX === targetObjective.x) &&
                              (this.player.gridPositionY === targetObjective.y);
        const hasAllItems = this.inventory.hasCollectedAll();

        if (this.isProgramRunning && isAtObjective && hasAllItems) {
            alert("🎉 Level " + (this.currentLevelIndex + 1) + " Cleared! Excellent job!");

            // Update highest level cleared
            const nextLevelIndex = this.currentLevelIndex + 1;
            if (nextLevelIndex > this.highestLevelCleared) {
                this.highestLevelCleared = nextLevelIndex;
            }

            // Save progress
            const savedCodeJson = this.workspace.saveState(this.currentLevelIndex);
            if (this.auth) {
                this.auth.saveUserProgress(
                    this.currentLevelIndex,
                    this.highestLevelCleared,
                    savedCodeJson,
                    true
                );
            }

            // Refresh unlocked levels in dropdown
            this.updateLevelSelectOptions();

            // Load next level if available
            if (this.currentLevelIndex < this.levels.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
            }
        } else if (this.isProgramRunning) {
            if (!isAtObjective && !hasAllItems) {
                alert("Almost there! You didn't reach the golden goal, and some items are still missing.");
            } else if (!isAtObjective) {
                alert("Goal missed! Your robot didn't stop on the golden objective.");
            } else if (!hasAllItems) {
                alert("Items missing! You reached the goal, but didn't collect all the gems.");
            }
        }

        this.isProgramRunning = false;
        if (this.runButtonElement) {
            this.runButtonElement.disabled = false;
        }
    }

    /**
     * Recursively walks through DOM block elements and executes their logic.
     * 
     * @param {HTMLElement} containerElement The container whose child blocks are executed.
     */
    async executeBlocks(containerElement) {
        if (!this.isProgramRunning) {
            return;
        }

        if (!containerElement) {
            return;
        }

        const childBlocks = containerElement.children;

        for (let i = 0; i < childBlocks.length; i = i + 1) {
            if (!this.isProgramRunning) {
                break;
            }

            const currentBlock = childBlocks[i];

            if (!currentBlock.classList.contains("workspace-block")) {
                continue;
            }

            // Visually highlight active block
            currentBlock.classList.add("running");

            const command = currentBlock.dataset.cmd;

            if (command === "loop") {
                // Execute nested blocks in loop
                const countInput = currentBlock.querySelector(".loop-count");
                let loopCount = 2;
                if (countInput) {
                    loopCount = parseInt(countInput.value, 10);
                    if (isNaN(loopCount) || loopCount < 1) {
                        loopCount = 1;
                    }
                }

                const innerWorkspace = currentBlock.querySelector(".nested-workspace");

                for (let step = 0; step < loopCount; step = step + 1) {
                    if (!this.isProgramRunning) {
                        break;
                    }
                    await this.executeBlocks(innerWorkspace);
                }
            } else if (command === "if") {
                // Evaluate conditional block
                const conditionSelect = currentBlock.querySelector(".if-condition");
                let conditionName = "pathAhead";
                if (conditionSelect) {
                    conditionName = conditionSelect.value;
                }

                const isConditionMet = this.evaluateIfCondition(conditionName);

                if (isConditionMet) {
                    const innerWorkspace = currentBlock.querySelector(".nested-workspace");
                    await this.executeBlocks(innerWorkspace);
                }
            } else {
                // Execute standard movement or pickup command
                await this.processSingleCommand(command);
                await this.sleep(this.stepExecutionDelayMs);
            }

            currentBlock.classList.remove("running");
        }
    }

    /**
     * Evaluates whether a conditional check passes for an "If" block.
     * 
     * @param {string} conditionName Name of the condition (pathAhead, wallAhead, itemPresent, onIce).
     * @returns {boolean} True if condition is satisfied, false otherwise.
     */
    evaluateIfCondition(conditionName) {
        const offset = this.player.getFacingOffset();
        const aheadCoordinateX = this.player.gridPositionX + offset.deltaX;
        const aheadCoordinateY = this.player.gridPositionY + offset.deltaY;

        if (conditionName === "pathAhead") {
            // Path ahead is clear if the tile in front is inside the grid and not blocked
            if (this.isTileBlocked(aheadCoordinateX, aheadCoordinateY)) {
                return false;
            } else {
                return true;
            }
        } else if (conditionName === "wallAhead") {
            // Wall ahead is true if the tile in front is blocked or out of bounds
            if (this.isTileBlocked(aheadCoordinateX, aheadCoordinateY)) {
                return true;
            } else {
                return false;
            }
        } else if (conditionName === "itemPresent") {
            // Checks if an uncollected gem is under the player
            return this.inventory.hasItemAt(this.player.gridPositionX, this.player.gridPositionY);
        } else if (conditionName === "onIce") {
            // Checks if player is currently standing on an ice tile
            return this.isIceTileAt(this.player.gridPositionX, this.player.gridPositionY);
        }

        return false;
    }

    /**
     * Processes a single atomic command (turn, pickup, or move).
     * 
     * @param {string} command The command name.
     */
    async processSingleCommand(command) {
        if (command === "right") {
            this.player.turnRight();
            return;
        }

        if (command === "left") {
            this.player.turnLeft();
            return;
        }

        if (command === "pickup") {
            this.inventory.tryPickup(this.player.gridPositionX, this.player.gridPositionY);
            return;
        }

        // Calculate step offset based on facing angle
        const offset = this.player.getFacingOffset();
        let stepDeltaX = offset.deltaX;
        let stepDeltaY = offset.deltaY;

        if (command === "backward") {
            stepDeltaX = stepDeltaX * -1;
            stepDeltaY = stepDeltaY * -1;
        }

        const destinationX = this.player.gridPositionX + stepDeltaX;
        const destinationY = this.player.gridPositionY + stepDeltaY;

        // Collision Check: Boundaries, walls, and closed doors
        if (this.isTileBlocked(destinationX, destinationY)) {
            console.log("Movement blocked at: " + destinationX + ", " + destinationY);
            return;
        }

        // Move the player to the destination tile
        this.player.moveTo(destinationX, destinationY);

        // Check if player landed on a switch
        this.checkSwitchActivation(destinationX, destinationY);

        // Check if player landed on an ice tile
        if (this.isIceTileAt(destinationX, destinationY)) {
            await this.handleIceSliding(stepDeltaX, stepDeltaY);
        }
    }

    /**
     * Handles continuous sliding across consecutive ice tiles.
     * 
     * @param {number} slideDeltaX The horizontal sliding direction.
     * @param {number} slideDeltaY The vertical sliding direction.
     */
    async handleIceSliding(slideDeltaX, slideDeltaY) {
        // While the player is still on an ice tile, attempt to slide forward
        while (this.isProgramRunning && this.isIceTileAt(this.player.gridPositionX, this.player.gridPositionY)) {
            const nextSlideX = this.player.gridPositionX + slideDeltaX;
            const nextSlideY = this.player.gridPositionY + slideDeltaY;

            // Stop sliding if the next tile is a wall, closed door, or boundary
            if (this.isTileBlocked(nextSlideX, nextSlideY)) {
                break;
            }

            await this.sleep(this.iceSlideStepDelayMs);

            // Move to next tile
            this.player.moveTo(nextSlideX, nextSlideY);

            // Check if sliding triggered a switch mid-slide
            this.checkSwitchActivation(nextSlideX, nextSlideY);

            // If the new tile is normal ground (not ice), sliding ends naturally
            if (!this.isIceTileAt(nextSlideX, nextSlideY)) {
                break;
            }
        }
    }

    /**
     * Checks if coordinates fall on an active switch and triggers the linked door to open.
     * 
     * @param {number} coordinateX Grid X position.
     * @param {number} coordinateY Grid Y position.
     */
    checkSwitchActivation(coordinateX, coordinateY) {
        for (let i = 0; i < this.activeSwitches.length; i = i + 1) {
            const switchRecord = this.activeSwitches[i];

            if (switchRecord.x === coordinateX && switchRecord.y === coordinateY) {
                if (!switchRecord.isActive) {
                    switchRecord.isActive = true;

                    if (switchRecord.domElement) {
                        switchRecord.domElement.classList.add("switch-active");
                    }

                    this.openDoorById(switchRecord.doorId);
                    console.log("Switch activated! Door " + switchRecord.doorId + " opened.");
                }
            }
        }
    }

    /**
     * Opens a specific door by its ID, changing its visual appearance and removing collision.
     * 
     * @param {string} doorId The ID of the door to open.
     */
    openDoorById(doorId) {
        for (let i = 0; i < this.activeDoors.length; i = i + 1) {
            const doorRecord = this.activeDoors[i];
            if (doorRecord.id === doorId) {
                doorRecord.isOpen = true;
                if (doorRecord.domElement) {
                    doorRecord.domElement.classList.add("door-open");
                }
            }
        }
    }

    /**
     * Checks if a tile coordinate is blocked by grid bounds, walls, or closed doors.
     * 
     * @param {number} targetX Horizontal column.
     * @param {number} targetY Vertical row.
     * @returns {boolean} True if blocked, false if clear.
     */
    isTileBlocked(targetX, targetY) {
        // 1. Boundary check (0 to 9)
        if (targetX < 0 || targetX > 9 || targetY < 0 || targetY > 9) {
            return true;
        }

        // 2. Wall check
        const currentLevelData = this.levels[this.currentLevelIndex];
        const wallList = currentLevelData.walls;
        if (wallList) {
            for (let i = 0; i < wallList.length; i = i + 1) {
                if (wallList[i].x === targetX && wallList[i].y === targetY) {
                    return true;
                }
            }
        }

        // 3. Closed door check
        for (let i = 0; i < this.activeDoors.length; i = i + 1) {
            const doorRecord = this.activeDoors[i];
            if (doorRecord.x === targetX && doorRecord.y === targetY) {
                if (!doorRecord.isOpen) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks whether a coordinate has an ice tile.
     * 
     * @param {number} coordinateX Horizontal column.
     * @param {number} coordinateY Vertical row.
     * @returns {boolean} True if the tile is ice, false otherwise.
     */
    isIceTileAt(coordinateX, coordinateY) {
        const currentLevelData = this.levels[this.currentLevelIndex];
        const iceList = currentLevelData.ice;

        if (!iceList) {
            return false;
        }

        for (let i = 0; i < iceList.length; i = i + 1) {
            if (iceList[i].x === coordinateX && iceList[i].y === coordinateY) {
                return true;
            }
        }

        return false;
    }

    /**
     * Pauses asynchronous execution for a given duration in milliseconds.
     * 
     * @param {number} milliseconds Time to sleep.
     * @returns {Promise} Resolves when timer completes.
     */
    sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }
}