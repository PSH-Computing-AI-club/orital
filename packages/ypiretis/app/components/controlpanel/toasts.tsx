import type {AlertRootProps} from "@chakra-ui/react";
import {Alert, CloseButton, HStack, Presence, VStack} from "@chakra-ui/react";

import type {MouseEventHandler, PropsWithChildren, ReactNode} from "react";
import {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import CheckBoxIcon from "~/components/icons/check_box_icon";
import CloseIcon from "~/components/icons/close_icon";
import CloseBoxIcon from "~/components/icons/close_box_icon";
import InfoBoxIcon from "~/components/icons/info_box_icon";
import WarningBoxIcon from "~/components/icons/warning_box_icon";
import ZapIcon from "~/components/icons/zap_icon";

const CONTEXT_TOASTS = createContext<IToastsContext | null>(null);

const CONTEXT_TOASTS_INTERNAL = createContext<IInternalToastsContext | null>(
    null,
);

const DEFAULT_TOAST_DURATION = 1000 * 5; // 1000 milliseconds * 5 seconds

export const TOAST_STATUS = {
    attention: "STATUS_ATTENTION",

    error: "STATUS_ERROR",

    info: "STATUS_INFO",

    success: "STATUS_SUCCESS",

    warning: "STATUS_WARNING",
} as const;

export type IToastStatus = (typeof TOAST_STATUS)[keyof typeof TOAST_STATUS];

interface IToast {
    readonly description?: ReactNode;

    readonly id: string;

    readonly isDismissed: boolean;

    readonly status?: IToastStatus;

    readonly title: ReactNode;
}

interface IInternalToastsContext {
    readonly toasts: ReadonlyMap<string, IToast>;

    dismissToast(id: string): void;

    removeToast(id: string): void;
}

interface IToastsItemProps
    extends Omit<AlertRootProps, "asChild" | "children"> {
    readonly toast: IToast;
}

export interface IToastUserOptions extends Omit<IToast, "id" | "isDismissed"> {
    readonly duration?: number;
}

export interface IToastsRootProps extends PropsWithChildren {}

export interface IToastsContext {
    dismissToast(id: string): void;

    toastUser(options: IToastUserOptions): string;
}

function determineToastIcon(status: IToastStatus) {
    switch (status) {
        case TOAST_STATUS.attention:
            return ZapIcon;

        case TOAST_STATUS.error:
            return CloseBoxIcon;

        case TOAST_STATUS.info:
            return InfoBoxIcon;

        case TOAST_STATUS.success:
            return CheckBoxIcon;

        case TOAST_STATUS.warning:
            return WarningBoxIcon;
    }
}

function determineToastStatusColor(status: IToastStatus) {
    switch (status) {
        case TOAST_STATUS.attention:
            return "neutral";

        case TOAST_STATUS.error:
            return "error";

        case TOAST_STATUS.info:
            return "info";

        case TOAST_STATUS.success:
            return "success";

        case TOAST_STATUS.warning:
            return "warning";
    }
}

function useInternalToastsContext(): IInternalToastsContext {
    const context = useContext(CONTEXT_TOASTS_INTERNAL);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useInternalToastsContext' (not a child of 'Toasts.Root')`,
        );
    }

    return context;
}

export function useToastsContext(): IToastsContext {
    const context = useContext(CONTEXT_TOASTS);

    if (context === null) {
        throw new ReferenceError(
            `bad dispatch to 'useToastsContext' (not a child of 'Toasts.Root')`,
        );
    }

    return context;
}

function ToastsItem(props: IToastsItemProps) {
    const {toast} = props;
    const {
        description,
        id,
        isDismissed,
        status = TOAST_STATUS.attention,
        title,
    } = toast;

    const {dismissToast, removeToast} = useInternalToastsContext();

    const Icon = determineToastIcon(status);
    const statusColor = determineToastStatusColor(status);

    const isPresent = !isDismissed;

    const onDismissClick = useCallback(
        ((_event) => {
            if (isDismissed) {
                return;
            }

            dismissToast(id);
        }) satisfies MouseEventHandler<HTMLButtonElement>,

        [dismissToast, id, isDismissed],
    );

    const onExitComplete = useCallback(
        (() => {
            removeToast(id);
        }) satisfies VoidFunction,

        [id, removeToast],
    );

    return (
        <Presence
            animationDuration="slow"
            animationName={{
                _open: "slide-from-bottom, fade-in",
                _closed: "slide-to-right, fade-out",
            }}
            present={isPresent}
            inlineSize="full"
            onExitComplete={onExitComplete}
        >
            <Alert.Root
                variant="solid"
                status={statusColor}
                pointerEvents="all"
            >
                <Alert.Content>
                    <HStack gap="2">
                        <Alert.Indicator>
                            <Icon />
                        </Alert.Indicator>

                        <Alert.Title>{title}</Alert.Title>

                        <CloseButton
                            size="2xs"
                            marginInlineStart="auto"
                            css={{
                                "&:not(:active, :hover)": {
                                    color: "currentcolor",
                                },
                            }}
                            onClick={onDismissClick}
                        >
                            <CloseIcon />
                        </CloseButton>
                    </HStack>

                    {description ? (
                        <Alert.Description>{description}</Alert.Description>
                    ) : (
                        <></>
                    )}
                </Alert.Content>
            </Alert.Root>
        </Presence>
    );
}

