const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("@lingui/metro-transformer/expo"),
};

config.resolver.sourceExts.push("svg");

config.resolver.extraNodeModules = {
  "@noble/hashes": path.resolve(__dirname, "node_modules/@noble/hashes"),
  crypto: path.resolve(__dirname, "node_modules/@noble/hashes/crypto"),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@noble/hashes/crypto.js" || moduleName === "@noble/hashes/crypto") {
    return {
      filePath: path.resolve(__dirname, "node_modules/@noble/hashes/crypto.js"),
      type: "sourceFile",
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
