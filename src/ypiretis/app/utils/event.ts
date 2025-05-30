// **IMPORTANT:** Do **NOT** use absolute imports in this module. It is
// imported by server-only modules.

export type IEventCallback<T> = (value: T) => void;

export interface IEventSubscription<T> {
    readonly callback: IEventCallback<T>;

    dispose(): void;
}

export interface IEvent<T> {
    dispatch(details: T): void;

    subscribe(callback: IEventCallback<T>): IEventSubscription<T>;
}

export class SubscriptionExistsError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = SubscriptionExistsError.name;
    }
}

export default function makeEvent<T>(): IEvent<T> {
    const subscribers: Set<IEventCallback<T>> = new Set();

    return {
        dispatch(details) {
            for (const callback of subscribers) {
                callback(details);
            }
        },

        subscribe(callback) {
            if (subscribers.has(callback)) {
                throw new SubscriptionExistsError(
                    `bad argument #0 to 'IEvent.subscribe' (function '${callback}' was already subscribed)`,
                );
            }

            subscribers.add(callback);

            return {
                callback,

                dispose() {
                    subscribers.delete(callback);
                },
            };
        },
    };
}