const MemoizedToastsItem = memo(ToastsItem);

function ToastsContainer() {
    const {toasts} = useInternalToastsContext();

    return (
        <VStack
            position="fixed"
            bottom="4"
            right="4"
            gap="2"
            inlineSize="lg"
            pointerEvents="none"
            zIndex="toast"
        >
            {Array.from(toasts.values()).map((toast) => {
                const {id} = toast;

                return <MemoizedToastsItem key={id} toast={toast} />;
            })}
        </VStack>
    );
}

function ToastsRoot(props: IToastsRootProps) {
    const {children} = props;

    const timeoutIDs = useRef<Map<string, number>>(new Map());
    const [toasts, setToasts] = useState<Map<string, IToast>>(new Map());

    const dismissToast = useCallback(
        ((id) => {
            const {current: timeoutIDsLookup} = timeoutIDs;
            const timeoutID = timeoutIDsLookup.get(id) ?? null;

            if (timeoutID !== null) {
                clearTimeout(timeoutID);
                timeoutIDsLookup.delete(id);
            }

            setToasts((previousToasts) => {
                const newToasts = new Map(previousToasts);
                const previousToast = newToasts.get(id) ?? null;

                if (previousToast === null) {
                    throw ReferenceError(
                        `bad arugment #0 to 'dismissToast' (id '${id}' not found)`,
                    );
                }

                newToasts.set(id, {
                    ...previousToast,

                    isDismissed: true,
                });

                return newToasts;
            });
        }) satisfies IToastsContext["dismissToast"],

        [setToasts],
    );

    const removeToast = useCallback(
        ((id) => {
            setToasts((previousToasts) => {
                const newToasts = new Map(previousToasts);

                newToasts.delete(id);
                return newToasts;
            });
        }) satisfies IInternalToastsContext["removeToast"],

        [setToasts],
    );

    const internalContext = useMemo(() => {
        return {
            dismissToast,
            removeToast,
            toasts,
        } satisfies IInternalToastsContext;
    }, [dismissToast, removeToast, toasts]);

    const publicContext = useMemo(() => {
        const {current: timeoutIDsLookup} = timeoutIDs;

        return {
            dismissToast,

            toastUser(options) {
                const {
                    description,
                    duration = DEFAULT_TOAST_DURATION,
                    status,
                    title,
                } = options;

                const id = crypto.randomUUID();

                const toast = {
                    description,
                    id,
                    status,
                    title,

                    isDismissed: false,
                } satisfies IToast;

                setToasts((previousToasts) => {
                    const newToasts = new Map(previousToasts);

                    newToasts.set(id, toast);
                    return newToasts;
                });

                const timeoutID = setTimeout(() => {
                    dismissToast(id);
                }, duration) as unknown as number; // **HACK:** In the browser's
                // environment this return value is a number.

                timeoutIDsLookup.set(id, timeoutID);
                return id;
            },
        } satisfies IToastsContext;
    }, [dismissToast, setToasts]);

    useEffect(() => {
        const {current: timeoutIDsLookup} = timeoutIDs;

        return () => {
            for (const timeoutID of timeoutIDsLookup.values()) {
                clearTimeout(timeoutID);
            }
        };
    }, []);

    return (
        <CONTEXT_TOASTS_INTERNAL.Provider value={internalContext}>
            <CONTEXT_TOASTS.Provider value={publicContext}>
                {children}
            </CONTEXT_TOASTS.Provider>
        </CONTEXT_TOASTS_INTERNAL.Provider>
    );
}

const Toasts = {
    Container: ToastsContainer,
    Root: ToastsRoot,
} as const;

export default Toasts;
