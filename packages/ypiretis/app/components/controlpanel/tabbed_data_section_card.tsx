import type {SegmentGroupValueChangeDetails} from "@chakra-ui/react";
import {SegmentGroup} from "@chakra-ui/react";

import type {ReactNode} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import type {ISectionCardRootProps} from "./section_card";
import SectionCard from "./section_card";

const TabbedDataSectionCardContext =
    createContext<ITabbedDataSectionCardContext<unknown> | null>(null);

interface IRegisteredTab<T> {
    readonly label: string;

    readonly provider: ITabbedDataSectionCardProvider<T>;
}

interface ITabbedDataSectionCardContext<T> {
    readonly selectedTab: string | null;

    readonly tabs: Map<string, IRegisteredTab<T>>;

    registerTab(
        id: string,
        label: string,
        providier: ITabbedDataSectionCardProvider<T>,
    ): void;

    setSelectedTab(value: string | null): void;

    unregisterTab(value: string): void;
}

export type ITabbedDataSectionCardProvider<T> = () => T;

export interface ITabbedDataSectionCardViewProps<T> {
    children(data: T): ReactNode;
}

export interface ITabbedDataSectionCardTabProps<T> {
    readonly id?: string;

    readonly label: string;

    provider(): T;
}

export interface ITabbedDataSectionCardRootProps extends ISectionCardRootProps {
    readonly children: ReactNode;
}

function useTabbedDataSectionCardContext<
    T,
>(): ITabbedDataSectionCardContext<T> {
    const context = useContext(
        TabbedDataSectionCardContext,
    ) as ITabbedDataSectionCardContext<T> | null;

    if (!context) {
        throw new ReferenceError(
            `bad dispatch to 'useTabbedDataSectionCardContext' (not a child of 'TabbedDataSectionCard.Root')`,
        );
    }

    return context;
}

function TabbedDataSectionCardView<T>(
    props: ITabbedDataSectionCardViewProps<T>,
) {
    const {children} = props;
    const {selectedTab, tabs} = useTabbedDataSectionCardContext<T>();

    const tab = selectedTab ? tabs.get(selectedTab) : null;
    const data = tab?.provider() ?? null;

    return data ? <>{children(data)}</> : <></>;
}

function TabbedDataSectionCardTab<T>(props: ITabbedDataSectionCardTabProps<T>) {
    const {label, provider, id = label} = props;

    const {registerTab, unregisterTab} = useTabbedDataSectionCardContext<T>();

    useEffect(() => {
        registerTab(id, label, provider);
    }, [id, label, provider, registerTab]);

    useEffect(() => {
        return () => {
            unregisterTab(id);
        };
    }, [id, unregisterTab]);

    return <></>;
}

function TabbedDataSectionCardTabs() {
    const {selectedTab, setSelectedTab, tabs} =
        useTabbedDataSectionCardContext();

    const onTabSelected = useCallback(
        ((details) => {
            const {value} = details;

            setSelectedTab(value);
        }) satisfies (details: SegmentGroupValueChangeDetails) => void,

        [setSelectedTab],
    );

    return (
        <SegmentGroup.Root
            value={selectedTab}
            size="sm"
            fontWeight="normal"
            onValueChange={onTabSelected}
        >
            <SegmentGroup.Indicator bg="bg" />

            {Array.from(tabs.entries()).map((entry) => {
                const [id, tab] = entry;
                const {label} = tab;

                const isTabSelected = selectedTab === id;

                return (
                    <SegmentGroup.Item
                        key={id}
                        value={id}
                        cursor={isTabSelected ? "default" : "pointer"}
                    >
                        <SegmentGroup.ItemHiddenInput />

                        <SegmentGroup.ItemText
                            color={isTabSelected ? "cyan.fg" : undefined}
                        >
                            {label}
                        </SegmentGroup.ItemText>
                    </SegmentGroup.Item>
                );
            })}
        </SegmentGroup.Root>
    );
}

function TabbedDataSectionCardRoot<T>(props: ITabbedDataSectionCardRootProps) {
    const {children, ...rest} = props;

    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [tabs, setTabs] = useState<Map<string, IRegisteredTab<T>>>(new Map());

    const registerTab = useCallback(
        ((id, label, provider) => {
            setTabs((previousTabs) => {
                const newTabs = new Map(previousTabs);

                newTabs.set(id, {
                    label,
                    provider,
                });

                return newTabs;
            });

            setSelectedTab((selectedTab) => {
                return selectedTab ?? id;
            });
        }) satisfies ITabbedDataSectionCardContext<T>["registerTab"],

        [setSelectedTab, setTabs],
    );

    const unregisterTab = useCallback(
        ((id) => {
            setTabs((previousTabs) => {
                const newTabs = new Map(previousTabs);

                newTabs.delete(id);
                return newTabs;
            });
        }) satisfies ITabbedDataSectionCardContext<T>["unregisterTab"],

        [setTabs],
    );

    const context = useMemo(() => {
        return {
            registerTab,
            selectedTab,
            setSelectedTab,
            tabs,
            unregisterTab,
        } satisfies ITabbedDataSectionCardContext<T>;
    }, [registerTab, selectedTab, tabs, unregisterTab]);

    return (
        <TabbedDataSectionCardContext.Provider value={context}>
            <SectionCard.Root {...rest}>{children}</SectionCard.Root>
        </TabbedDataSectionCardContext.Provider>
    );
}

const TabbedDataSectionCard = {
    ...SectionCard,

    Root: TabbedDataSectionCardRoot,
    Tab: TabbedDataSectionCardTab,
    Tabs: TabbedDataSectionCardTabs,
    View: TabbedDataSectionCardView,
} as const;

export default TabbedDataSectionCard;
