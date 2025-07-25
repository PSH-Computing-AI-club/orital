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
        title: string,
        providier: ITabbedDataSectionCardProvider<T>,
    ): void;

    setSelectedTab(title: string | null): void;

    unregisterTab(title: string): void;
}

export type ITabbedDataSectionCardProvider<T> = () => T;

export interface ITabbedDataSectionCardViewProps<T> {
    children(data: T): ReactNode;
}

export interface ITabbedDataSectionCardTabProps<T> {
    readonly title: string;

    provider(): T;
}

export interface ITabbedDataSectionCardTabsProps {}

export interface ITabbedDataSectionCardRootProps extends ISectionCardRootProps {
    readonly children: ReactNode;
}

function useTabbedDataSectionCard<T>(): ITabbedDataSectionCardContext<T> {
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
    const {selectedTab, tabs} = useTabbedDataSectionCard<T>();

    const provider = selectedTab ? tabs.get(selectedTab) : null;
    const data = provider ? provider() : null;

    return data ? <>{children(data)}</> : <></>;
}

function TabbedDataSectionCardTab<T>(props: ITabbedDataSectionCardTabProps<T>) {
    const {title, provider} = props;
    const {registerTab, unregisterTab} = useTabbedDataSectionCard<T>();

    useEffect(() => {
        registerTab(title, provider);

        return () => {
            unregisterTab(title);
        };
    }, [title, provider, registerTab, unregisterTab]);

    return <></>;
}

function TabbedDataSectionCardTabs() {
    const {selectedTab, setSelectedTab, tabs} = useTabbedDataSectionCard();

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

            {Array.from(tabs.keys()).map((tabTitle) => {
                const isTabSelected = selectedTab === tabTitle;

                return (
                    <SegmentGroup.Item
                        key={tabTitle}
                        value={tabTitle}
                        cursor={isTabSelected ? "default" : "pointer"}
                    >
                        <SegmentGroup.ItemHiddenInput />

                        <SegmentGroup.ItemText
                            color={isTabSelected ? "cyan.fg" : undefined}
                        >
                            {tabTitle}
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
        ((title, provider) => {
            setTabs((previousTabs) => {
                const newTabs = new Map<
                    string,
                    ITabbedDataSectionCardProvider<T>
                >(previousTabs);

                newTabs.set(title, provider);

                return newTabs;
            });

            setSelectedTab((selectedTitle) => {
                return selectedTitle ?? title;
            });
        }) satisfies ITabbedDataSectionCardContext<T>["registerTab"],

        [setSelectedTab, setTabs],
    );

    const unregisterTab = useCallback(
        ((title) => {
            setTabs((previousTabs) => {
                const newTabs = new Map<
                    string,
                    ITabbedDataSectionCardProvider<T>
                >(previousTabs);

                newTabs.delete(title);

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
