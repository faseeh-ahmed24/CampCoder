# 🚀 Firebase Setup Guide for CampCoder (100% Free Tier Guaranteed)

This guide walks you step-by-step through setting up Google Firebase Authentication and Cloud Firestore for CampCoder **with zero risk of charges**.

---

## 🛡️ The Zero-Cost Guarantee (How Firebase Billing Works)

> [!IMPORTANT]
> **You CANNOT be charged on Firebase unless you deliberately add a credit card.**
> 
> 1. **Default Spark Plan ($0/month)**: Every new Firebase project starts on the **Spark Plan**. This plan has **no credit card on file**. If you never enter a credit card, Google cannot bill you a single cent.
> 2. **Hard Quota Ceiling**: If you ever reach the daily limit on the Spark Plan, Firebase **stops accepting extra requests for that day** instead of charging you.
> 3. **Generous Free Daily Quotas**:
>    - **50,000 document reads PER DAY** (Free)
>    - **20,000 document writes PER DAY** (Free)
>    - **1 GiB total storage** (Free — enough to store over 1,000,000 student progress records!)
>    - **50,000 monthly active users** (Free)
> 4. **Built-in Code Optimizations in CampCoder**:
>    - We added **write-debouncing** (edits are bundled into 1 write every 3 seconds instead of writing on every single drag).
>    - We added **change-deduplication** (if code didn't change, 0 network requests are sent).
>    - We enabled **browser offline cache persistence** (reads are served directly from browser memory for free).

---

## Step 1: Create a Firebase Project
*(You already did this! Jump directly to Step 2.)*

If you need to view your project:
1. Go to the **Firebase Console**: 👉 [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click on your project.
3. Look at the bottom-left corner of the console screen: verify it says **Spark Plan (Free)**.

---

## Step 2: Register a Web App in Firebase
1. On your Firebase project overview page, click the **Web icon** (`</>`) to add a web application.
2. Enter an App nickname, e.g., `CampCoder Web`.
3. Leave "Also set up Firebase Hosting" unchecked for now.
4. Click **Register app**.
5. Firebase will display your `firebaseConfig` credentials object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "campcoder-game.firebaseapp.com",
     projectId: "campcoder-game",
     storageBucket: "campcoder-game.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```
6. Copy the values inside `firebaseConfig`.

---

## Step 3: Enable Email/Password in Authentication
*(We enable this provider so Firebase securely stores usernames & passwords)*

1. In the left navigation menu of the Firebase console, click **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click on **Email/Password**.
4. Toggle **Enable** on (the first toggle: "Email/Password").
5. Leave "Email link (passwordless sign-in)" turned off.
6. Click **Save**.

---

## Step 4: Create Cloud Firestore & Set Secure Quota Rules
1. In the left navigation menu, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a database location (for example, `nam5` or `us-central`), then click **Next**.
4. Choose **Start in test mode** and click **Create**.
5. Once your database is created, click the **Rules** tab at the top.
6. Replace the rules text with this secure rule:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only allow logged-in users to access their own progress document!
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
7. Click **Publish**. This completely prevents any bots or unauthorized users from making requests against your database!

---

## Step 5: Link Firebase to CampCoder Code
1. Open [`js/firebase-config.js`](file:///c:/Users/eehfa/OneDrive/Desktop/CampCoder%20-%20Copy/js/firebase-config.js) in your text editor.
2. Replace the placeholder values with your actual project credentials from Step 2:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
3. Save the file.

---

## Step 6: Monitor Your Free Usage
You can monitor your exact daily usage anytime:
1. In the Firebase Console, go to **Build** > **Firestore Database**.
2. Click the **Usage** tab at the top.
3. You will see a graph showing your daily reads and writes (typically less than 0.1% of the 20,000/50,000 daily free limit).
4. Rest easy knowing the Spark Plan has no payment method attached, meaning **$0.00 bills forever**.
