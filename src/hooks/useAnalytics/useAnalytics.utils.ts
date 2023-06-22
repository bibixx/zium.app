const WAS_CONSENT_GIVEN_STORAGE_KEY = "wasConsentGiven";

export const getInitialWasConsentGiven = () => {
  const value = localStorage.getItem(WAS_CONSENT_GIVEN_STORAGE_KEY);
  if (value == null) {
    return null;
  }

  return value === "true";
};

export const setInitialWasConsentGiven = (value: boolean | null) => {
  if (value == null) {
    localStorage.removeItem(WAS_CONSENT_GIVEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(WAS_CONSENT_GIVEN_STORAGE_KEY, value ? "true" : "false");
};
