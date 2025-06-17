import type {PropsWithChildren} from "react";
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
    IAttendeeUserMessages,
    IAttendeeUserStates,
    IRoomStates,
} from "~/.server/services/rooms_service";

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

function messageReducer(
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
    }

    return context;
}

function useMessageHandler(): (
    context: IAttendeeContext,
    message: IAttendeeUserMessages,
) => void {
    const navigate = useNavigate();

    return useCallback(
        (_context, message) => {
            const {data: _data, event} = message;

            switch (event) {
                case "self.banned":
                    navigate("/rooms/banned");

                    break;

                case "self.kicked":
                    navigate("/rooms/kicked");

                    break;

                case "self.rejected":
                    navigate("/rooms/rejected");

                    break;
            }
        },
        [navigate],
    );
}

export function AttendeeContextProvider(props: IAttendeeContextProviderProps) {
    const {children, initialContextData} = props;

    const handleMessage = useMessageHandler();
    const [context, reduceMessage] = useReducer(
        messageReducer,
        initialContextData,
    );

    const contextRef = useRef(context);

    const {room} = initialContextData;
    const {roomID} = room;

    const onError = useCallback((event: Event) => {
        // **TODO:** handle error here somehow

        console.error(event);
    }, []);

    const onMessage = useCallback(
        async (event: MessageEvent) => {
            const context = contextRef.current;
            const message = JSON.parse(event.data) as IAttendeeUserMessages;

            handleMessage(context, message);
            reduceMessage(message);
        },
        [handleMessage, reduceMessage],
    );

    const useWebSocketOptions = useMemo<IUseWebSocketOptions>(
        () => ({
            onError,
            onMessage,
        }),

        [onError, onMessage],
    );

    const connectionURL = useMemo<URL>(
        () => buildWebSocketURL(`/rooms/${roomID}/attendee/events`),
        [roomID],
    );

    useEffect(() => {
        contextRef.current = context;
    }, [context]);

    useWebSocket(connectionURL, useWebSocketOptions);

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
