const HASH_SALT = "zium-posthog-v1";

const hash = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const getF1TVUserId = async (token: string | null | undefined): Promise<string | null> => {
  try {
    if (token == null) {
      return null;
    }

    const [, payload] = token.split(".");
    const decodedToken = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const subscriberId = JSON.parse(decodedToken).SubscriberId;

    if (subscriberId == null || subscriberId === "") {
      return null;
    }

    return await hash(`${HASH_SALT}:${subscriberId}`);
  } catch (error) {
    console.error(error);

    return null;
  }
};
