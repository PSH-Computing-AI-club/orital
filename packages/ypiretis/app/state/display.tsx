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
    IDisplayEntityMessages,
    IDisplayEntityStates,
    IRoomStates,
} from "~/.server/services/rooms_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_DISPLAY = createContext<IDisplayContext | null>(null);

export interface IRoom {
    readonly pin: string;

    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IDisplayContext {
    readonly room: IRoom;

    readonly state: IDisplayEntityStates;
}

export interface IDisplayContextProviderProps extends PropsWithChildren {
    readonly initialContextData: IDisplayContext;
}

function useMessageReducer(
    initialContextData: IDisplayContext,
): [IDisplayContext, ActionDispatch<[IDisplayEntityMessages]>] {
    return useReducer((context, message) => {
        const {data, event} = message;

        switch (event) {
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
    }, initialContextData);
}

function useMessageHandler(
    context: IDisplayContext,
): (message: IDisplayEntityMessages) => void {
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
                        navigate("/rooms/closed");
                    }

                    break;
            }
        },
        [navigate],
    );
}

export function DisplayContextProvider(props: IDisplayContextProviderProps) {
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
            const message = JSON.parse(event.data) as IDisplayEntityMessages;

            handleMessage(message);
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
        () => buildWebSocketURL(`/rooms/${roomID}/display/events`),
        [roomID],
    );

    useWebSocket(connectionURL, useWebSocketOptions);

    return (
        <CONTEXT_DISPLAY.Provider value={context}>
            {children}
        </CONTEXT_DISPLAY.Provider>
    );
}

export function useDisplayContext(): IDisplayContext {
    const context = useContext(CONTEXT_DISPLAY);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useDisplayContext' (not a child of 'DisplayContextProvider')`,
        );
    }

    return context;
}
