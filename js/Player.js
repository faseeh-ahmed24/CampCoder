/**
 * ============================================================================
 * PLAYER CONTROLLER (Player.js)
 * ============================================================================
 * The Player class manages the visual DOM element, the position on the 10x10
 * grid, and the facing orientation angle of the player character.
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators
 * - Always use braces
 * - Descriptive variable names
 * - Heavy comments for beginners
 */
class Player {
    /**
     * Initializes the player controller.
     * 
     * @param {string} elementId The HTML ID of the player element.
     * @param {number} gridTileSize The size in pixels of each tile (default 40px).
     */
    constructor(elementId, gridTileSize) {
        this.playerElement = document.getElementById(elementId);
        this.gridTileSize = gridTileSize;

        // Internal coordinate state on the 10x10 grid (0 to 9)
        this.gridPositionX = 0;
        this.gridPositionY = 0;

        // Facing direction in degrees: 0 = Up, 90 = Right, 180 = Down, 270 = Left
        this.facingAngle = 0;
    }

    /**
     * Positions the player at the starting coordinates and facing angle of a level.
     * 
     * @param {Object} startConfiguration Object containing x, y, and angle.
     */
    setup(startConfiguration) {
        this.gridPositionX = startConfiguration.x;
        this.gridPositionY = startConfiguration.y;

        // Support either 'angle' or legacy 'a' property
        if (typeof startConfiguration.angle === "number") {
            this.facingAngle = startConfiguration.angle;
        } else if (typeof startConfiguration.a === "number") {
            this.facingAngle = startConfiguration.a;
        } else {
            this.facingAngle = 0;
        }

        this.updateDOM();
    }

    /**
     * Visually moves and rotates the HTML DOM element to match current internal state.
     */
    updateDOM() {
        if (!this.playerElement) {
            return;
        }

        const pixelLeft = this.gridPositionX * this.gridTileSize;
        const pixelTop = this.gridPositionY * this.gridTileSize;

        this.playerElement.style.left = pixelLeft + "px";
        this.playerElement.style.top = pixelTop + "px";
        this.playerElement.style.transform = "rotate(" + this.facingAngle + "deg)";
    }

    /**
     * Rotates the player 90 degrees clockwise (to the right).
     */
    turnRight() {
        this.facingAngle = this.facingAngle + 90;
        this.updateDOM();
    }

    /**
     * Rotates the player 90 degrees counter-clockwise (to the left).
     */
    turnLeft() {
        this.facingAngle = this.facingAngle - 90;
        this.updateDOM();
    }

    /**
     * Moves the player directly to a target coordinate on the grid.
     * Safety and collision checks are performed by the Game class before calling this.
     * 
     * @param {number} targetX The target horizontal column.
     * @param {number} targetY The target vertical row.
     */
    moveTo(targetX, targetY) {
        this.gridPositionX = targetX;
        this.gridPositionY = targetY;
        this.updateDOM();
    }

    /**
     * Calculates the horizontal and vertical step offset based on current facing angle.
     * 
     * Angle map:
     *   0 deg = Facing UP    (deltaX = 0, deltaY = -1)
     *  90 deg = Facing RIGHT (deltaX = 1, deltaY = 0)
     * 180 deg = Facing DOWN  (deltaX = 0, deltaY = 1)
     * 270 deg = Facing LEFT  (deltaX = -1, deltaY = 0)
     * 
     * @returns {Object} An object with deltaX and deltaY properties.
     */
    getFacingOffset() {
        // Normalize angle to a positive value between 0 and 359 degrees
        let normalizedAngle = ((this.facingAngle % 360) + 360) % 360;

        let deltaX = 0;
        let deltaY = 0;

        if (normalizedAngle === 0) {
            // Facing North (Up)
            deltaX = 0;
            deltaY = -1;
        } else if (normalizedAngle === 90) {
            // Facing East (Right)
            deltaX = 1;
            deltaY = 0;
        } else if (normalizedAngle === 180) {
            // Facing South (Down)
            deltaX = 0;
            deltaY = 1;
        } else if (normalizedAngle === 270) {
            // Facing West (Left)
            deltaX = -1;
            deltaY = 0;
        }

        return {
            deltaX: deltaX,
            deltaY: deltaY
        };
    }
}