/**
 * ============================================================================
 * WORKSPACE & DRAG-AND-DROP CONTROLLER (Workspace.js)
 * ============================================================================
 * The Workspace class manages the coding workspace area where users drag,
 * arrange, and configure programming blocks.
 * 
 * Key Features:
 * - Supports simple blocks (Move, Turn, Pickup)
 * - Supports nested control blocks (Loop, If Condition)
 * - Full JSON serialization and deserialization for cloud/local saving
 * - Real-time block count calculation for Gauntlet levels
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators (full if/else blocks only)
 * - Always use braces
 * - Descriptive variable names
 * - Heavy comments for beginners
 */
class Workspace {
    /**
     * Initializes the workspace manager.
     * 
     * @param {string} workspaceElementId The ID of the main workspace container.
     * @param {number} totalLevelsCount Total number of levels (40).
     */
    constructor(workspaceElementId, totalLevelsCount) {
        this.workspaceContainerElement = document.getElementById(workspaceElementId);
        this.totalLevelsCount = totalLevelsCount;

        // Stores the serialized JSON string of blocks for each level index
        this.savedLevelCodeMap = {};

        // Reference to the block counter UI element
        this.blockCounterElement = document.getElementById("block-counter-panel");

        // Maximum blocks allowed for the current level (null if no limit)
        this.currentLevelMaxBlocks = null;

        // Optional callback to notify Game when code changes
        this.onCodeChangeCallback = null;

        // Initialize drag-and-drop on the left palette blocks
        this.bindPaletteBlockEvents();

        // Make the main workspace container accept dropped blocks
        this.makeElementDroppable(this.workspaceContainerElement);
    }

    /**
     * Sets a callback function that is invoked whenever blocks are added, removed, or changed.
     * 
     * @param {Function} callback Function to call on change.
     */
    setOnCodeChangeListener(callback) {
        this.onCodeChangeCallback = callback;
    }

    /**
     * Notifies listeners that the workspace contents have changed.
     */
    notifyChange() {
        this.updateBlockCounterUI();
        if (this.onCodeChangeCallback) {
            this.onCodeChangeCallback();
        }
    }

    /**
     * Sets the maximum allowed block count for the active level.
     * 
     * @param {number|null} maxBlocks Allowed block count, or null for no limit.
     */
    setMaxBlocks(maxBlocks) {
        this.currentLevelMaxBlocks = maxBlocks;
        this.updateBlockCounterUI();
    }

    /**
     * Clears all blocks from the workspace DOM.
     */
    clear() {
        if (this.workspaceContainerElement) {
            this.workspaceContainerElement.innerHTML = "";
        }
        this.notifyChange();
    }

    /**
     * Saves the current workspace code for a specific level as a JSON string.
     * 
     * @param {number} levelIndex The level index being saved.
     * @returns {string} The serialized JSON string.
     */
    saveState(levelIndex) {
        const serializedBlocks = this.serializeBlocks(this.workspaceContainerElement);
        const jsonString = JSON.stringify(serializedBlocks);
        this.savedLevelCodeMap[levelIndex.toString()] = jsonString;
        return jsonString;
    }

    /**
     * Restores the workspace code for a level from the internal saved map.
     * 
     * @param {number} levelIndex The level index to load.
     */
    loadState(levelIndex) {
        this.clear();

        const levelKey = levelIndex.toString();
        const savedJson = this.savedLevelCodeMap[levelKey];

        if (savedJson) {
            try {
                const parsedBlocks = JSON.parse(savedJson);
                this.deserializeBlocks(parsedBlocks, this.workspaceContainerElement);
            } catch (jsonParseError) {
                console.error("Failed to parse saved code for level " + levelIndex, jsonParseError);
            }
        }

        this.notifyChange();
    }

    /**
     * Bulk loads an entire map of level codes (e.g. fetched from Firestore).
     * 
     * @param {Object} codeMap An object with keys as level indices and values as JSON strings.
     */
    loadCodeMap(codeMap) {
        if (!codeMap) {
            return;
        }

        for (const levelIndexString in codeMap) {
            if (Object.prototype.hasOwnProperty.call(codeMap, levelIndexString)) {
                this.savedLevelCodeMap[levelIndexString] = codeMap[levelIndexString];
            }
        }
    }

