export interface Merchant {
  name: string;
  category: string;
  location: { lat: number; lng: number };
}

export const IN_PERSON_MERCHANTS: Merchant[] = [
  { name: "Starbucks", category: "Coffee & Cafes", location: { lat: 51.5074, lng: -0.1278 } },
  { name: "Tesco", category: "Groceries", location: { lat: 51.5155, lng: -0.1410 } },
  { name: "Pret A Manger", category: "Coffee & Cafes", location: { lat: 51.5120, lng: -0.1235 } },
  { name: "McDonald's", category: "Fast Food", location: { lat: 51.5090, lng: -0.1340 } },
  { name: "Zara", category: "Clothing", location: { lat: 51.5145, lng: -0.1445 } },
  { name: "Boots", category: "Health & Beauty", location: { lat: 51.5100, lng: -0.1300 } },
];

export const ONLINE_MERCHANTS: Merchant[] = [
  { name: "Amazon", category: "Online Shopping", location: { lat: 0, lng: 0 } },
  { name: "ASOS", category: "Clothing", location: { lat: 0, lng: 0 } },
  { name: "Deliveroo", category: "Food Delivery", location: { lat: 0, lng: 0 } },
  { name: "Uber Eats", category: "Food Delivery", location: { lat: 0, lng: 0 } },
  { name: "Netflix", category: "Subscriptions", location: { lat: 0, lng: 0 } },
  { name: "Steam", category: "Gaming", location: { lat: 0, lng: 0 } },
];
