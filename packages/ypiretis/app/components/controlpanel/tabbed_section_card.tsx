import type {SegmentGroupValueChangeDetails} from "@chakra-ui/react";
import {Box, SegmentGroup} from "@chakra-ui/react";

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

    readonly tabs: Set<string>;

    registerTab(label: string): void;

    setSelectedTab(label: string | null): void;

    unregisterTab(label: string): void;
}

export interface ITabbedSectionCardViewProps extends PropsWithChildren {
    readonly label: string;
}

export interface ITabbedSectionCardTabsProps {}

export interface ITabbedSectionCardRootProps extends ISectionCardRootProps {
    readonly children: ReactNode;
}

function useTabbedSectionCardContext(): ITabbedSectionCardContext {
    const context = useContext(TabbedSectionCardContext);

    if (!context) {
        throw new ReferenceError(
            `bad dispatch to 'useTabbedSectionCardContext' (not a child of 'TabbedSectionCard.Root')`,
        );
    }

    return context;
}

function TabbedSectionCardView(props: ITabbedSectionCardViewProps) {
    const {children, label} = props;
    const {registerTab, unregisterTab, selectedTab} =
        useTabbedSectionCardContext();

    const isTabSelected = selectedTab === label;

    useEffect(() => {
        registerTab(label);

        return () => {
            unregisterTab(label);
        };
    }, [registerTab, label, unregisterTab]);

    return <Box display={isTabSelected ? "contents" : "none"}>{children}</Box>;
}

function TabbedSectionCardTabs() {
    const {selectedTab, setSelectedTab, tabs} = useTabbedSectionCardContext();

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

            {Array.from(tabs).map((tabLabel) => {
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

function TabbedSectionCardRoot(props: ITabbedSectionCardRootProps) {
    const {children, ...rest} = props;

    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [tabs, setTabs] = useState<Set<string>>(new Set());

    const registerTab = useCallback(
        ((label) => {
            setTabs((previousTabs) => {
                const newTabs = new Set(previousTabs);

                newTabs.add(label);

                return newTabs;
            });

            setSelectedTab((selectedLabel) => {
                return selectedLabel ?? label;
            });
        }) satisfies ITabbedSectionCardContext["registerTab"],

        [setSelectedTab, setTabs],
    );

    const unregisterTab = useCallback(
        ((label) => {
            setTabs((previousTabs) => {
                const newTabs = new Set(previousTabs);

                newTabs.delete(label);

                return newTabs;
            });
        }) satisfies ITabbedSectionCardContext["unregisterTab"],

        [setTabs],
    );

    const context = {
        registerTab,
        selectedTab,
        setSelectedTab,
        tabs,
        unregisterTab,
    } satisfies ITabbedSectionCardContext;

    useEffect(() => {
        if (selectedTab && !tabs.has(selectedTab)) {
            const [firstTab] = tabs;

            setSelectedTab(firstTab ?? null);
        }
    }, [selectedTab, tabs]);

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