    /**
     * Serializes all block DOM elements in a container into a clean JavaScript array.
     * Recursively serializes any nested workspace children (inside loops or conditionals).
     * 
     * @param {HTMLElement} containerElement The container to read blocks from.
     * @returns {Array} An array of block data objects.
     */
    serializeBlocks(containerElement) {
        const blocksList = [];

        if (!containerElement) {
            return blocksList;
        }

        const childNodes = containerElement.children;

        for (let i = 0; i < childNodes.length; i = i + 1) {
            const currentElement = childNodes[i];

            // Only inspect elements with the workspace-block class
            if (currentElement.classList.contains("workspace-block")) {
                const command = currentElement.dataset.cmd;
                const blockType = currentElement.dataset.type;

                const blockData = {
                    command: command,
                    type: blockType,
                    displayText: "",
                    loopCount: null,
                    condition: null,
                    children: []
                };

                // Read custom values depending on the command
                if (command === "loop") {
                    const loopInput = currentElement.querySelector(".loop-count");
                    let parsedCount = 2;
                    if (loopInput) {
                        parsedCount = parseInt(loopInput.value, 10);
                        if (isNaN(parsedCount) || parsedCount < 1) {
                            parsedCount = 1;
                        }
                    }
                    blockData.loopCount = parsedCount;

                    // Serialize nested blocks inside the loop body
                    const nestedZone = currentElement.querySelector(".nested-workspace");
                    if (nestedZone) {
                        blockData.children = this.serializeBlocks(nestedZone);
                    }
                } else if (command === "if") {
                    const conditionSelect = currentElement.querySelector(".if-condition");
                    let selectedCondition = "pathAhead";
                    if (conditionSelect) {
                        selectedCondition = conditionSelect.value;
                    }
                    blockData.condition = selectedCondition;

                    // Serialize nested blocks inside the if body
                    const nestedZone = currentElement.querySelector(".nested-workspace");
                    if (nestedZone) {
                        blockData.children = this.serializeBlocks(nestedZone);
                    }
                } else {
                    // For standard blocks, grab their label text
                    const labelSpan = currentElement.querySelector(".block-label");
                    if (labelSpan) {
                        blockData.displayText = labelSpan.innerText;
                    } else {
                        blockData.displayText = currentElement.innerText;
                    }
                }

                blocksList.push(blockData);
            }
        }

        return blocksList;
    }

    /**
     * Recreates HTML DOM blocks from an array of serialized block data objects.
     * 
     * @param {Array} blocksArray The array of block data objects.
     * @param {HTMLElement} targetContainer The container to append the created blocks into.
     */
    deserializeBlocks(blocksArray, targetContainer) {
        if (!blocksArray) {
            return;
        }

        if (!targetContainer) {
            return;
        }

        for (let i = 0; i < blocksArray.length; i = i + 1) {
            const blockData = blocksArray[i];

            const createdBlockElement = this.createBlock(
                blockData.command,
                blockData.type,
                blockData.displayText,
                blockData
            );

            // If this block has children (like inside a loop or if statement), deserialize them too
            if (blockData.children && blockData.children.length > 0) {
                const nestedZone = createdBlockElement.querySelector(".nested-workspace");
                if (nestedZone) {
                    this.deserializeBlocks(blockData.children, nestedZone);
                }
            }

            targetContainer.appendChild(createdBlockElement);
        }
    }

    /**
     * Sets up dragstart event listeners on all palette blocks in the left panel.
     */
    bindPaletteBlockEvents() {
        const paletteBlocks = document.querySelectorAll(".palette .block");

        for (let i = 0; i < paletteBlocks.length; i = i + 1) {
            const paletteBlock = paletteBlocks[i];

            paletteBlock.addEventListener("dragstart", (dragEvent) => {
                const command = paletteBlock.dataset.cmd;
                const blockType = paletteBlock.dataset.type;
                const labelText = paletteBlock.innerText;

                dragEvent.dataTransfer.setData("cmd", command);
                dragEvent.dataTransfer.setData("type", blockType);
                dragEvent.dataTransfer.setData("text", labelText);
            });
        }
    }

    /**
     * Makes an HTML element accept dragged blocks.
     * 
     * @param {HTMLElement} dropZoneElement The element to turn into a drop target.
     */
    makeElementDroppable(dropZoneElement) {
        if (!dropZoneElement) {
            return;
        }

        dropZoneElement.addEventListener("dragover", (dragOverEvent) => {
            dragOverEvent.preventDefault();
            dragOverEvent.stopPropagation();
            dropZoneElement.classList.add("drop-target-hover");
        });

        dropZoneElement.addEventListener("dragleave", (dragLeaveEvent) => {
            dragLeaveEvent.stopPropagation();
            dropZoneElement.classList.remove("drop-target-hover");
        });

        dropZoneElement.addEventListener("drop", (dropEvent) => {
            dropEvent.preventDefault();
            dropEvent.stopPropagation();
            dropZoneElement.classList.remove("drop-target-hover");

            const command = dropEvent.dataTransfer.getData("cmd");
            const blockType = dropEvent.dataTransfer.getData("type");
            const labelText = dropEvent.dataTransfer.getData("text");

            if (!command) {
                return;
            }

            const newBlockElement = this.createBlock(command, blockType, labelText, null);
            dropZoneElement.appendChild(newBlockElement);

            this.notifyChange();
        });
    }

