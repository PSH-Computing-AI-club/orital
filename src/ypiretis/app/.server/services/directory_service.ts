interface IExternalDirectoryLookup {
    readonly ["given-name"]: string;

    readonly ["surname"]: string;
}

export interface IDirectoryLookup {
    readonly firstName: string;

    readonly lastName: string;
}

export async function lookupAccountID(
    accountID: string,
): Promise<IDirectoryLookup> {
    const response = await fetch(
        `https://directory-service.k8s.psu.edu/directory-service-web/resources/people/${accountID}`,
    );

    const lookup = (await response.json()) as IExternalDirectoryLookup;

    return {
        firstName: lookup["given-name"],
        lastName: lookup["surname"],
    };
}
