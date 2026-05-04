export const createCheckoutSession = async (payload) => {

  const response = await fetch("/api/create-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Checkout failed");
  }

  return response.json();
};