const { expo } = require("./app.json");

const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";

const configuredAndroidAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID;
const configuredIosAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS;

const updatedPlugins = (expo.plugins || []).map((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === "react-native-google-mobile-ads") {
    return [
      "react-native-google-mobile-ads",
      {
        androidAppId: configuredAndroidAppId || TEST_ANDROID_APP_ID,
        iosAppId: configuredIosAppId || TEST_IOS_APP_ID,
      },
    ];
  }

  return plugin;
});

module.exports = {
  ...expo,
  plugins: updatedPlugins,
};
