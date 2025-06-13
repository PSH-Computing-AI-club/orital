import type {PropsWithChildren} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from "react";

import type {
    IRoomStates,
    IPresenterUserMessages,
} from "~/.server/services/room_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_PRESENTER = createContext<IRoom | null>(null);

export interface IEntity {
    readonly entityID: number;
}

export interface IUser extends IEntity {
    readonly accountID: string;

    readonly entityID: number;

    readonly firstName: string;

    readonly lastName: string;
}

export interface IDisplay extends IEntity {}

export interface IAttendee extends IUser {}

export interface IRoom {
    readonly attendees: IAttendee[];

    readonly displays: IDisplay[];

    readonly pin: string;

    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IPresenterContextProviderProps extends PropsWithChildren {
    readonly initialRoomData: IRoom;
}

function roomReducer(room: IRoom, message: IPresenterUserMessages): IRoom {
    const {data, event} = message;

    switch (event) {
        case "room.attendeeAdded": {
            const {accountID, entityID, firstName, lastName} = data;

            return {
                ...room,

                attendees: [
                    ...room.attendees,

                    {
                        accountID,
                        entityID,
                        firstName,
                        lastName,
                    },
                ],
            };
        }

        case "room.attendeeDisposed": {
            const {entityID} = data;

            return {
                ...room,

                attendees: room.attendees.filter(
                    (attendee) => attendee.entityID !== entityID,
                ),
            };
        }

        case "room.displayAdded": {
            const {entityID} = data;

            return {
                ...room,
                displays: [
                    ...room.displays,

                    {
                        entityID,
                    },
                ],
            };
        }

        case "room.displayDisposed": {
            const {entityID} = data;

            return {
                ...room,

                displays: room.displays.filter(
                    (display) => display.entityID !== entityID,
                ),
            };
        }

        case "room.pinUpdate": {
            const {pin} = data;

            return {
                ...room,

                pin,
            };
        }

        case "room.stateUpdate": {
            const {state} = data;

            return {
                ...room,

                state,
            };
        }

        case "room.titleUpdate": {
            const {title} = data;

            return {
                ...room,

                title,
            };
        }

        default:
            throw new TypeError(
                `bad argument #1 to 'roomReducer' (event type '${event}' not recognized)`,
            );
    }
}

export function PresenterContextProvider(
    props: IPresenterContextProviderProps,
) {
    const {children, initialRoomData} = props;
    const [room, dispatch] = useReducer(roomReducer, initialRoomData);

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

    useWebSocket(
        buildWebSocketURL(`/rooms/${room.roomID}/presenter/events`),
        useWebSocketOptions,
    );

    return (
        <CONTEXT_PRESENTER.Provider value={room}>
            {children}
        </CONTEXT_PRESENTER.Provider>
    );
}

export function usePresenterContext(): IRoom {
    const context = useContext(CONTEXT_PRESENTER);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'usePresenterContext' (not a child of 'PresenterContextProvider')`,
        );
    }

    return context;
}
