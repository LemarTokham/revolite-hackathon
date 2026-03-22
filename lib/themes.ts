export interface BankTheme {
  id: string;
  name: string;
  provider: string;
  primaryColor: string;
  accentColor: string;
  savingsColor: string;
}

const themes: Record<string, BankTheme> = {
  "rev-o-trot": {
    id: "rev-o-trot",
    name: "Rev-O-Trot",
    provider: "REV-O-TROT",
    primaryColor: "#0666eb",
    accentColor: "#0555cc",
    savingsColor: "#22c55e",
  },
  "hay-chsbc": {
    id: "hay-chsbc",
    name: "Hay-CHSBC",
    provider: "HAY-CHSBC",
    primaryColor: "#db0011",
    accentColor: "#b3000e",
    savingsColor: "#22c55e",
  },
  "mane-zo": {
    id: "mane-zo",
    name: "Mane-Zo",
    provider: "MANE-ZO",
    primaryColor: "#14b8a6",
    accentColor: "#0d9488",
    savingsColor: "#22c55e",
  },
  "buck-lays": {
    id: "buck-lays",
    name: "Buck-Lays",
    provider: "BUCK-LAYS",
    primaryColor: "#00aeef",
    accentColor: "#0095cc",
    savingsColor: "#22c55e",
  },
};

export function getTheme(): BankTheme {
  const themeId = process.env.BANK_THEME || "rev-o-trot";
  return themes[themeId] || themes["rev-o-trot"];
}