    /**
     * Creates a workspace block DOM element with delete button, headers, and drop zones.
     * 
     * @param {string} command The command name (forward, backward, right, left, pickup, loop, if).
     * @param {string} blockType The block category type (move, turn, action, control).
     * @param {string} defaultText Default display text on the block.
     * @param {Object|null} existingData Optional saved data for restoring state.
     * @returns {HTMLElement} The created DOM element.
     */
    createBlock(command, blockType, defaultText, existingData) {
        const blockElement = document.createElement("div");
        blockElement.className = "block workspace-block";
        blockElement.dataset.cmd = command;

        if (blockType) {
            blockElement.dataset.type = blockType;
        }

        // Create the delete (X) button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.innerText = "✕";
        deleteButton.type = "button";
        deleteButton.title = "Delete block";
        deleteButton.addEventListener("click", () => {
            blockElement.remove();
            this.notifyChange();
        });

        if (command === "loop") {
            // LOOP BLOCK STRUCTURE
            let initialCount = 2;
            if (existingData && typeof existingData.loopCount === "number") {
                initialCount = existingData.loopCount;
            }

            const loopHeader = document.createElement("div");
            loopHeader.className = "loop-header";

            const loopLabel = document.createElement("span");
            loopLabel.innerText = "Loop ";

            const countInput = document.createElement("input");
            countInput.type = "number";
            countInput.className = "loop-count";
            countInput.value = initialCount.toString();
            countInput.min = "1";
            countInput.max = "99";
            countInput.addEventListener("change", () => {
                this.notifyChange();
            });

            const timesLabel = document.createElement("span");
            timesLabel.innerText = " times:";

            loopHeader.appendChild(loopLabel);
            loopHeader.appendChild(countInput);
            loopHeader.appendChild(timesLabel);

            const nestedDropZone = document.createElement("div");
            nestedDropZone.className = "nested-workspace drop-zone";
            this.makeElementDroppable(nestedDropZone);

            blockElement.appendChild(loopHeader);
            blockElement.appendChild(nestedDropZone);
        } else if (command === "if") {
            // IF BLOCK STRUCTURE
            let initialCondition = "pathAhead";
            if (existingData && existingData.condition) {
                initialCondition = existingData.condition;
            }

            const ifHeader = document.createElement("div");
            ifHeader.className = "if-header";

            const ifLabel = document.createElement("span");
            ifLabel.innerText = "If ";

            const conditionDropdown = document.createElement("select");
            conditionDropdown.className = "if-condition";

            // Build options for conditions
            const conditionOptions = [
                { value: "pathAhead", label: "Path Ahead" },
                { value: "wallAhead", label: "Wall Ahead" },
                { value: "itemPresent", label: "Item Here" },
                { value: "onIce", label: "On Ice" }
            ];

            for (let i = 0; i < conditionOptions.length; i = i + 1) {
                const optionData = conditionOptions[i];
                const optionElement = document.createElement("option");
                optionElement.value = optionData.value;
                optionElement.innerText = optionData.label;

                if (optionData.value === initialCondition) {
                    optionElement.selected = true;
                }

                conditionDropdown.appendChild(optionElement);
            }

            conditionDropdown.addEventListener("change", () => {
                this.notifyChange();
            });

            const doLabel = document.createElement("span");
            doLabel.innerText = " do:";

            ifHeader.appendChild(ifLabel);
            ifHeader.appendChild(conditionDropdown);
            ifHeader.appendChild(doLabel);

            const nestedDropZone = document.createElement("div");
            nestedDropZone.className = "nested-workspace drop-zone";
            this.makeElementDroppable(nestedDropZone);

            blockElement.appendChild(ifHeader);
            blockElement.appendChild(nestedDropZone);
        } else {
            // STANDARD MOVEMENT / ACTION BLOCKS
            const labelSpan = document.createElement("span");
            labelSpan.className = "block-label";

            let textToShow = defaultText;
            if (!textToShow) {
                if (command === "forward") {
                    textToShow = "Move Forward";
                } else if (command === "backward") {
                    textToShow = "Move Backward";
                } else if (command === "right") {
                    textToShow = "Turn Right";
                } else if (command === "left") {
                    textToShow = "Turn Left";
                } else if (command === "pickup") {
                    textToShow = "Pickup Item";
                } else {
                    textToShow = command;
                }
            }
            labelSpan.innerText = textToShow;

            blockElement.appendChild(labelSpan);
        }

        blockElement.appendChild(deleteButton);
        return blockElement;
    }

    /**
     * Calculates the total number of blocks in the workspace, including nested blocks.
     * 
     * @returns {number} The total block count.
     */
    getTotalBlockCount() {
        if (!this.workspaceContainerElement) {
            return 0;
        }

        const allBlocks = this.workspaceContainerElement.querySelectorAll(".workspace-block");
        return allBlocks.length;
    }

    /**
     * Updates the block counter UI panel to show current blocks vs limit.
     */
    updateBlockCounterUI() {
        if (!this.blockCounterElement) {
            return;
        }

        const totalBlocksUsed = this.getTotalBlockCount();

        if (this.currentLevelMaxBlocks !== null && typeof this.currentLevelMaxBlocks === "number") {
            this.blockCounterElement.innerText = "Blocks: " + totalBlocksUsed + " / " + this.currentLevelMaxBlocks;

            if (totalBlocksUsed > this.currentLevelMaxBlocks) {
                this.blockCounterElement.className = "block-counter-badge counter-warning";
            } else {
                this.blockCounterElement.className = "block-counter-badge counter-valid";
            }
        } else {
            this.blockCounterElement.innerText = "Blocks Used: " + totalBlocksUsed;
            this.blockCounterElement.className = "block-counter-badge counter-normal";
        }
    }
}