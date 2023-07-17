export type F1TVTier = "Pro" | "Access" | "None";

export const getF1TVTier = (token: string | null): F1TVTier => {
  try {
    if (token == null) {
      return "None";
    }

    const [, payload] = token.split(".");
    const decodedToken = atob(payload);
    const parsedToken = JSON.parse(decodedToken);

    const SubscribedProduct = parsedToken.SubscribedProduct;
    if (SubscribedProduct == null) {
      return "None";
    }

    if (SubscribedProduct.includes("TV Pro")) {
      return "Pro";
    }

    if (SubscribedProduct.includes("TV Access")) {
      return "Access";
    }

    return "None";
  } catch (error) {
    console.error(error);

    return "None";
  }
};
