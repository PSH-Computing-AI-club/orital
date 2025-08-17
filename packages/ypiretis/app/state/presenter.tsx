import type {ActionDispatch, PropsWithChildren} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from "react";

import {useNavigate} from "react-router";

import type {
    IAttendeeUserStates,
    IDisplayEntityStates,
    IPresenterUserMessages,
    IPresenterUserStates,
    IRoomStates,
    ATTENDEE_USER_STATES,
} from "~/.server/services/rooms_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_PRESENTER = createContext<IPresenterContext | null>(null);

export type IUser = IBaseUser & IEntity;

export type IDisconnectedAttendee = IBaseUser & {
    readonly state: (typeof ATTENDEE_USER_STATES)["disposed"];
};

export interface IBaseUser {
    readonly accountID: string;

    readonly firstName: string;

    readonly lastName: string;
}

export interface IEntity {
    readonly entityID: number;
}

export interface IDisplay extends IEntity {
    readonly state: IDisplayEntityStates;
}

export interface IAttendee extends IUser {
    readonly isRaisingHand: boolean;

    readonly state: IAttendeeUserStates;
}

export interface IRoom {
    readonly attendees: IAttendee[];

    readonly disconnectedAttendees: IDisconnectedAttendee[];

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

function useMessageHandler(
    context: IPresenterContext,
): (message: IPresenterUserMessages) => void {
    const contextRef = useRef(context);
    const navigate = useNavigate();

    useEffect(() => {
        contextRef.current = context;
    }, [context]);

    return useCallback(
        (message) => {
            const {data, event} = message;

            switch (event) {
                case "room.stateUpdate":
                    if (data.state === "STATE_DISPOSED") {
                        navigate("/messages/rooms/closed");
                    }

                    break;
            }
        },

        [navigate],
    );
}

function useMessageReducer(
    initialContextData: IPresenterContext,
): [IPresenterContext, ActionDispatch<[IPresenterUserMessages]>] {
    return useReducer((context, message) => {
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
                const {attendees, disconnectedAttendees} = room;

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
                                isRaisingHand: false,
                                lastName,
                                state,
                            },
                        ],

                        disconnectedAttendees: disconnectedAttendees.filter(
                            (disconnectedAttendee) =>
                                disconnectedAttendee.accountID !== accountID,
                        ),
                    },
                };
            }

            case "room.attendeeDisposed": {
                const {entityID} = data;

                const {room} = context;
                const attendees = [...room.attendees];

                const removedAtteendeeIndex = attendees.findIndex(
                    (attendee) => attendee.entityID === entityID,
                );

                const {accountID, firstName, lastName} =
                    attendees[removedAtteendeeIndex];

                const disconnectedAttendees = [
                    ...room.disconnectedAttendees,

                    {
                        accountID,
                        firstName,
                        lastName,
                        state: "STATE_DISPOSED",
                    } satisfies IDisconnectedAttendee,
                ];

                attendees.splice(removedAtteendeeIndex, 1);

                return {
                    ...context,

                    room: {
                        ...room,

                        attendees,
                        disconnectedAttendees,
                    },
                };
            }

            case "attendeeUser.handUpdate": {
                const {entityID, isRaisingHand} = data;

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

                                    isRaisingHand,
                                };
                            }

                            return attendee;
                        }),
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

            default:
                // **HACK:** `useMessageReducer` will receive actions that do not mutate
                // client state. That is, actions that are handled by `useMessageHandler`.
                // In that case, `useMessageReducer` will no-op those actions.
                //
                // This allows `useMessageReducer` to remain a simple switch-case and not
                // have to worry about maining a constant global to differentiate between
                // mutation actions and command actions.
                return context;
        }
    }, initialContextData);
}

export function PresenterContextProvider(
    props: IPresenterContextProviderProps,
) {
    const {children, initialContextData} = props;

    const [context, reduceMessage] = useMessageReducer(initialContextData);
    const handleMessage = useMessageHandler(context);

    const {room} = initialContextData;
    const {roomID} = room;

    const onError = useCallback((event: Event) => {
        // **TODO:** handle error here somehow

        console.error(event);
    }, []);

    const onMessage = useCallback(
        async (event: MessageEvent) => {
            const message = JSON.parse(event.data) as IPresenterUserMessages;

            handleMessage(message);
            reduceMessage(message);
        },

        [handleMessage, reduceMessage],
    );

    const useWebSocketOptions = useMemo<IUseWebSocketOptions>(
        () => ({
            onError,
            onMessage,

            maxRetries: 0,
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
