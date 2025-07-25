import type {SegmentGroupValueChangeDetails} from "@chakra-ui/react";
import {SegmentGroup} from "@chakra-ui/react";

import type {ReactNode} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import type {ISectionCardRootProps} from "./section_card";
import SectionCard from "./section_card";

const TabbedDataSectionCardContext =
    createContext<ITabbedDataSectionCardContext<unknown> | null>(null);

interface ITabbedDataSectionCardContext<T> {
    readonly selectedTab: string | null;

    readonly tabs: Map<string, ITabbedDataSectionCardProvider<T>>;

    registerTab(
        label: string,
        providier: ITabbedDataSectionCardProvider<T>,
    ): void;

    setSelectedTab(label: string | null): void;

    unregisterTab(label: string): void;
}

export type ITabbedDataSectionCardProvider<T> = () => T;

export interface ITabbedDataSectionCardViewProps<T> {
    children(data: T): ReactNode;
}

export interface ITabbedDataSectionCardTabProps<T> {
    readonly label: string;

    provider(): T;
}

export interface ITabbedDataSectionCardTabsProps {}

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

    const provider = selectedTab ? tabs.get(selectedTab) : null;
    const data = provider ? provider() : null;

    return data ? <>{children(data)}</> : <></>;
}

function TabbedDataSectionCardTab<T>(props: ITabbedDataSectionCardTabProps<T>) {
    const {label, provider} = props;
    const {registerTab, unregisterTab} = useTabbedDataSectionCardContext<T>();

    useEffect(() => {
        registerTab(label, provider);

        return () => {
            unregisterTab(label);
        };
    }, [label, provider, registerTab, unregisterTab]);

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

            {Array.from(tabs.keys()).map((tabLabel) => {
                const isTabSelected = selectedTab === tabLabel;

                return (
                    <SegmentGroup.Item
                        key={tabLabel}
                        value={tabLabel}
                        cursor={isTabSelected ? "default" : "pointer"}
                    >
                        <SegmentGroup.ItemHiddenInput />

                        <SegmentGroup.ItemText
                            color={isTabSelected ? "cyan.fg" : undefined}
                        >
                            {tabLabel}
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
    const [tabs, setTabs] = useState<
        Map<string, ITabbedDataSectionCardProvider<T>>
    >(new Map());

    const registerTab = useCallback(
        ((label, provider) => {
            setTabs((previousTabs) => {
                const newTabs = new Map<
                    string,
                    ITabbedDataSectionCardProvider<T>
                >(previousTabs);

                newTabs.set(label, provider);

                return newTabs;
            });

            setSelectedTab((selectedLabel) => {
                return selectedLabel ?? label;
            });
        }) satisfies ITabbedDataSectionCardContext<T>["registerTab"],

        [setSelectedTab, setTabs],
    );

    const unregisterTab = useCallback(
        ((label) => {
            setTabs((previousTabs) => {
                const newTabs = new Map<
                    string,
                    ITabbedDataSectionCardProvider<T>
                >(previousTabs);

                newTabs.delete(label);

                return newTabs;
            });
        }) satisfies ITabbedDataSectionCardContext<T>["unregisterTab"],

        [setTabs],
    );

    const context = {
        registerTab,
        selectedTab,
        setSelectedTab,
        tabs,
        unregisterTab,
    } satisfies ITabbedDataSectionCardContext<T>;

    useEffect(() => {
        if (selectedTab && !tabs.has(selectedTab)) {
            const {value: firstTab} = tabs.keys().next();

            setSelectedTab(firstTab ?? null);
        }
    }, [selectedTab, tabs]);

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
