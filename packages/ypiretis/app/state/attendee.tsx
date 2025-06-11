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

import type {
    IEventSourceMessage,
    IEventSourceOptions,
} from "~/hooks/event_source";
import useEventSource from "~/hooks/event_source";

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

    const onOpen = useCallback(async (response: Response) => {
        if (!response.ok) {
            // **TODO:** error handle here somehow
        }
    }, []);

    const onMessage = useCallback(async (message: IEventSourceMessage) => {
        // **HACK:** This kind of sucks. That is, allocating a new object here.
        // But, this will allow us to bully TypeScript into recognizing the proper
        // `IPresenterUserMessages.event` / `IPresenterUserMessages.data` pairs.

        dispatch({
            event: message.event,
            data: JSON.parse(message.data),
        } as IAttendeeUserMessages);
    }, []);

    const eventSourceOptions = useMemo<IEventSourceOptions>(
        () => ({
            onmessage: onMessage,
            onopen: onOpen,
        }),

        [onMessage, onOpen],
    );

    useEventSource(`/rooms/${room.roomID}/attendee/events`, eventSourceOptions);

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
