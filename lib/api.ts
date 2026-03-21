// TODO: Replace with real app's API endpoint
const API_URL = "http://localhost:4000/api/spend";

export async function triggerSpend(
  type: "in-person" | "online",
  amount: number
) {
  console.log(`Spend triggered: ${type}, £${amount.toFixed(2)}`);

  // TODO: Uncomment when real app's API is ready
  // const res = await fetch(API_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ type, amount }),
  // });
  // return res.json();

  await new Promise((resolve) => setTimeout(resolve, 800));
  return { success: true, type, amount };
}
