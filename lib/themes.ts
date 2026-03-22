export interface BankTheme {
  id: string;
  name: string;
  provider: string;
  primaryColor: string;
  accentColor: string;
  savingsColor: string;
  // Design tokens
  bgColor: string;
  surfaceColor: string;
  cardColor: string;
  textColor: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  inputBg: string;
  inputBorder: string;
  isDark: boolean;
  favicon: string;
}

const themes: Record<string, BankTheme> = {
  "rev-o-trot": {
    id: "rev-o-trot",
    name: "Rev-O-Trot",
    provider: "REV-O-TROT",
    primaryColor: "#0666eb",
    accentColor: "#0555cc",
    savingsColor: "#22c55e",
    bgColor: "#000000",
    surfaceColor: "#0e0e0e",
    cardColor: "#161616",
    textColor: "#ffffff",
    textSecondary: "#8b8b8b",
    textMuted: "#555555",
    borderColor: "#222222",
    inputBg: "#111111",
    inputBorder: "#2a2a2a",
    isDark: true,
    favicon: "https://play-lh.googleusercontent.com/bo7Qeq8XZVI4hyXTVyG7Oi3hMiqADqruYeyQWqzzJzNHCYNVLmpAne0XP4_JH2AJ1tE",
  },
  "hay-chsbc": {
    id: "hay-chsbc",
    name: "Hay-CHSBC",
    provider: "HAY-CHSBC",
    primaryColor: "#db0011",
    accentColor: "#b3000e",
    savingsColor: "#16a34a",
    bgColor: "#f2f2f2",
    surfaceColor: "#ffffff",
    cardColor: "#ffffff",
    textColor: "#1a1a1a",
    textSecondary: "#666666",
    textMuted: "#999999",
    borderColor: "#e5e5e5",
    inputBg: "#ffffff",
    inputBorder: "#d1d5db",
    isDark: false,
    favicon: "https://create.hsbc/content/dam/brandhub/brand/ld-history/hexagon_1192x671.jpg",
  },
  "mane-zo": {
    id: "mane-zo",
    name: "Mane-Zo",
    provider: "MANE-ZO",
    primaryColor: "#14b8a6",
    accentColor: "#0d9488",
    savingsColor: "#22c55e",
    bgColor: "#000000",
    surfaceColor: "#0e0e0e",
    cardColor: "#161616",
    textColor: "#ffffff",
    textSecondary: "#8b8b8b",
    textMuted: "#555555",
    borderColor: "#222222",
    inputBg: "#111111",
    inputBorder: "#2a2a2a",
    isDark: true,
    favicon: "https://logos-world.net/wp-content/uploads/2021/09/Monzo-Emblem.png",
  },
  "buck-lays": {
    id: "buck-lays",
    name: "Buck-Lays",
    provider: "BUCK-LAYS",
    primaryColor: "#00aeef",
    accentColor: "#0095cc",
    savingsColor: "#22c55e",
    bgColor: "#000000",
    surfaceColor: "#0e0e0e",
    cardColor: "#161616",
    textColor: "#ffffff",
    textSecondary: "#8b8b8b",
    textMuted: "#555555",
    borderColor: "#222222",
    inputBg: "#111111",
    inputBorder: "#2a2a2a",
    isDark: true,
    favicon: "https://companieslogo.com/img/orig/BCS-745d30bf.png?t=1720244491",
  },
};

export function getTheme(): BankTheme {
  const themeId = process.env.BANK_THEME || "rev-o-trot";
  return themes[themeId] || themes["rev-o-trot"];
}
