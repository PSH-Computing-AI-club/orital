export interface IIDPool {
    generateID(): number;

    releaseID(id: number): void;
}

export function makeIDPool(): IIDPool {
    const releasedIDs = new Set<number>();
    let counter = 1;

    return {
        generateID() {
            if (releasedIDs.size > 0) {
                const releaseID = releasedIDs.values().next().value!;

                releasedIDs.delete(releaseID);
                return releaseID;
            }

            return counter++;
        },

        releaseID(id) {
            releasedIDs.add(id);
        },
    };
}
