import fs from "fs";
import path from "path";

export interface Transaction {
  id: string;
  type: "in-person" | "online";
  amount: number;
  merchant: string;
  category: string;
  location: { lat: number; lng: number };
  timestamp: string;
  balanceAfter: number;
}

export interface PotTransaction {
  id: string;
  amount: number;
  merchant: string;
  timestamp: string;
  balanceAfter: number;
}

export interface UserState {
  balance: number;
  potBalance: number;
  transactions: Transaction[];
  potTransactions: PotTransaction[];
  taxPercentage: number;
  accessToken: string | null;
  refreshToken: string | null;
  accountNumber: string | null;
  sortCode: string | null;
}

// Map of username -> their state
interface AllState {
  currentUser: string | null;
  users: Record<string, UserState>;
}


// Each bank theme gets its own state file
const themeId = process.env.BANK_THEME || "rev-o-trot";
const DATA_DIR = process.env.DATA_DIR || process.cwd();
const STATE_FILE = path.join(DATA_DIR, `.bank-state-${themeId}.json`);

function newUserState(): UserState {
  return {
    balance: 1000.0,
    potBalance: 0.0,
    transactions: [],
    potTransactions: [],
    taxPercentage: 0,
    accessToken: null,
    refreshToken: null,
    accountNumber: null,
    sortCode: null,
  };
}

function loadAll(): AllState {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.users || typeof parsed.users !== "object") {
      return { currentUser: null, users: {} };
    }
    return parsed;
  } catch {
    return { currentUser: null, users: {} };
  }
}

// write to file
function saveAll(s: AllState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

// Get the state for a specific user (creates it if it doesn't exist)
export function getUserState(username: string): UserState {
  const all = loadAll();
  // check if the user exists
  if (!all.users[username]) {
    all.users[username] = newUserState(); // create new state for this user if not exists
    saveAll(all);
  }
  return all.users[username];
}

// Update the state for a specific user
export function setUserState(username: string, updates: Partial<UserState>): void {
  const all = loadAll();
  if (!all.users[username]) {
    all.users[username] = newUserState();
  }
  all.users[username] = { ...all.users[username], ...updates };
  saveAll(all);
}

// Track who is currently using the fake bank UI
export function getCurrentUser(): string | null {
  return loadAll().currentUser;
}

export function setCurrentUser(username: string | null): void {
  const all = loadAll();
  all.currentUser = username;
  saveAll(all);
}
