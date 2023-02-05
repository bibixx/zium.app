const getToken = async () => {
  const cookies = Object.fromEntries(
    document.cookie.split(";").map((c) => c.trim().split("="))
  );
  const encodedLoginSession = cookies["login-session"];

  if (!encodedLoginSession) {
    return null;
  }

  const stringifiedLoginSession = decodeURIComponent(encodedLoginSession);
  const loginSession = JSON.parse(stringifiedLoginSession);

  const subscriptionToken = loginSession.data.subscriptionToken;

  if (!subscriptionToken) {
    return null;
  }

  return subscriptionToken;
};

(async function () {
  const token = await getToken();

  if (token === null) {
    await chrome.storage.local.remove("token");
  } else {
    await chrome.storage.local.set({ token });
  }
})();
