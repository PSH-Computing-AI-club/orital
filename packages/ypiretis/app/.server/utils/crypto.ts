import ENVIRONMENT from "../configuration/environment";

const {CryptoHasher} = Bun;

const {SECRET_KEY, SECRET_SALT} = ENVIRONMENT;

const PIN_ALPHABET = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "!",
    "@",
    "#",
    "$",
    "%",
    "&",
    "?",
    "=",
    "+",
    "~",
    "*",
] as const;

export function generatePIN(): string {
    const buffer = new Uint8Array(6);

    crypto.getRandomValues(buffer);

    return Array.from(buffer)
        .map((value) => PIN_ALPHABET[value % PIN_ALPHABET.length])
        .join("");
}

export function hashSecret(secret: string): string {
    const hasher = new CryptoHasher("sha256", SECRET_KEY.expose());

    hasher.update(secret + SECRET_SALT, "utf-8");
    return hasher.digest("hex");
}
