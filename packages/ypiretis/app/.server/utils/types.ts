export type OmitViaRemap<T extends object, K> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
