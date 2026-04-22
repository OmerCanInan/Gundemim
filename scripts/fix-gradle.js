import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'node_modules', '@capacitor-community', 'text-to-speech', 'android', 'build.gradle');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("getDefaultProguardFile('proguard-android.txt')")) {
    console.log('Fixing Gradle ProGuard issue in @capacitor-community/text-to-speech...');
    content = content.replace(
      "getDefaultProguardFile('proguard-android.txt')",
      "getDefaultProguardFile('proguard-android-optimize.txt')"
    );
    fs.writeFileSync(filePath, content);
    console.log('Done.');
  } else {
    console.log('Gradle ProGuard issue already fixed or not found.');
  }
} else {
  console.warn('Warning: @capacitor-community/text-to-speech build.gradle not found at', filePath);
}
