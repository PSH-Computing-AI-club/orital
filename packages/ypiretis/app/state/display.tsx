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
    IDisplayEntityMessages,
} from "~/.server/services/room_service";

import type {IUseWebSocketOptions} from "~/hooks/web_socket";
import useWebSocket from "~/hooks/web_socket";

import {buildWebSocketURL} from "~/utils/url";

const CONTEXT_DISPLAY = createContext<IRoom | null>(null);

export interface IRoom {
    readonly pin: string;

    readonly roomID: string;

    readonly state: IRoomStates;

    readonly title: string;
}

export interface IDisplayContextProviderProps extends PropsWithChildren {
    readonly initialRoomData: IRoom;
}

function roomReducer(room: IRoom, message: IDisplayEntityMessages): IRoom {
    const {data, event} = message;

    switch (event) {
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
    }

    return room;
}

export function DisplayContextProvider(props: IDisplayContextProviderProps) {
    const {children, initialRoomData} = props;
    const [room, dispatch] = useReducer(roomReducer, initialRoomData);

    const onError = useCallback((event: Event) => {
        // **TODO:** handle error here somehow

        console.error(event);
    }, []);

    const onMessage = useCallback(async (event: MessageEvent) => {
        const message = JSON.parse(event.data) as IDisplayEntityMessages;

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
        buildWebSocketURL(`/rooms/${room.roomID}/display/events`),
        useWebSocketOptions,
    );

    return (
        <CONTEXT_DISPLAY.Provider value={room}>
            {children}
        </CONTEXT_DISPLAY.Provider>
    );
}

export function useDisplayContext(): IRoom {
    const context = useContext(CONTEXT_DISPLAY);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useDisplayContext' (not a child of 'DisplayContextProvider')`,
        );
    }

    return context;
}
