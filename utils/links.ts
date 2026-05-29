import * as WebBrowser from "expo-web-browser";
import { Linking, Alert, Platform } from "react-native";

export async function openWebUrl(url: string) {
  if (url.startsWith("mailto:")) {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open email client.");
    }
    return;
  }

  if (Platform.OS === "ios") {
    await WebBrowser.openAuthSessionAsync(url);
  } else {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open the link at the moment.");
    }
  }
}