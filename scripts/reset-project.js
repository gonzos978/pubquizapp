#!/usr/bin/env node

/**
 * Clean React Native reset script
 * Deletes or moves old folders and creates a fresh /app folder with a plain App.tsx
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
const exampleDir = "app-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);

const appContent = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to your new React Native app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const moveDirectories = async (userInput) => {
    try {
        if (userInput === "y") {
            await fs.promises.mkdir(exampleDirPath, { recursive: true });
            console.log(`📁 /${exampleDir} directory created.`);
        }

        for (const dir of oldDirs) {
            const oldDirPath = path.join(root, dir);
            if (fs.existsSync(oldDirPath)) {
                if (userInput === "y") {
                    const newDirPath = path.join(root, exampleDir, dir);
                    await fs.promises.rename(oldDirPath, newDirPath);
                    console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
                } else {
                    await fs.promises.rm(oldDirPath, { recursive: true, force: true });
                    console.log(`❌ /${dir} deleted.`);
                }
            } else {
                console.log(`➡️ /${dir} does not exist, skipping.`);
            }
        }

        // Create new /app directory
        const newAppDirPath = path.join(root, newAppDir);
        await fs.promises.mkdir(newAppDirPath, { recursive: true });
        console.log("\n📁 New /app directory created.");

        // Create App.tsx
        const appPath = path.join(newAppDirPath, "App.tsx");
        await fs.promises.writeFile(appPath, appContent);
        console.log("📄 app/App.tsx created.");

        console.log("\n✅ Project reset complete. Next steps:");
        console.log(
            `1. Run \`npx expo start\` to start your development server.\n2. Edit app/App.tsx to start coding your app.${
                userInput === "y"
                    ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
                    : ""
            }`
        );
    } catch (error) {
        console.error(`❌ Error during script execution: ${error.message}`);
    }
};

rl.question(
    "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
    (answer) => {
        const userInput = answer.trim().toLowerCase() || "y";
        if (userInput === "y" || userInput === "n") {
            moveDirectories(userInput).finally(() => rl.close());
        } else {
            console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
            rl.close();
        }
    }
);
