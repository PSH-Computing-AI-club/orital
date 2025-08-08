import type {SegmentGroupValueChangeDetails} from "@chakra-ui/react";
import {Box, SegmentGroup} from "@chakra-ui/react";

import type {PropsWithChildren, ReactNode} from "react";
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

const TabbedSectionCardContext =
    createContext<ITabbedSectionCardContext | null>(null);

interface IRegisteredTab {
    readonly label: string;
}

interface ITabbedSectionCardContext {
    readonly selectedTab: string | null;

    readonly tabs: Map<string, IRegisteredTab>;

    registerTab(id: string, label: string): void;

    setSelectedTab(id: string | null): void;

    unregisterTab(id: string): void;
}

export interface ITabbedSectionCardViewProps extends PropsWithChildren {
    readonly id?: string;

    readonly label: string;
}

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
    const {children, label, id = label} = props;

    const {registerTab, unregisterTab, selectedTab} =
        useTabbedSectionCardContext();

    const isTabSelected = selectedTab === id;

    useEffect(() => {
        registerTab(id, label);

        return () => {
            unregisterTab(id);
        };
    }, [id, label, registerTab, unregisterTab]);

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

function TabbedSectionCardRoot(props: ITabbedSectionCardRootProps) {
    const {children, ...rest} = props;

    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [tabs, setTabs] = useState<Map<string, IRegisteredTab>>(new Map());

    const registerTab = useCallback(
        ((id, label) => {
            setTabs((previousTabs) => {
                const newTabs = new Map(previousTabs);

                newTabs.set(id, {
                    label,
                });

                return newTabs;
            });

            setSelectedTab((selectedTab) => {
                return selectedTab ?? id;
            });
        }) satisfies ITabbedSectionCardContext["registerTab"],

        [setSelectedTab, setTabs],
    );

    const unregisterTab = useCallback(
        ((id) => {
            setTabs((previousTabs) => {
                const newTabs = new Map(previousTabs);

                newTabs.delete(id);
                return newTabs;
            });
        }) satisfies ITabbedSectionCardContext["unregisterTab"],

        [setTabs],
    );

    const context = useMemo(() => {
        return {
            registerTab,
            selectedTab,
            setSelectedTab,
            tabs,
            unregisterTab,
        } satisfies ITabbedSectionCardContext;
    }, [registerTab, selectedTab, tabs, unregisterTab]);

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
