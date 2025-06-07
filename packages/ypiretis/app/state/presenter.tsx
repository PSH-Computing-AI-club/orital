import type {PropsWithChildren} from "react";
import {createContext, useCallback, useContext, useMemo, useState} from "react";

import type {
    IRoomStates,
    IPresenterUserNetworkEvents,
} from "~/.server/services/room_service";

import type {
    IEventSourceMessage,
    IEventSourceOptions,
} from "~/hooks/event_source";
import useEventSource from "~/hooks/event_source";

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

export function PresenterContextProvider(
    props: IPresenterContextProviderProps,
) {
    const {children, initialRoomData} = props;
    const [room, setRoom] = useState<IRoom>(initialRoomData);

    const onOpen = useCallback(async (response: Response) => {
        if (!response.ok) {
            // **TODO:** error handle here somehow
        }
    }, []);

    const onMessage = useCallback(async (message: IEventSourceMessage) => {
        const event = {
            event: message.event,
            data: JSON.parse(message.data),
        } as IPresenterUserNetworkEvents;

        switch (
            event.event
            // **TODO:** do stuff with `setRoom`
        ) {
        }
    }, []);

    const eventSourceOptions = useMemo<IEventSourceOptions>(
        () => ({
            init: {
                onmessage: onMessage,
                onopen: onOpen,
            },
        }),

        [onMessage, onOpen],
    );

    useEventSource(
        `/rooms/${room.roomID}/presenter/events`,
        eventSourceOptions,
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
