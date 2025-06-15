import type {PropsWithChildren} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from "react";

import type {
    IAttendeeUserMessages,
    IAttendeeUserStates,
    IRoomStates,
} from "~/.server/services/room_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_ATTENDEE = createContext<IAttendeeContext | null>(null);

export interface IRoom {
    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IAttendeeContext {
    readonly room: IRoom;

    readonly state: IAttendeeUserStates;
}

export interface IAttendeeContextProviderProps extends PropsWithChildren {
    readonly initialContextData: IAttendeeContext;
}

function contextReducer(
    context: IAttendeeContext,
    message: IAttendeeUserMessages,
): IAttendeeContext {
    const {data, event} = message;

    switch (event) {
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
            throw new TypeError(
                `bad argument #1 to 'contextReducer' (event type '${event}' not recognized)`,
            );
    }
}

export function AttendeeContextProvider(props: IAttendeeContextProviderProps) {
    const {children, initialContextData} = props;
    const [context, dispatch] = useReducer(contextReducer, initialContextData);

    const onError = useCallback((event: Event) => {
        // **TODO:** handle error here somehow

        console.error(event);
    }, []);

    const onMessage = useCallback(async (event: MessageEvent) => {
        const message = JSON.parse(event.data) as IAttendeeUserMessages;

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
        buildWebSocketURL(`/rooms/${context.room.roomID}/attendee/events`),
        useWebSocketOptions,
    );

    return (
        <CONTEXT_ATTENDEE.Provider value={context}>
            {children}
        </CONTEXT_ATTENDEE.Provider>
    );
}

export function useAttendeeContext(): IAttendeeContext {
    const context = useContext(CONTEXT_ATTENDEE);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useAttendeeContext' (not a child of 'AttendeeContextProvider')`,
        );
    }

    return context;
}
