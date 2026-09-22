/**
 * ============================================================================
 * FIREBASE CONFIGURATION
 * ============================================================================
 * This file holds the Firebase configuration settings for CampCoder.
 * 
 * To connect your own Firebase project:
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Create a project and register a Web App.
 * 3. Copy the firebaseConfig object provided by the console.
 * 4. Paste your values into the configuration object below.
 * 
 * If you do not have Firebase set up yet, the game will automatically fall back
 * to "Guest Mode" using your browser's localStorage, so you can still play!
 */

// Step 1: Replace the placeholder strings below with your Firebase project credentials.
  const firebaseConfig = {
    apiKey: "AIzaSyAv1BsPBzuy_KDJzKG9uKKM5WHlxBaGpPE",
    authDomain: "camp-coder.firebaseapp.com",
    projectId: "camp-coder",
    storageBucket: "camp-coder.firebasestorage.app",
    messagingSenderId: "284460278024",
    appId: "1:284460278024:web:0795acc53112685ef6ccbd"
  };

/**
 * Checks whether the user has replaced the placeholder values with actual Firebase keys.
 * We avoid ternary operators and one-liners here to keep the code clear and beginner-friendly.
 * 
 * @returns {boolean} True if the configuration contains real keys, false otherwise.
 */
function isFirebaseConfigured() {
    // If the API key is missing or is still the default placeholder, Firebase is not configured.
    if (!firebaseConfig.apiKey) {
        return false;
    }
    
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
        return false;
    }
    
    if (firebaseConfig.projectId === "YOUR_PROJECT_ID") {
        return false;
    }
    
    return true;
}

// Global variables to store the Firebase Auth and Firestore database instances.
let firebaseAuth = null;
let firestoreDb = null;

// Initialize Firebase only if the configuration has been updated and the Firebase SDK is loaded.
if (isFirebaseConfigured()) {
    if (typeof firebase !== "undefined") {
        try {
            // Initialize the Firebase app
            firebase.initializeApp(firebaseConfig);
            
            // Get handles to Authentication and Firestore
            firebaseAuth = firebase.auth();
            firestoreDb = firebase.firestore();

            // Enable offline persistence so reads are cached locally for free
            try {
                firestoreDb.enablePersistence({ synchronizeTabs: true });
            } catch (cacheError) {
                console.warn("Firestore cache persistence warning:", cacheError);
            }
            
            console.log("Firebase initialized successfully for CampCoder!");
        } catch (initializationError) {
            console.error("Error initializing Firebase:", initializationError);
        }
    } else {
        console.warn("Firebase SDK script tag was not found in the HTML document.");
    }
} else {
    console.info("Firebase is running in local Guest Mode. Progress will be saved to your browser's local storage.");
}

