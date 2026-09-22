/**
 * ============================================================================
 * MASTER LEVEL DATABASE (LevelData.js) - Exactly 40 Dynamic Levels
 * ============================================================================
 * CampCoder is divided into 4 distinct Eras of 10 levels each:
 * 
 * Era 1 (Levels 1-10)  : Basic Movement & Loops (Walls, Turns, Objective)
 * Era 2 (Levels 11-20) : Items & Switches (Collectibles, Switches opening Doors)
 * Era 3 (Levels 21-30) : Conditionals & Ice (Slippery Ice tiles, "If" blocks)
 * Era 4 (Levels 31-40) : The Gauntlet (Block count limits, multi-mechanic puzzles)
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators
 * - Always use braces
 * - Descriptive variable names
 * - Heavy comments for beginners
 */

// Helper functions for generating wall lines without one-liners or chained methods

/**
 * Creates a horizontal line of wall coordinate objects.
 * 
 * @param {number} startX Starting horizontal column.
 * @param {number} rowY Fixed vertical row.
 * @param {number} wallLength Total number of wall segments.
 * @returns {Array} Array of { x, y } coordinate objects.
 */
function createHorizontalWall(startX, rowY, wallLength) {
    const wallCoordinatesList = [];
    for (let i = 0; i < wallLength; i = i + 1) {
        wallCoordinatesList.push({
            x: startX + i,
            y: rowY
        });
    }
    return wallCoordinatesList;
}

/**
 * Creates a vertical line of wall coordinate objects.
 * 
 * @param {number} columnX Fixed horizontal column.
 * @param {number} startY Starting vertical row.
 * @param {number} wallLength Total number of wall segments.
 * @returns {Array} Array of { x, y } coordinate objects.
 */
function createVerticalWall(columnX, startY, wallLength) {
    const wallCoordinatesList = [];
    for (let i = 0; i < wallLength; i = i + 1) {
        wallCoordinatesList.push({
            x: columnX,
            y: startY + i
        });
    }
    return wallCoordinatesList;
}

/**
 * Creates a hollow rectangular box of walls.
 * 
 * @param {number} startX Top-left column.
 * @param {number} startY Top-left row.
 * @param {number} boxWidth Total width in tiles.
 * @param {number} boxHeight Total height in tiles.
 * @returns {Array} Array of { x, y } coordinate objects.
 */
function createWallBox(startX, startY, boxWidth, boxHeight) {
    const wallCoordinatesList = [];

    // Top border
    for (let i = 0; i < boxWidth; i = i + 1) {
        wallCoordinatesList.push({ x: startX + i, y: startY });
    }

    // Bottom border
    for (let i = 0; i < boxWidth; i = i + 1) {
        wallCoordinatesList.push({ x: startX + i, y: startY + boxHeight - 1 });
    }

    // Left and right borders (excluding corners already pushed)
    for (let j = 1; j < boxHeight - 1; j = j + 1) {
        wallCoordinatesList.push({ x: startX, y: startY + j });
        wallCoordinatesList.push({ x: startX + boxWidth - 1, y: startY + j });
    }

    return wallCoordinatesList;
}

