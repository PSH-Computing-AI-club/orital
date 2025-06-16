export class EntityConnectionError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityConnectionError.name;
    }
}

export class EntityDisposedError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityDisposedError.name;
    }
}

export class EntityStateError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = EntityStateError.name;
    }
}

export class InvalidEntityTypeError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = InvalidEntityTypeError.name;
    }
}

export class RoomStateError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);

        this.name = RoomStateError.name;
    }
}
