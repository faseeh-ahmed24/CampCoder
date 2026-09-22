/**
 * ============================================================================
 * AUTHENTICATION & DATABASE MANAGER (Auth.js) - Username & Password
 * ============================================================================
 * This class manages user authentication (Sign Up, Log In, Log Out) using a
 * friendly Username and Password system. It saves player progress to Google
 * Cloud Firestore (or browser local storage when running in Guest Mode).
 * 
 * How Username Authentication Works with Firebase:
 * - Firebase Auth natively requires an email address string.
 * - To give students and players a seamless "Username Only" experience, our
 *   app automatically maps the username to an internal account:
 *   e.g., "CodeHero" -> "codehero@campcoder.app".
 * - The player only ever enters and sees their clean username.
 * 
 * Coding Standards Enforced:
 * - No one-liners
 * - No ternary operators (full if/else blocks only)
 * - Always use braces around statement blocks
 * - Descriptive variable names (no single letters except i, j)
 * - Heavy explanatory comments for beginners
 */
class AuthManager {
    constructor() {
        // Reference to the current logged in user object, or null if guest
        this.currentUser = null;

        // Current user's friendly display username
        this.currentUsername = "";

        // Reference to the Game instance so we can refresh levels and workspace on login
        this.gameInstance = null;

        // Grab modal DOM elements
        this.modalOverlayElement = document.getElementById("auth-modal-overlay");
        this.openModalButton = document.getElementById("open-auth-modal-btn");
        this.closeModalButton = document.getElementById("close-auth-modal-btn");

        // Grab form DOM elements
        this.authFormElement = document.getElementById("auth-form");
        this.usernameInputElement = document.getElementById("auth-username-input");
        this.passwordInputElement = document.getElementById("auth-password-input");
        this.submitButtonElement = document.getElementById("auth-submit-btn");
        this.authMessageElement = document.getElementById("auth-message");

        // Tab buttons for switching between Log In and Sign Up
        this.tabLoginButton = document.getElementById("tab-login-btn");
        this.tabSignupButton = document.getElementById("tab-signup-btn");

        // Track the current modal mode: either "login" or "signup"
        this.currentAuthMode = "login";

        // Grab top bar status elements
        this.userStatusTextElement = document.getElementById("user-status-text");
        this.logoutButtonElement = document.getElementById("logout-btn");

        // Quota & Cost Protection: Debounce timer and cache to minimize Firestore network writes
        this.firestoreSaveTimeoutId = null;
        this.lastSyncedWorkspaceCodeByLevel = {};
        this.lastSyncedHighestLevel = 0;

        // Set up all event listeners for the modal and authentication
        this.setupEventListeners();

        // Listen for Firebase authentication state changes
        this.setupFirebaseListener();
    }

    /**
     * Converts a player's username into a standardized internal Firebase Auth email string.
     * Example: "Ninja_99" -> "ninja_99@campcoder.app"
     * 
     * @param {string} rawUsername The username typed by the player.
     * @returns {string} The formatted internal email string for Firebase Auth.
     */
    convertUsernameToAuthEmail(rawUsername) {
        // Convert to lowercase and trim any accidental spaces
        const sanitizedUsername = rawUsername.toLowerCase().trim();
        return sanitizedUsername + "@campcoder.app";
    }

    /**
     * Connects the AuthManager to the Game instance.
     * This lets Auth tell the Game to reload levels and code when a user signs in.
     * 
     * @param {Game} game The main game orchestrator instance.
     */
    setGameInstance(game) {
        this.gameInstance = game;
    }

