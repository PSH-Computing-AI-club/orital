import * as v from "valibot";

const DIRECTORY_SERVICE_URL_TEMPLATE = ({accountID}: {accountID: string}) =>
    new URL(
        `https://directory-service.k8s.psu.edu/directory-service-web/resources/people/${accountID}`,
    );

const DIRECTORY_LOOKUP_SCHEMA = v.pipe(
    v.object({
        "given-name": v.pipe(v.string(), v.nonEmpty()),
        surname: v.pipe(v.string(), v.nonEmpty()),
    }),

    v.transform((input) => {
        const {["given-name"]: givenName, surname: surName} = input;

        return {
            firstName: givenName,
            lastName: surName,
        } as const;
    }),
);

export type IDirectoryLookup = v.InferOutput<typeof DIRECTORY_LOOKUP_SCHEMA>;

export class DirectoryLookupBadResponseError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        this.name = DirectoryLookupBadResponseError.name;
    }
}

export class DirectoryLookupMalformedResponseError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        this.name = DirectoryLookupMalformedResponseError.name;
    }
}

export class DirectoryLookupInvalidResponseError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        this.name = DirectoryLookupInvalidResponseError.name;
    }
}

export async function lookupByAccountID(
    accountID: string,
): Promise<IDirectoryLookup> {
    const accountDirectoryURL = DIRECTORY_SERVICE_URL_TEMPLATE({accountID});
    const response = await fetch(accountDirectoryURL);

    if (!response.ok) {
        throw new DirectoryLookupBadResponseError(
            `bad dispatch to 'lookupByAccountID' (response had a '${response.status}' status code)`,
        );
    }

    let lookup: unknown;

    try {
        lookup = await response.json();
    } catch (error) {
        throw new DirectoryLookupMalformedResponseError(
            `bad dispatch to 'lookupByAccountID' (failed to parse response as JSON):\n${(error as Error).name}: ${(error as Error).message}`,
        );
    }

    try {
        return v.parse(DIRECTORY_LOOKUP_SCHEMA, lookup);
    } catch (error) {
        throw new DirectoryLookupInvalidResponseError(
            `bad dispatch to 'lookupByAccountID' (failed to validate response JSON):\n${(error as Error).name}: ${(error as Error).message}`,
        );
    }
}
