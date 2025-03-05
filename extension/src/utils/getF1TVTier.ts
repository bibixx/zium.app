export type F1TVTier = "Pro" | "Access" | "None" | "Premium" | "Unknown";

export const getF1TVTier = (token: string | null): F1TVTier => {
  try {
    if (token == null) {
      return "None";
    }

    const [, payload] = token.split(".");
    const decodedToken = atob(payload);
    const parsedToken = JSON.parse(decodedToken);

    const SubscribedProduct = parsedToken.SubscribedProduct;
    if (!SubscribedProduct) {
      return "None";
    }

    if (SubscribedProduct.includes("TV Premium")) {
      return "Premium";
    }

    if (SubscribedProduct.includes("TV Pro")) {
      return "Pro";
    }

    if (SubscribedProduct.includes("TV Access")) {
      return "Access";
    }

    return "Unknown";
  } catch (error) {
    console.error(error);

    return "None";
  }
};
