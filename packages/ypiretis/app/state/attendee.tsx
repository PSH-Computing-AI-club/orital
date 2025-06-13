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
    IAttendeeUserMessages,
} from "~/.server/services/room_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_ATTENDEE = createContext<IRoom | null>(null);

export interface IRoom {
    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IAttendeeContextProviderProps extends PropsWithChildren {
    readonly initialRoomData: IRoom;
}

function roomReducer(room: IRoom, message: IAttendeeUserMessages): IRoom {
    const {data, event} = message;

    switch (event) {
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

export function AttendeeContextProvider(props: IAttendeeContextProviderProps) {
    const {children, initialRoomData} = props;
    const [room, dispatch] = useReducer(roomReducer, initialRoomData);

    const onMessage = useCallback(async (event: MessageEvent) => {
        const message = JSON.parse(event.data) as IAttendeeUserMessages;

        dispatch(message);
    }, []);

    const useWebSocketOptions = useMemo<IUseWebSocketOptions>(
        () => ({
            onMessage,
        }),

        [onMessage],
    );

    useWebSocket(
        buildWebSocketURL(`/rooms/${room.roomID}/attendee/events`),
        useWebSocketOptions,
    );

    return (
        <CONTEXT_ATTENDEE.Provider value={room}>
            {children}
        </CONTEXT_ATTENDEE.Provider>
    );
}

export function useAttendeeContext(): IRoom {
    const context = useContext(CONTEXT_ATTENDEE);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useAttendeeContext' (not a child of 'AttendeeContextProvider')`,
        );
    }

    return context;
}
