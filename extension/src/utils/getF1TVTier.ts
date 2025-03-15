export type F1TVTier = "Pro" | "Access" | "None" | "Premium" | "Unknown";

export const getF1TVTier = (token: string | null): { tier: F1TVTier; rawTier: string | null } => {
  try {
    if (token == null) {
      return { tier: "None", rawTier: null };
    }

    const [, payload] = token.split(".");
    const decodedToken = atob(payload);
    const parsedToken = JSON.parse(decodedToken);

    const SubscribedProduct = parsedToken.SubscribedProduct;
    if (!SubscribedProduct) {
      return { tier: "None", rawTier: SubscribedProduct };
    }

    if (SubscribedProduct.includes("TV Premium")) {
      return { tier: "Premium", rawTier: SubscribedProduct };
    }

    if (SubscribedProduct.includes("TV Pro")) {
      return { tier: "Pro", rawTier: SubscribedProduct };
    }

    if (SubscribedProduct.includes("TV Access")) {
      return { tier: "Access", rawTier: SubscribedProduct };
    }

    return { tier: "Unknown", rawTier: "Unknown" };
  } catch (error) {
    console.error(error);

    return { tier: "None", rawTier: null };
  }
};
