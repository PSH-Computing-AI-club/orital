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
    readonly isRaisingHand: boolean;

    readonly room: IRoom;

    readonly state: IAttendeeUserStates;
}

export interface IAttendeeContextProviderProps extends PropsWithChildren {
    readonly initialContextData: IAttendeeContext;
}

function useMessageHandler(
    context: IAttendeeContext,
): (message: IAttendeeUserMessages) => void {
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

                case "self.banned":
                    navigate("/messages/rooms/banned");

                    break;

                case "self.kicked":
                    navigate("/messages/rooms/kicked");

                    break;

                case "self.rejected":
                    navigate("/messages/rooms/rejected");

                    break;
            }
        },
        [navigate],
    );
}

function useMessageReducer(
    initialContextData: IAttendeeContext,
): [IAttendeeContext, ActionDispatch<[IAttendeeUserMessages]>] {
    return useReducer((context, message) => {
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

            case "self.hand": {
                const {isRaisingHand} = data;

                return {
                    ...context,

                    isRaisingHand,
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
    }, initialContextData);
}

export function AttendeeContextProvider(props: IAttendeeContextProviderProps) {
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
            const message = JSON.parse(event.data) as IAttendeeUserMessages;

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
        () => buildWebSocketURL(`/rooms/${roomID}/attendee/events`),
        [roomID],
    );

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
