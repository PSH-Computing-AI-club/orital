import ENVIRONMENT from "../configuration/environment";

const {CryptoHasher} = Bun;

const {SECRET_KEY, SECRET_SALT} = ENVIRONMENT;

export function generatePIN(): string {
    const buffer = new Uint8Array(6);

    crypto.getRandomValues(buffer);

    return Array.from(buffer)
        .map((value) => (value % 36).toString(36).toUpperCase())
        .join("");
}

export function hashSecret(secret: string): string {
    const hasher = new CryptoHasher("sha256", SECRET_KEY.expose());

    hasher.update(secret + SECRET_SALT, "utf-8");
    return hasher.digest("hex");
}
