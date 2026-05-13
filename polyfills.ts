import { Buffer } from "buffer";
import "react-native-get-random-values";

// Ensure Node Buffer is available in React Native/Hermes builds.
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}
