const safePlatform = window.navigator?.platform ?? "";
export const isWindows = ["Win32", "Win64", "Windows", "WinCE"].indexOf(safePlatform) > -1;
export const isChrome = navigator.userAgent.toLowerCase().includes("chrome");
export const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

export const isSupportedBrowser = isChrome || isFirefox;
