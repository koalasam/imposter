module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo automatically configures the Reanimated/Worklets
    // Babel plugins when react-native-reanimated is installed, so they
    // no longer need to be (and must not be) added manually below.
    presets: ["babel-preset-expo"],
    plugins: [],
  };
};
