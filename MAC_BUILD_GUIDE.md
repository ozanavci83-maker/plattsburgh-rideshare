# Build Plattsburgh RideShare APKs on Your MacBook

This guide will walk you through building Android APKs on your MacBook for both the Rider and Driver apps.

## Prerequisites

Your MacBook needs:
- **Node.js** (v18+)
- **Java Development Kit (JDK)** (v11+)
- **Android SDK**
- **Git**

## Step-by-Step Setup

### Step 1: Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Node.js
```bash
brew install node
```

Verify:
```bash
node --version
npm --version
```

### Step 3: Install Java Development Kit (JDK)
```bash
brew install openjdk@11
```

Set Java home:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 11)' >> ~/.zshrc
source ~/.zshrc
```

### Step 4: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install it (drag to Applications folder)
3. Open Android Studio
4. Go through the setup wizard
5. Install Android SDK (when prompted)

### Step 5: Set Android SDK Path
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

### Step 6: Clone the Repository
```bash
git clone https://github.com/ozanavci83-maker/plattsburgh-rideshare.git
cd plattsburgh-rideshare
```

### Step 7: Install Dependencies
```bash
npm install
cd apps/rider
npm install
```

### Step 8: Create Prebuild
```bash
npx expo prebuild --clean --platform android
```

This will create an `android` folder with the native code.

### Step 9: Build the APK

#### Option A: Using Gradle (Recommended)
```bash
cd android
./gradlew assembleRelease
```

The APK will be at:
```
apps/rider/android/app/build/outputs/apk/release/app-release.apk
```

#### Option B: Using Expo CLI
```bash
cd ..
npx eas-cli build --platform android --local
```

### Step 10: Transfer APK to Your Phone
1. Connect your phone to your Mac via USB
2. Copy the APK file to your phone
3. On your phone: Settings → Security → Allow Unknown Sources
4. Open the APK file and tap Install

## Troubleshooting

### Issue: "Java not found"
```bash
brew install openjdk@11
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

### Issue: "Android SDK not found"
1. Open Android Studio
2. Go to Preferences → Appearance & Behavior → System Settings → Android SDK
3. Install Android SDK Platform 33 or higher

### Issue: "Gradle build fails"
```bash
cd apps/rider/android
./gradlew clean
./gradlew assembleRelease
```

### Issue: "Out of memory"
```bash
export GRADLE_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
```

## Building Driver App

Repeat the same steps for the Driver app:
```bash
cd apps/driver
npm install
npx expo prebuild --clean --platform android
cd android
./gradlew assembleRelease
```

## After Building

Once you have the APKs:
1. Transfer to your phone
2. Install both apps
3. Open Admin Dashboard: https://plattsburgh-rideshare-production.up.railway.app
4. Create test accounts
5. Approve driver
6. Test the full ride flow!

## API Configuration

Both apps are already configured to use:
```
https://plattsburgh-rideshare-production.up.railway.app/api
```

No additional configuration needed!

## Support

If you run into issues:
1. Check the error message carefully
2. Google the error (usually has solutions)
3. Try the troubleshooting section above
4. Check Android Studio logs

Good luck! 🚀
