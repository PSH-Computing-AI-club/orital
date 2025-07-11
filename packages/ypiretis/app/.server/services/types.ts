export interface IPaginationOptions {
    readonly limit: number;

    readonly page: number;
}

export interface IPaginationResults {
    readonly page: number;

    readonly pages: number;
}
