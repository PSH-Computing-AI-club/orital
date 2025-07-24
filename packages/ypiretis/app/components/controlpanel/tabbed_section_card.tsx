import type {SegmentGroupValueChangeDetails} from "@chakra-ui/react";
import {SegmentGroup} from "@chakra-ui/react";

import type {PropsWithChildren, ReactNode} from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import type {ISectionCardRootProps} from "./section_card";
import SectionCard from "./section_card";

const TabbedSectionCardContext =
    createContext<ITabbedSectionCardContext | null>(null);

interface ITabbedSectionCardContext {
    readonly selectedTab: string | null;

    readonly tabs: string[];

    setSelectedTab(title: string | null): void;

    registerTab(title: string): void;

    unregisterTab(title: string): void;
}

export interface ITabbedSectionCardViewProps extends PropsWithChildren {
    readonly title: string;
}

export interface ITabbedSectionCardTabsProps {}

export interface ITabbedSectionCardRootProps extends ISectionCardRootProps {
    readonly children: ReactNode;
}

function useTabbedSectionCard() {
    const context = useContext(TabbedSectionCardContext);

    if (!context) {
        throw new ReferenceError(
            `bad dispatch to 'useTabbedSectionCardContext' (not a child of 'TabbedSectionCard.Root')`,
        );
    }

    return context;
}

function TabbedSectionCardView(props: ITabbedSectionCardViewProps) {
    const {children, title} = props;
    const {registerTab, unregisterTab, selectedTab} = useTabbedSectionCard();

    useEffect(() => {
        registerTab(title);

        return () => {
            unregisterTab(title);
        };
    }, [registerTab, title, unregisterTab]);

    return selectedTab === title ? <>{children}</> : null;
}

function TabbedSectionCardTabs() {
    const {selectedTab, setSelectedTab, tabs} = useTabbedSectionCard();

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

            {tabs.map((tabTitle) => {
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

function TabbedSectionCardRoot(props: ITabbedSectionCardRootProps) {
    const {children, ...rest} = props;

    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [tabs, setTabs] = useState<string[]>([]);

    const registerTab = useCallback(
        ((title) => {
            setTabs((previousTabs) => {
                return [...previousTabs, title];
            });

            if (!selectedTab) {
                setSelectedTab(title);
            }
        }) satisfies ITabbedSectionCardContext["registerTab"],

        [selectedTab],
    );

    const unregisterTab = useCallback(
        ((title) => {
            setTabs((registeredTabs) =>
                registeredTabs.filter((registeredTitle) => {
                    return registeredTitle !== title;
                }),
            );
        }) satisfies ITabbedSectionCardContext["unregisterTab"],

        [setTabs],
    );

    const context = {
        selectedTab,
        setSelectedTab,
        registerTab,
        tabs,
        unregisterTab,
    } satisfies ITabbedSectionCardContext;

    return (
        <TabbedSectionCardContext.Provider value={context}>
            <SectionCard.Root {...rest}>{children}</SectionCard.Root>
        </TabbedSectionCardContext.Provider>
    );
}

const TabbedSectionCard = {
    ...SectionCard,

    Root: TabbedSectionCardRoot,
    Tabs: TabbedSectionCardTabs,
    View: TabbedSectionCardView,
} as const;

export default TabbedSectionCard;
