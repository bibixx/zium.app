export const parseLoginSession = (encodedLoginSession: string): string | null => {
  const stringifiedLoginSession = decodeURIComponent(encodedLoginSession);
  const loginSession = JSON.parse(stringifiedLoginSession);

  const subscriptionToken = loginSession?.data?.subscriptionToken;

  if (subscriptionToken == null) {
    return null;
  }

  return subscriptionToken;
};