// Master array holding all 40 levels
const LEVELS_DATA = [
    // ========================================================================
    // ERA 1: BASIC MOVEMENT & LOOPS (Levels 1 to 10)
    // ========================================================================

    // Level 1
    {
        name: "First Steps",
        era: "Era 1: Basic Movement",
        instructions: "Drag 'Move Forward' blocks to reach the glowing gold objective!",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 6, y: 5 },
        walls: [],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 2
    {
        name: "Right Turn Ahead",
        era: "Era 1: Basic Movement",
        instructions: "Walk forward, turn right, and walk forward to the goal.",
        start: { x: 2, y: 7, angle: 0 },
        objective: { x: 6, y: 3 },
        walls: [
            { x: 2, y: 2 },
            { x: 3, y: 2 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 3
    {
        name: "The Winding Trail",
        era: "Era 1: Basic Movement",
        instructions: "Practice turning left and right around obstacles.",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 7, y: 2 },
        walls: [
            { x: 1, y: 5 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
            { x: 5, y: 5 },
            { x: 6, y: 5 },
            { x: 7, y: 5 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 4
    {
        name: "Around the Barrier",
        era: "Era 1: Basic Movement",
        instructions: "A tall wall blocks the direct path. Find the opening above!",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 8, y: 5 },
        walls: createVerticalWall(4, 3, 6),
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 5
    {
        name: "Reverse Gear",
        era: "Era 1: Basic Movement",
        instructions: "Try using 'Move Backward' or turn around to reach the target.",
        start: { x: 5, y: 4, angle: 90 },
        objective: { x: 1, y: 4 },
        walls: [
            { x: 6, y: 4 },
            { x: 5, y: 3 },
            { x: 5, y: 5 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 6
    {
        name: "The U-Turn Tunnel",
        era: "Era 1: Basic Movement",
        instructions: "Navigate down the tunnel, make a U-turn, and proceed up.",
        start: { x: 2, y: 2, angle: 180 },
        objective: { x: 4, y: 2 },
        walls: [
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 3, y: 4 },
            { x: 3, y: 5 },
            { x: 1, y: 6 },
            { x: 5, y: 6 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 7
    {
        name: "Intro to Loops",
        era: "Era 1: Basic Movement",
        instructions: "Walking 8 steps with individual blocks is slow. Use a 'Loop' block to repeat steps!",
        start: { x: 1, y: 4, angle: 90 },
        objective: { x: 9, y: 4 },
        walls: [],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 8
    {
        name: "The Square Patrol",
        era: "Era 1: Basic Movement",
        instructions: "Walk around the central pillar. Can you use a Loop to repeat a pattern?",
        start: { x: 2, y: 2, angle: 90 },
        objective: { x: 2, y: 3 },
        walls: createWallBox(3, 3, 4, 4),
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 9
    {
        name: "Staircase Climb",
        era: "Era 1: Basic Movement",
        instructions: "Climb the jagged staircase step by step.",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 7, y: 2 },
        walls: [
            { x: 2, y: 8 },
            { x: 2, y: 7 },
            { x: 4, y: 6 },
            { x: 4, y: 5 },
            { x: 6, y: 4 },
            { x: 6, y: 3 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 10
    {
        name: "Era 1 Finale: Maze Explorer",
        era: "Era 1: Basic Movement",
        instructions: "Use all your movement and loop skills to navigate this intricate maze!",
        start: { x: 0, y: 0, angle: 90 },
        objective: { x: 9, y: 9 },
        walls: [
            ...createVerticalWall(2, 0, 7),
            ...createVerticalWall(4, 3, 7),
            ...createVerticalWall(6, 0, 7),
            ...createVerticalWall(8, 3, 7)
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // ========================================================================
    // ERA 2: ITEMS & SWITCHES (Levels 11 to 20)
    // ========================================================================

    // Level 11
    {
        name: "The First Gem",
        era: "Era 2: Items & Switches",
        instructions: "Walk onto the pink gem and use 'Pickup Item' before heading to the goal.",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 8, y: 5 },
        walls: [],
        items: [{ x: 4, y: 5 }],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 12
    {
        name: "Two on the Way",
        era: "Era 2: Items & Switches",
        instructions: "Collect both gems! You must pick up all items to complete the level.",
        start: { x: 1, y: 2, angle: 90 },
        objective: { x: 8, y: 7 },
        walls: createHorizontalWall(2, 4, 6),
        items: [
            { x: 5, y: 2 },
            { x: 5, y: 7 }
        ],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 13
    {
        name: "Corner Sweep",
        era: "Era 2: Items & Switches",
        instructions: "Four gems sit in four corners. Gather them all!",
        start: { x: 3, y: 3, angle: 90 },
        objective: { x: 3, y: 4 },
        walls: [],
        items: [
            { x: 7, y: 3 },
            { x: 7, y: 7 },
            { x: 3, y: 7 },
            { x: 5, y: 5 }
        ],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 14
    {
        name: "The Ancient Switch",
        era: "Era 2: Items & Switches",
        instructions: "Step on the cyan Switch tile to open the steel Door wall!",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 8, y: 5 },
        walls: [
            { x: 5, y: 3 },
            { x: 5, y: 4 },
            { x: 5, y: 6 },
            { x: 5, y: 7 }
        ],
        items: [],
        switches: [
            { id: "switch-1", x: 3, y: 2, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 5, y: 5 }
        ],
        ice: [],
        maxBlocks: null
    },

    // Level 15
    {
        name: "Behind Locked Doors",
        era: "Era 2: Items & Switches",
        instructions: "Hit the switch in the upper corner, grab the gem, and exit through the opened door.",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 8, y: 1 },
        walls: createVerticalWall(4, 0, 7),
        items: [
            { x: 6, y: 1 }
        ],
        switches: [
            { id: "switch-1", x: 1, y: 1, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 4, y: 7 }
        ],
        ice: [],
        maxBlocks: null
    },

    // Level 16
    {
        name: "The Vault Room",
        era: "Era 2: Items & Switches",
        instructions: "The gems are locked inside the vault. Step on the switch to breach the door!",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 8, y: 5 },
        walls: [
            ...createWallBox(4, 3, 4, 5).filter(function(wallCoordinate) {
                // Leave opening for door at (4, 5)
                return !(wallCoordinate.x === 4 && wallCoordinate.y === 5);
            })
        ],
        items: [
            { x: 5, y: 4 },
            { x: 6, y: 6 }
        ],
        switches: [
            { id: "switch-1", x: 2, y: 2, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 4, y: 5 }
        ],
        ice: [],
        maxBlocks: null
    },

    // Level 17
    {
        name: "Double Switch Station",
        era: "Era 2: Items & Switches",
        instructions: "Two separate switches open two separate doors. Hit both switches in order!",
        start: { x: 0, y: 1, angle: 90 },
        objective: { x: 9, y: 8 },
        walls: [
            ...createVerticalWall(3, 0, 10).filter(function(wallCoordinate) {
                return wallCoordinate.y !== 5;
            }),
            ...createVerticalWall(7, 0, 10).filter(function(wallCoordinate) {
                return wallCoordinate.y !== 5;
            })
        ],
        items: [
            { x: 5, y: 1 }
        ],
        switches: [
            { id: "switch-1", x: 1, y: 8, doorId: "door-1" },
            { id: "switch-2", x: 5, y: 8, doorId: "door-2" }
        ],
        doors: [
            { id: "door-1", x: 3, y: 5 },
            { id: "door-2", x: 7, y: 5 }
        ],
        ice: [],
        maxBlocks: null
    },

    // Level 18
    {
        name: "Loop Collector",
        era: "Era 2: Items & Switches",
        instructions: "A corridor of 4 consecutive gems. Use a Loop containing 'Move Forward' and 'Pickup Item'!",
        start: { x: 1, y: 4, angle: 90 },
        objective: { x: 8, y: 4 },
        walls: [
            ...createHorizontalWall(1, 3, 8),
            ...createHorizontalWall(1, 5, 8)
        ],
        items: [
            { x: 3, y: 4 },
            { x: 4, y: 4 },
            { x: 5, y: 4 },
            { x: 6, y: 4 }
        ],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 19
    {
        name: "Switchback Trek",
        era: "Era 2: Items & Switches",
        instructions: "Weave through the corridors, activate the switch, and retrieve all items.",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 8, y: 8 },
        walls: [
            ...createHorizontalWall(1, 6, 7),
            ...createHorizontalWall(2, 3, 7)
        ],
        items: [
            { x: 7, y: 7 },
            { x: 2, y: 4 },
            { x: 7, y: 1 }
        ],
        switches: [
            { id: "switch-1", x: 1, y: 1, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 8, y: 5 }
        ],
        ice: [],
        maxBlocks: null
    },

    // Level 20
    {
        name: "Era 2 Finale: The Treasure Chamber",
        era: "Era 2: Items & Switches",
        instructions: "The ultimate switch & item puzzle! Activate both switches to open the inner sanctum.",
        start: { x: 0, y: 0, angle: 90 },
        objective: { x: 9, y: 9 },
        walls: [
            ...createWallBox(2, 2, 6, 6).filter(function(wallCoordinate) {
                return !(
                    (wallCoordinate.x === 2 && wallCoordinate.y === 4) ||
                    (wallCoordinate.x === 7 && wallCoordinate.y === 5)
                );
            })
        ],
        items: [
            { x: 4, y: 4 },
            { x: 5, y: 4 },
            { x: 4, y: 5 }
        ],
        switches: [
            { id: "switch-1", x: 0, y: 5, doorId: "door-1" },
            { id: "switch-2", x: 9, y: 2, doorId: "door-2" }
        ],
        doors: [
            { id: "door-1", x: 2, y: 4 },
            { id: "door-2", x: 7, y: 5 }
        ],
        ice: [],
        maxBlocks: null
    },

    // ========================================================================
    // ERA 3: CONDITIONALS & ICE (Levels 21 to 30)
    // ========================================================================

    // Level 21
    {
        name: "The Frozen Pond",
        era: "Era 3: Conditionals & Ice",
        instructions: "Step onto the blue Ice tiles! You will slide continuously until reaching solid ground.",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 8, y: 5 },
        walls: [],
        items: [],
        switches: [],
        doors: [],
        ice: [
            { x: 3, y: 5 },
            { x: 4, y: 5 },
            { x: 5, y: 5 },
            { x: 6, y: 5 }
        ],
        maxBlocks: null
    },

    // Level 22
    {
        name: "Ice Glider",
        era: "Era 3: Conditionals & Ice",
        instructions: "Slide across the ice until you collide with the wall stop, then turn to reach the goal.",
        start: { x: 2, y: 1, angle: 180 },
        objective: { x: 7, y: 8 },
        walls: [
            { x: 2, y: 9 },
            { x: 3, y: 9 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [
            { x: 2, y: 3 },
            { x: 2, y: 4 },
            { x: 2, y: 5 },
            { x: 2, y: 6 },
            { x: 2, y: 7 },
            { x: 2, y: 8 }
        ],
        maxBlocks: null
    },

    // Level 23
    {
        name: "Bank Shot",
        era: "Era 3: Conditionals & Ice",
        instructions: "Use walls as bumpers to halt your slide and change directions across the ice field.",
        start: { x: 1, y: 1, angle: 90 },
        objective: { x: 8, y: 8 },
        walls: [
            { x: 9, y: 1 },
            { x: 8, y: 9 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [
            ...createHorizontalWall(2, 1, 6),
            ...createVerticalWall(8, 2, 6)
        ],
        maxBlocks: null
    },

    // Level 24
    {
        name: "Intro to If: Path Ahead",
        era: "Era 3: Conditionals & Ice",
        instructions: "Use the new 'If [Path Ahead]' block inside a loop to walk safely toward the goal!",
        start: { x: 1, y: 4, angle: 90 },
        objective: { x: 8, y: 4 },
        walls: [
            { x: 9, y: 4 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 25
    {
        name: "Intro to If: Wall Ahead",
        era: "Era 3: Conditionals & Ice",
        instructions: "In a loop: Move forward, and 'If [Wall Ahead]' turn right. Watch your robot navigate corners!",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 8, y: 2 },
        walls: [
            { x: 1, y: 2 },
            { x: 8, y: 1 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 26
    {
        name: "Slippery Search",
        era: "Era 3: Conditionals & Ice",
        instructions: "Slide across the frozen pond. Use 'If [Item Here]' to pick up gems along your journey.",
        start: { x: 1, y: 2, angle: 90 },
        objective: { x: 8, y: 7 },
        walls: [
            { x: 9, y: 2 }
        ],
        items: [
            { x: 8, y: 2 },
            { x: 8, y: 5 }
        ],
        switches: [],
        doors: [],
        ice: [
            { x: 3, y: 2 },
            { x: 4, y: 2 },
            { x: 5, y: 2 },
            { x: 6, y: 2 },
            { x: 7, y: 2 }
        ],
        maxBlocks: null
    },

    // Level 27
    {
        name: "Sliding on Thin Ice",
        era: "Era 3: Conditionals & Ice",
        instructions: "Multiple ice patches connect solid landing pads. Plan your slides carefully!",
        start: { x: 1, y: 1, angle: 90 },
        objective: { x: 8, y: 8 },
        walls: [
            { x: 6, y: 1 },
            { x: 5, y: 8 }
        ],
        items: [
            { x: 5, y: 4 }
        ],
        switches: [],
        doors: [],
        ice: [
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 1 },
            { x: 5, y: 5 },
            { x: 5, y: 6 },
            { x: 5, y: 7 }
        ],
        maxBlocks: null
    },

    // Level 28
    {
        name: "The Smart Navigator",
        era: "Era 3: Conditionals & Ice",
        instructions: "An irregular corridor. Use 'If [Wall Ahead]' inside a loop to navigate every turn automatically.",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 8, y: 8 },
        walls: [
            { x: 1, y: 3 },
            { x: 5, y: 4 },
            { x: 8, y: 3 }
        ],
        items: [
            { x: 3, y: 4 },
            { x: 6, y: 4 }
        ],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: null
    },

    // Level 29
    {
        name: "Switch on Ice",
        era: "Era 3: Conditionals & Ice",
        instructions: "Slide across ice directly over the switch! It activates mid-slide to open the door ahead.",
        start: { x: 1, y: 4, angle: 90 },
        objective: { x: 9, y: 4 },
        walls: [
            { x: 7, y: 2 },
            { x: 7, y: 3 },
            { x: 7, y: 5 },
            { x: 7, y: 6 }
        ],
        items: [],
        switches: [
            { id: "switch-1", x: 4, y: 4, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 7, y: 4 }
        ],
        ice: [
            { x: 3, y: 4 },
            { x: 4, y: 4 },
            { x: 5, y: 4 }
        ],
        maxBlocks: null
    },

    // Level 30
    {
        name: "Era 3 Finale: Frostbite Fortress",
        era: "Era 3: Conditionals & Ice",
        instructions: "Master both conditionals and ice sliding to conquer the fortress!",
        start: { x: 0, y: 1, angle: 90 },
        objective: { x: 9, y: 8 },
        walls: [
            ...createVerticalWall(4, 0, 7),
            ...createVerticalWall(7, 3, 7)
        ],
        items: [
            { x: 2, y: 6 },
            { x: 8, y: 2 }
        ],
        switches: [
            { id: "switch-1", x: 2, y: 1, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 4, y: 7 }
        ],
        ice: [
            { x: 5, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 3 },
            { x: 8, y: 4 },
            { x: 8, y: 5 },
            { x: 8, y: 6 }
        ],
        maxBlocks: null
    },

    // ========================================================================
    // ERA 4: THE GAUNTLET (Levels 31 to 40)
    // All levels here enforce strict maxBlocks limits!
    // ========================================================================

    // Level 31
    {
        name: "Gauntlet 1: The Efficient Step",
        era: "Era 4: The Gauntlet",
        instructions: "You have an 8-tile walk, but you can only use 3 blocks total. Use a Loop!",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 9, y: 5 },
        walls: [],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: 3
    },

    // Level 32
    {
        name: "Gauntlet 2: Tight Turn",
        era: "Era 4: The Gauntlet",
        instructions: "Reach the goal using no more than 4 blocks! Plan your sequence carefully.",
        start: { x: 2, y: 7, angle: 0 },
        objective: { x: 7, y: 2 },
        walls: [
            { x: 2, y: 1 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: 4
    },

    // Level 33
    {
        name: "Gauntlet 3: Gem Rush",
        era: "Era 4: The Gauntlet",
        instructions: "Gather all 4 gems and hit the goal using only 5 blocks. Loop is your friend!",
        start: { x: 1, y: 4, angle: 90 },
        objective: { x: 7, y: 4 },
        walls: [],
        items: [
            { x: 3, y: 4 },
            { x: 4, y: 4 },
            { x: 5, y: 4 },
            { x: 6, y: 4 }
        ],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: 5
    },

    // Level 34
    {
        name: "Gauntlet 4: Glacial Momentum",
        era: "Era 4: The Gauntlet",
        instructions: "Cross the entire arena using the ice slide to conserve blocks! Limit: 4 blocks.",
        start: { x: 1, y: 2, angle: 90 },
        objective: { x: 8, y: 8 },
        walls: [
            { x: 9, y: 2 },
            { x: 8, y: 9 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [
            ...createHorizontalWall(2, 2, 6),
            ...createVerticalWall(8, 3, 5)
        ],
        maxBlocks: 4
    },

    // Level 35
    {
        name: "Gauntlet 5: The Gatekeeper",
        era: "Era 4: The Gauntlet",
        instructions: "Activate the switch to open the gate and collect the gem. Maximum 6 blocks allowed.",
        start: { x: 1, y: 5, angle: 90 },
        objective: { x: 8, y: 5 },
        walls: createVerticalWall(5, 2, 6),
        items: [
            { x: 7, y: 5 }
        ],
        switches: [
            { id: "switch-1", x: 3, y: 3, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 5, y: 5 }
        ],
        ice: [],
        maxBlocks: 6
    },

    // Level 36
    {
        name: "Gauntlet 6: Smart Reflexes",
        era: "Era 4: The Gauntlet",
        instructions: "Navigate the spiral corridor using Loop and 'If [Wall Ahead]' in at most 5 blocks!",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 6, y: 4 },
        walls: [
            { x: 1, y: 2 },
            { x: 8, y: 2 },
            { x: 8, y: 7 },
            { x: 3, y: 7 },
            { x: 3, y: 4 }
        ],
        items: [],
        switches: [],
        doors: [],
        ice: [],
        maxBlocks: 5
    },

    // Level 37
    {
        name: "Gauntlet 7: Dual Iceways",
        era: "Era 4: The Gauntlet",
        instructions: "Slide across two ice ways to collect both gems. Maximum 6 blocks.",
        start: { x: 1, y: 1, angle: 180 },
        objective: { x: 7, y: 8 },
        walls: [
            { x: 1, y: 8 },
            { x: 7, y: 1 }
        ],
        items: [
            { x: 1, y: 7 },
            { x: 7, y: 3 }
        ],
        switches: [],
        doors: [],
        ice: [
            ...createVerticalWall(1, 2, 5),
            ...createVerticalWall(7, 4, 4)
        ],
        maxBlocks: 6
    },

    // Level 38
    {
        name: "Gauntlet 8: Twin Security",
        era: "Era 4: The Gauntlet",
        instructions: "Two locked doors stand in your way. Hit both switches with tight block efficiency! Max 7 blocks.",
        start: { x: 1, y: 8, angle: 0 },
        objective: { x: 8, y: 1 },
        walls: [
            ...createHorizontalWall(1, 5, 7),
            ...createHorizontalWall(2, 3, 7)
        ],
        items: [],
        switches: [
            { id: "switch-1", x: 1, y: 6, doorId: "door-1" },
            { id: "switch-2", x: 7, y: 4, doorId: "door-2" }
        ],
        doors: [
            { id: "door-1", x: 4, y: 5 },
            { id: "door-2", x: 5, y: 3 }
        ],
        ice: [],
        maxBlocks: 7
    },

    // Level 39
    {
        name: "Gauntlet 9: The Frost Runner",
        era: "Era 4: The Gauntlet",
        instructions: "Combine switches, ice sliding, and gems within the 7 block limit.",
        start: { x: 1, y: 2, angle: 90 },
        objective: { x: 8, y: 8 },
        walls: [
            { x: 9, y: 2 },
            { x: 8, y: 4 },
            { x: 8, y: 6 }
        ],
        items: [
            { x: 8, y: 3 }
        ],
        switches: [
            { id: "switch-1", x: 8, y: 2, doorId: "door-1" }
        ],
        doors: [
            { id: "door-1", x: 8, y: 5 }
        ],
        ice: [
            ...createHorizontalWall(2, 2, 5),
            { x: 8, y: 7 }
        ],
        maxBlocks: 7
    },

    // Level 40
    {
        name: "Era 4 Finale: CampCoder Master",
        era: "Era 4: The Gauntlet",
        instructions: "The ultimate challenge! Switches, doors, ice slides, and gems all in one grand puzzle. Max 8 blocks.",
        start: { x: 0, y: 0, angle: 90 },
        objective: { x: 9, y: 9 },
        walls: [
            ...createVerticalWall(3, 0, 7),
            ...createVerticalWall(6, 3, 7)
        ],
        items: [
            { x: 2, y: 5 },
            { x: 8, y: 4 }
        ],
        switches: [
            { id: "switch-1", x: 1, y: 0, doorId: "door-1" },
            { id: "switch-2", x: 5, y: 9, doorId: "door-2" }
        ],
        doors: [
            { id: "door-1", x: 3, y: 7 },
            { id: "door-2", x: 6, y: 2 }
        ],
        ice: [
            { x: 4, y: 8 },
            { x: 5, y: 8 },
            { x: 7, y: 3 },
            { x: 8, y: 3 }
        ],
        maxBlocks: 8
    }
];