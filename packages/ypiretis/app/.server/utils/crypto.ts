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
] as const;

export function generateRandomNumberBatch(
    amountOfNumbers: number,
    rangeMax: number,
    rangeMin: number = 0,
    bufferBatchSize: number = amountOfNumbers * 2,
): number[] {
    const numbers: number[] = [];
    const buffer = new Uint8Array(bufferBatchSize);

    const rangeSize = rangeMax - rangeMin;
    const byteThreshold = Math.floor(256 / rangeSize) * rangeSize;

    while (numbers.length < amountOfNumbers) {
        crypto.getRandomValues(buffer);

        for (const byte of buffer) {
            if (byte < byteThreshold) {
                const offset = byte % rangeSize;

                numbers.push(rangeMin + offset);

                if (numbers.length === amountOfNumbers) {
                    return numbers;
                }
            }
        }
    }

    return numbers;
}

export function generatePIN(): string {
    const indices = generateRandomNumberBatch(6, PIN_ALPHABET.length);

    return indices.map((index) => PIN_ALPHABET[index]).join("");
}

export function hashSecret(secret: string): string {
    const hasher = new CryptoHasher("sha256", SECRET_KEY.expose());

    hasher.update(secret + SECRET_SALT, "utf-8");
    return hasher.digest("hex");
}