    /**
     * Attaches click and submit event handlers to all auth UI controls.
     */
    setupEventListeners() {
        // Open modal button
        if (this.openModalButton) {
            this.openModalButton.addEventListener("click", () => {
                this.openModal("login");
            });
        }

        // Close modal button
        if (this.closeModalButton) {
            this.closeModalButton.addEventListener("click", () => {
                this.closeModal();
            });
        }

        // Switch to "Log In" mode
        if (this.tabLoginButton) {
            this.tabLoginButton.addEventListener("click", () => {
                this.setMode("login");
            });
        }

        // Switch to "Sign Up" mode
        if (this.tabSignupButton) {
            this.tabSignupButton.addEventListener("click", () => {
                this.setMode("signup");
            });
        }

        // Handle form submission
        if (this.authFormElement) {
            this.authFormElement.addEventListener("submit", (submitEvent) => {
                submitEvent.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Log out button in the header bar
        if (this.logoutButtonElement) {
            this.logoutButtonElement.addEventListener("click", () => {
                this.logOutUser();
            });
        }
    }

    /**
     * Opens the auth modal and switches to the chosen tab mode.
     * 
     * @param {string} mode Either "login" or "signup".
     */
    openModal(mode) {
        this.clearMessages();
        this.setMode(mode);
        if (this.modalOverlayElement) {
            this.modalOverlayElement.style.display = "flex";
        }
    }

    /**
     * Closes the auth modal and resets form inputs.
     */
    closeModal() {
        if (this.modalOverlayElement) {
            this.modalOverlayElement.style.display = "none";
        }
        if (this.usernameInputElement) {
            this.usernameInputElement.value = "";
        }
        if (this.passwordInputElement) {
            this.passwordInputElement.value = "";
        }
        this.clearMessages();
    }

    /**
     * Toggles the active tab between Log In and Sign Up.
     * 
     * @param {string} mode Either "login" or "signup".
     */
    setMode(mode) {
        this.currentAuthMode = mode;
        this.clearMessages();

        if (mode === "login") {
            if (this.tabLoginButton) {
                this.tabLoginButton.classList.add("active-tab");
            }
            if (this.tabSignupButton) {
                this.tabSignupButton.classList.remove("active-tab");
            }
            if (this.submitButtonElement) {
                this.submitButtonElement.innerText = "Log In";
            }
        } else {
            if (this.tabSignupButton) {
                this.tabSignupButton.classList.add("active-tab");
            }
            if (this.tabLoginButton) {
                this.tabLoginButton.classList.remove("active-tab");
            }
            if (this.submitButtonElement) {
                this.submitButtonElement.innerText = "Create Account";
            }
        }
    }

    /**
     * Clears any status or error messages in the modal.
     */
    clearMessages() {
        if (this.authMessageElement) {
            this.authMessageElement.innerText = "";
            this.authMessageElement.className = "auth-message";
        }
    }

    /**
     * Displays a feedback message to the user inside the modal.
     * 
     * @param {string} message The text to display.
     * @param {boolean} isError True if the message is an error, false for success.
     */
    displayMessage(message, isError) {
        if (this.authMessageElement) {
            this.authMessageElement.innerText = message;
            if (isError) {
                this.authMessageElement.className = "auth-message error-text";
            } else {
                this.authMessageElement.className = "auth-message success-text";
            }
        }
    }

    /**
     * Listens for Firebase Auth state changes.
     * Automatically called on page load and whenever a user logs in or out.
     */
    setupFirebaseListener() {
        // If Firebase Auth is not active, stay in local Guest Mode
        if (!firebaseAuth) {
            this.updateHeaderUIForGuest();
            return;
        }

        firebaseAuth.onAuthStateChanged(async (authenticatedUser) => {
            if (authenticatedUser) {
                // User is signed in
                this.currentUser = authenticatedUser;

                // Determine display username
                let playerUsername = authenticatedUser.displayName;
                if (!playerUsername) {
                    // Fallback to portion of internal email before @
                    if (authenticatedUser.email) {
                        const emailParts = authenticatedUser.email.split("@");
                        playerUsername = emailParts[0];
                    } else {
                        playerUsername = "Player";
                    }
                }

                this.currentUsername = playerUsername;
                this.updateHeaderUIForUser(playerUsername);
                console.log("Firebase user logged in:", playerUsername);

                // Fetch their saved data from Firestore
                await this.syncUserDataFromFirestore();
            } else {
                // User is signed out
                this.currentUser = null;
                this.currentUsername = "";
                this.updateHeaderUIForGuest();
                console.log("No Firebase user logged in. Using local Guest Mode.");
            }
        });
    }

    /**
     * Updates the header UI and homepage hero buttons to show the logged-in user's username.
     * 
     * @param {string} username The username of the current user.
     */
    updateHeaderUIForUser(username) {
        if (this.userStatusTextElement) {
            this.userStatusTextElement.innerText = "Logged in: " + username;
        }
        if (this.openModalButton) {
            this.openModalButton.style.display = "none";
        }
        if (this.logoutButtonElement) {
            this.logoutButtonElement.style.display = "inline-block";
        }

        // Update homepage hero buttons to show "CONTINUE LEARNING"
        this.updateHeroButtons(true);
    }

    /**
     * Updates the header UI and homepage hero buttons to show the Guest state.
     */
    updateHeaderUIForGuest() {
        if (this.userStatusTextElement) {
            this.userStatusTextElement.innerText = "Playing as: Guest";
        }
        if (this.openModalButton) {
            this.openModalButton.style.display = "inline-block";
        }
        if (this.logoutButtonElement) {
            this.logoutButtonElement.style.display = "none";
        }

        // Update homepage hero buttons to show "LOG IN" and "CONTINUE AS GUEST"
        this.updateHeroButtons(false);
    }

    /**
     * Updates the hero action buttons on the homepage based on user login state.
     * 
     * @param {boolean} isLoggedIn True if logged in, false if guest.
     */
    updateHeroButtons(isLoggedIn) {
        const heroLoginButton = document.getElementById("hero-login-btn");
        const heroGuestButton = document.getElementById("hero-guest-btn");
        const heroContinueButton = document.getElementById("hero-continue-btn");

        if (isLoggedIn) {
            if (heroLoginButton) {
                heroLoginButton.style.display = "none";
            }
            if (heroGuestButton) {
                heroGuestButton.style.display = "none";
            }
            if (heroContinueButton) {
                heroContinueButton.style.display = "inline-block";
            }
        } else {
            if (heroLoginButton) {
                heroLoginButton.style.display = "inline-block";
            }
            if (heroGuestButton) {
                heroGuestButton.style.display = "inline-block";
            }
            if (heroContinueButton) {
                heroContinueButton.style.display = "none";
            }
        }
    }

    /**
     * Validates that a chosen username is between 3 and 20 characters and contains only letters, numbers, and underscores.
     * 
     * @param {string} username The username to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    isValidUsername(username) {
        if (username.length < 3) {
            return false;
        }
        if (username.length > 20) {
            return false;
        }

        // Allow only letters, numbers, and underscores
        const validCharactersRegex = /^[a-zA-Z0-9_]+$/;
        if (!validCharactersRegex.test(username)) {
            return false;
        }

        return true;
    }

    /**
     * Translates Firebase Auth error codes into friendly, username-focused messages.
     * 
     * @param {Object} authError The error object from Firebase.
     * @returns {string} Human-friendly error message.
     */
    getFriendlyErrorMessage(authError) {
        const errorCode = authError.code;

        if (errorCode === "auth/email-already-in-use") {
            return "That username is already taken! Please choose a different username.";
        }

        if (errorCode === "auth/user-not-found") {
            return "Username not found. Please check your spelling or sign up for a new account.";
        }

        if (errorCode === "auth/wrong-password") {
            return "Incorrect password. Please try again.";
        }

        if (errorCode === "auth/invalid-credential") {
            return "Incorrect username or password. Please try again.";
        }

        if (errorCode === "auth/weak-password") {
            return "Password must be at least 6 characters long.";
        }

        // Default to the provided error message if not specifically mapped
        return authError.message;
    }

    /**
     * Handles the form submit event when the user clicks "Log In" or "Create Account".
     */
    async handleFormSubmit() {
        const usernameValue = this.usernameInputElement.value.trim();
        const passwordValue = this.passwordInputElement.value.trim();

        // 1. Validate Username
        if (!this.isValidUsername(usernameValue)) {
            this.displayMessage(
                "Username must be between 3 and 20 characters and contain only letters, numbers, or underscores (_).",
                true
            );
            return;
        }

        // 2. Validate Password
        if (passwordValue.length < 6) {
            this.displayMessage("Password must be at least 6 characters long.", true);
            return;
        }

        // 3. Check if Firebase is configured
        if (!firebaseAuth) {
            this.displayMessage(
                "Firebase is not configured yet! Please update js/firebase-config.js with your project credentials.",
                true
            );
            return;
        }

        // Convert username to internal Firebase email
        const internalAuthEmail = this.convertUsernameToAuthEmail(usernameValue);

        // Disable submit button while working
        this.submitButtonElement.disabled = true;

        try {
            if (this.currentAuthMode === "signup") {
                // Create a new user account
                const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
                    internalAuthEmail,
                    passwordValue
                );

                // Save username to the Firebase user profile
                if (userCredential.user) {
                    await userCredential.user.updateProfile({
                        displayName: usernameValue
                    });
                }

                this.currentUsername = usernameValue;
                this.displayMessage("Account created successfully! Welcome, " + usernameValue + "!", false);

                // Small delay so user can see success message before modal closes
                setTimeout(() => {
                    this.closeModal();
                }, 1000);
            } else {
                // Sign in existing user
                await firebaseAuth.signInWithEmailAndPassword(
                    internalAuthEmail,
                    passwordValue
                );

                this.currentUsername = usernameValue;
                this.displayMessage("Logged in successfully! Loading your progress...", false);

                setTimeout(() => {
                    this.closeModal();
                }, 1000);
            }
        } catch (authError) {
            console.error("Firebase Auth Error:", authError);
            const friendlyMessage = this.getFriendlyErrorMessage(authError);
            this.displayMessage(friendlyMessage, true);
        } finally {
            this.submitButtonElement.disabled = false;
        }
    }

    /**
     * Logs out the current user and switches to Guest Mode.
     */
    async logOutUser() {
        if (firebaseAuth) {
            try {
                await firebaseAuth.signOut();
                console.log("User successfully signed out.");
            } catch (signOutError) {
                console.error("Error signing out:", signOutError);
            }
        } else {
            this.currentUser = null;
            this.currentUsername = "";
            this.updateHeaderUIForGuest();
        }
    }

    /**
     * Fetches the user's saved data from Firestore and syncs it with the game.
     */
    async syncUserDataFromFirestore() {
        if (!this.currentUser) {
            return;
        }

        if (!firestoreDb) {
            return;
        }

        const userDocumentId = this.currentUser.uid;
        const userDocReference = firestoreDb.collection("users").doc(userDocumentId);

        try {
            const documentSnapshot = await userDocReference.get();

            if (documentSnapshot.exists) {
                const userData = documentSnapshot.data();
                console.log("Loaded user progress from Firestore:", userData);

                if (this.gameInstance) {
                    // Restore highest level cleared
                    let highestCleared = 0;
                    if (typeof userData.highestLevelCleared === "number") {
                        highestCleared = userData.highestLevelCleared;
                    }
                    this.gameInstance.setHighestLevelCleared(highestCleared);

                    // Restore workspace code map
                    if (userData.workspaceCode) {
                        this.gameInstance.restoreWorkspaceCodeMap(userData.workspaceCode);
                    }
                }

                // If username was saved in Firestore, ensure header reflects it
                if (userData.username) {
                    this.currentUsername = userData.username;
                    this.updateHeaderUIForUser(userData.username);
                }
            } else {
                // Initialize an empty document for new users in Firestore
                const initialUserData = {
                    username: this.currentUsername,
                    highestLevelCleared: 0,
                    workspaceCode: {},
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                await userDocReference.set(initialUserData);
                console.log("Initialized new Firestore profile for user:", userDocumentId);
            }
        } catch (firestoreFetchError) {
            console.error("Failed to fetch user progress from Firestore:", firestoreFetchError);
        }
    }

    /**
     * Saves player progress and workspace code.
     * 
     * Quota Optimization:
     * - Writes to localStorage immediately (instant local backup, zero cost).
     * - Checks if code has actually changed: skips Firestore if identical.
     * - If isImmediate is false (during editing), debounces writes with a 3-second
     *   timer so multiple block edits only trigger a single Firestore write.
     * - If isImmediate is true (on level win / level switch), writes immediately.
     * 
     * @param {number} levelIndex The index of the level currently being saved.
     * @param {number} highestLevelCleared The highest level index the player has completed.
     * @param {string} workspaceJsonString The serialized JSON string of workspace blocks.
     * @param {boolean} isImmediate True to save immediately to Firestore; false to debounce.
     */
    async saveUserProgress(levelIndex, highestLevelCleared, workspaceJsonString, isImmediate) {
        // 1. Save to local storage immediately for zero-cost instant persistence
        try {
            const storedLocalCode = localStorage.getItem("campcoder_workspace_code");
            let localCodeObject = {};
            if (storedLocalCode) {
                localCodeObject = JSON.parse(storedLocalCode);
            }
            localCodeObject[levelIndex.toString()] = workspaceJsonString;
            localStorage.setItem("campcoder_workspace_code", JSON.stringify(localCodeObject));

            const storedHighestLevel = localStorage.getItem("campcoder_highest_level");
            let localHighestLevel = 0;
            if (storedHighestLevel) {
                localHighestLevel = parseInt(storedHighestLevel, 10);
            }
            if (highestLevelCleared > localHighestLevel) {
                localStorage.setItem("campcoder_highest_level", highestLevelCleared.toString());
            }
        } catch (localStorageError) {
            console.warn("Could not save to localStorage:", localStorageError);
        }

        // 2. If not logged into Firebase, we are in Guest Mode (zero database writes needed)
        if (!this.currentUser) {
            return;
        }

        if (!firestoreDb) {
            return;
        }

        // 3. Check if the code is identical to what we already saved to avoid redundant network writes
        const levelKey = levelIndex.toString();
        const lastSavedCode = this.lastSyncedWorkspaceCodeByLevel[levelKey];
        const isCodeIdentical = (lastSavedCode === workspaceJsonString);
        const isHighestIdentical = (this.lastSyncedHighestLevel === highestLevelCleared);

        if (isCodeIdentical) {
            if (isHighestIdentical) {
                // Nothing changed; skip writing to Firestore to conserve daily quota!
                return;
            }
        }

        // 4. Handle immediate write versus debounced write
        if (isImmediate) {
            // Cancel any pending timer
            if (this.firestoreSaveTimeoutId !== null) {
                clearTimeout(this.firestoreSaveTimeoutId);
                this.firestoreSaveTimeoutId = null;
            }

            await this.performFirestoreWrite(levelIndex, highestLevelCleared, workspaceJsonString);
        } else {
            // Debounce: Cancel previous timer and wait 3 seconds after user stops editing blocks
            if (this.firestoreSaveTimeoutId !== null) {
                clearTimeout(this.firestoreSaveTimeoutId);
            }

            this.firestoreSaveTimeoutId = setTimeout(async () => {
                await this.performFirestoreWrite(levelIndex, highestLevelCleared, workspaceJsonString);
                this.firestoreSaveTimeoutId = null;
            }, 3000);
        }
    }

    /**
     * Executes the actual network write to Cloud Firestore.
     * 
     * @param {number} levelIndex The level index.
     * @param {number} highestLevelCleared The highest cleared level.
     * @param {string} workspaceJsonString The JSON code string.
     */
    async performFirestoreWrite(levelIndex, highestLevelCleared, workspaceJsonString) {
        if (!this.currentUser) {
            return;
        }

        if (!firestoreDb) {
            return;
        }

        const userDocumentId = this.currentUser.uid;
        const userDocReference = firestoreDb.collection("users").doc(userDocumentId);

        try {
            const updatePayload = {};
            updatePayload["workspaceCode." + levelIndex] = workspaceJsonString;

            if (highestLevelCleared > 0) {
                updatePayload["highestLevelCleared"] = highestLevelCleared;
            }

            if (this.currentUsername) {
                updatePayload["username"] = this.currentUsername;
            }

            await userDocReference.update(updatePayload);

            // Record as synced so we don't repeat the write unnecessarily
            this.lastSyncedWorkspaceCodeByLevel[levelIndex.toString()] = workspaceJsonString;
            this.lastSyncedHighestLevel = highestLevelCleared;

            console.log("Synced level " + (levelIndex + 1) + " to Cloud Firestore!");
        } catch (firestoreSaveError) {
            console.warn("Update failed, attempting merge set:", firestoreSaveError);
            try {
                const mergePayload = {
                    highestLevelCleared: highestLevelCleared,
                    username: this.currentUsername,
                    workspaceCode: {}
                };
                mergePayload.workspaceCode[levelIndex.toString()] = workspaceJsonString;
                await userDocReference.set(mergePayload, { merge: true });

                this.lastSyncedWorkspaceCodeByLevel[levelIndex.toString()] = workspaceJsonString;
                this.lastSyncedHighestLevel = highestLevelCleared;
            } catch (fallbackSetError) {
                console.error("Failed to save to Firestore:", fallbackSetError);
            }
        }
    }

    /**
     * Loads guest progress from local storage when no Firebase user is logged in.
     * 
     * @returns {Object} Object containing highestLevelCleared and workspaceCode map.
     */
    loadLocalGuestProgress() {
        let highestLevel = 0;
        let codeMap = {};

        try {
            const storedHighest = localStorage.getItem("campcoder_highest_level");
            if (storedHighest) {
                highestLevel = parseInt(storedHighest, 10);
            }

            const storedCode = localStorage.getItem("campcoder_workspace_code");
            if (storedCode) {
                codeMap = JSON.parse(storedCode);
            }
        } catch (readError) {
            console.warn("Could not load from localStorage:", readError);
        }

        return {
            highestLevelCleared: highestLevel,
            workspaceCode: codeMap
        };
    }
}
