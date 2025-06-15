import type {PropsWithChildren} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from "react";

import type {
    IAttendeeUserStates,
    IDisplayEntityStates,
    IPresenterUserMessages,
    IPresenterUserStates,
    IRoomStates,
} from "~/.server/services/room_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_PRESENTER = createContext<IPresenterContext | null>(null);

export interface IEntity {
    readonly entityID: number;
}

export interface IUser extends IEntity {
    readonly accountID: string;

    readonly entityID: number;

    readonly firstName: string;

    readonly lastName: string;
}

export interface IDisplay extends IEntity {
    readonly state: IDisplayEntityStates;
}

export interface IAttendee extends IUser {
    readonly state: IAttendeeUserStates;
}

export interface IRoom {
    readonly attendees: IAttendee[];

    readonly displays: IDisplay[];

    readonly pin: string;

    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IPresenterContext {
    readonly room: IRoom;

    readonly state: IPresenterUserStates;
}

export interface IPresenterContextProviderProps extends PropsWithChildren {
    readonly initialContextData: IPresenterContext;
}

function contextReducer(
    context: IPresenterContext,
    message: IPresenterUserMessages,
): IPresenterContext {
    const {data, event} = message;

    switch (event) {
        case "attendeeUser.stateUpdate": {
            const {entityID, state} = data;

            const {room} = context;
            const {attendees} = room;

            return {
                ...context,

                room: {
                    ...room,

                    attendees: attendees.map((attendee) => {
                        if (attendee.entityID === entityID) {
                            return {
                                ...attendee,

                                state,
                            };
                        }

                        return attendee;
                    }),
                },
            };
        }

        case "displayEntity.stateUpdate": {
            const {entityID, state} = data;

            const {room} = context;
            const {displays} = room;

            return {
                ...context,

                room: {
                    ...room,

                    displays: displays.map((display) => {
                        if (display.entityID === entityID) {
                            return {
                                ...display,

                                state,
                            };
                        }

                        return display;
                    }),
                },
            };
        }

        case "room.attendeeAdded": {
            const {accountID, entityID, firstName, lastName, state} = data;

            const {room} = context;
            const {attendees} = room;

            return {
                ...context,

                room: {
                    ...room,

                    attendees: [
                        ...attendees,

                        {
                            accountID,
                            entityID,
                            firstName,
                            lastName,
                            state,
                        },
                    ],
                },
            };
        }

        case "room.attendeeDisposed": {
            const {entityID} = data;

            const {room} = context;
            const {attendees} = room;

            return {
                ...context,

                room: {
                    ...room,

                    attendees: attendees.filter(
                        (attendee) => attendee.entityID !== entityID,
                    ),
                },
            };
        }

        case "room.displayAdded": {
            const {entityID, state} = data;

            const {room} = context;
            const {displays} = room;

            return {
                ...context,

                room: {
                    ...room,

                    displays: [
                        ...displays,

                        {
                            entityID,
                            state,
                        },
                    ],
                },
            };
        }

        case "room.displayDisposed": {
            const {entityID} = data;

            const {room} = context;
            const {displays} = room;

            return {
                ...context,

                room: {
                    ...room,

                    displays: displays.filter(
                        (display) => display.entityID !== entityID,
                    ),
                },
            };
        }

        case "room.pinUpdate": {
            const {pin} = data;
            const {room} = context;

            return {
                ...context,

                room: {
                    ...room,

                    pin,
                },
            };
        }

        case "room.stateUpdate": {
            const {state} = data;
            const {room} = context;

            return {
                ...context,

                room: {
                    ...room,

                    state,
                },
            };
        }

        case "room.titleUpdate": {
            const {title} = data;
            const {room} = context;

            return {
                ...context,

                room: {
                    ...room,

                    title,
                },
            };
        }

        case "self.stateUpdate": {
            const {state} = data;

            return {
                ...context,

                state,
            };
        }
    }

    return context;
}

export function PresenterContextProvider(
    props: IPresenterContextProviderProps,
) {
    const {children, initialContextData} = props;
    const [context, dispatch] = useReducer(contextReducer, initialContextData);

    const {room} = initialContextData;
    const {roomID} = room;

    const onError = useCallback((event: Event) => {
        // **TODO:** handle error here somehow

        console.error(event);
    }, []);

    const onMessage = useCallback(async (event: MessageEvent) => {
        const message = JSON.parse(event.data) as IPresenterUserMessages;

        dispatch(message);
    }, []);

    const useWebSocketOptions = useMemo<IUseWebSocketOptions>(
        () => ({
            onError,
            onMessage,
        }),

        [onError, onMessage],
    );

    const connectionURL = useMemo<URL>(
        () => buildWebSocketURL(`/rooms/${roomID}/presenter/events`),
        [roomID],
    );

    useWebSocket(connectionURL, useWebSocketOptions);

    return (
        <CONTEXT_PRESENTER.Provider value={context}>
            {children}
        </CONTEXT_PRESENTER.Provider>
    );
}

export function usePresenterContext(): IPresenterContext {
    const context = useContext(CONTEXT_PRESENTER);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'usePresenterContext' (not a child of 'PresenterContextProvider')`,
        );
    }

    return context;
}
