/**
 * ============================================================================
 * INVENTORY & COLLECTIBLES CONTROLLER (Inventory.js)
 * ============================================================================
 * The Inventory class manages collectible items on the grid, handles pickup
 * detection when the player executes the "pickup" command, and updates the UI
 * to show collected versus remaining items.
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators (full if/else blocks only)
 * - Always use braces
 * - Descriptive variable names
 * - Heavy comments for beginners
 */
class Inventory {
    /**
     * Initializes the inventory manager.
     * 
     * @param {string} panelElementId The ID of the inventory display panel.
     * @param {HTMLElement} stageElement The grid stage container element.
     * @param {number} gridTileSize The size in pixels of each tile (40px).
     */
    constructor(panelElementId, stageElement, gridTileSize) {
        this.inventoryPanelElement = document.getElementById(panelElementId);
        this.stageContainerElement = stageElement;
        this.gridTileSize = gridTileSize;

        // An array of item objects currently active on the level
        this.activeItemsList = [];

        // Counter for how many items the player has picked up
        this.totalCollectedCount = 0;
    }

    /**
     * Creates and places collectible items on the stage for a new level.
     * 
     * @param {Array} itemsDataArray An array of coordinate objects, e.g. [{ x: 3, y: 4 }]
     */
    setupLevel(itemsDataArray) {
        // Clear out any previous items
        this.activeItemsList = [];
        this.totalCollectedCount = 0;

        // If the level has no items, update the UI and exit early
        if (!itemsDataArray) {
            this.updateUI();
            return;
        }

        if (itemsDataArray.length === 0) {
            this.updateUI();
            return;
        }

        // Loop through each item position and create a DOM element
        for (let i = 0; i < itemsDataArray.length; i = i + 1) {
            const itemData = itemsDataArray[i];

            // Build the visual element for the collectible gem
            const itemElement = document.createElement("div");
            itemElement.className = "grid-entity item";
            itemElement.id = "collectible-item-" + i;

            const pixelLeft = itemData.x * this.gridTileSize;
            const pixelTop = itemData.y * this.gridTileSize;
            itemElement.style.left = pixelLeft + "px";
            itemElement.style.top = pixelTop + "px";

            // Add the item to the stage
            this.stageContainerElement.appendChild(itemElement);

            // Keep track of the item in our internal list
            const itemRecord = {
                positionX: itemData.x,
                positionY: itemData.y,
                isCollected: false,
                domElement: itemElement
            };

            this.activeItemsList.push(itemRecord);
        }

        this.updateUI();
    }

    /**
     * Resets all items to an uncollected state and makes them visible again.
     * Called whenever the player clicks "Reset" or re-runs a program.
     */
    resetLevel() {
        this.totalCollectedCount = 0;

        for (let i = 0; i < this.activeItemsList.length; i = i + 1) {
            const itemRecord = this.activeItemsList[i];
            itemRecord.isCollected = false;

            if (itemRecord.domElement) {
                itemRecord.domElement.style.display = "block";
            }
        }

        this.updateUI();
    }

    /**
     * Checks if the player is standing directly on an uncollected item.
     * If so, marks it collected and hides the visual element.
     * 
     * @param {number} playerCoordinateX The player's current X coordinate.
     * @param {number} playerCoordinateY The player's current Y coordinate.
     * @returns {boolean} True if an item was successfully picked up, false otherwise.
     */
    tryPickup(playerCoordinateX, playerCoordinateY) {
        let didPickupItem = false;

        for (let i = 0; i < this.activeItemsList.length; i = i + 1) {
            const itemRecord = this.activeItemsList[i];

            // Check if the item is still on the ground and matches the player's position
            if (!itemRecord.isCollected) {
                if (itemRecord.positionX === playerCoordinateX) {
                    if (itemRecord.positionY === playerCoordinateY) {
                        itemRecord.isCollected = true;
                        this.totalCollectedCount = this.totalCollectedCount + 1;

                        if (itemRecord.domElement) {
                            itemRecord.domElement.style.display = "none";
                        }

                        didPickupItem = true;
                    }
                }
            }
        }

        if (didPickupItem) {
            this.updateUI();
        }

        return didPickupItem;
    }

    /**
     * Checks if an uncollected item exists at the specified coordinate.
     * Used by the "If [item here]" conditional block.
     * 
     * @param {number} targetX The grid X position to check.
     * @param {number} targetY The grid Y position to check.
     * @returns {boolean} True if an uncollected item is located there.
     */
    hasItemAt(targetX, targetY) {
        for (let i = 0; i < this.activeItemsList.length; i = i + 1) {
            const itemRecord = this.activeItemsList[i];
            if (!itemRecord.isCollected) {
                if (itemRecord.positionX === targetX) {
                    if (itemRecord.positionY === targetY) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Updates the text and color of the inventory panel.
     */
    updateUI() {
        if (!this.inventoryPanelElement) {
            return;
        }

        const totalItemsCount = this.activeItemsList.length;
        this.inventoryPanelElement.innerText = "Items: " + this.totalCollectedCount + " / " + totalItemsCount;

        // If all items are collected, turn the text green; otherwise keep it bright pink
        if (this.totalCollectedCount === totalItemsCount) {
            this.inventoryPanelElement.style.color = "#4CAF50";
        } else {
            this.inventoryPanelElement.style.color = "#E91E63";
        }
    }

    /**
     * Checks whether the player has gathered every required item on the map.
     * 
     * @returns {boolean} True if all items have been collected, false otherwise.
     */
    hasCollectedAll() {
        if (this.totalCollectedCount === this.activeItemsList.length) {
            return true;
        } else {
            return false;
        }
    }
}