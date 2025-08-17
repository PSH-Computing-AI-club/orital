import Title from "~/components/common/title";

import EmptyState from "~/components/controlpanel/empty_state";
import Layout from "~/components/controlpanel/layout";

import ClipboardIcon from "~/components/icons/clipboard_icon";
import MessageClockIcon from "~/components/icons/message_clock_icon";

import {useAttendeeContext} from "~/state/attendee";

import {Route} from "./+types/rooms_.$roomID.presenter.settings";

export default function RoomsAttendeeIndex(_props: Route.ComponentProps) {
    const {state, room} = useAttendeeContext();
    const {title} = room;

    const isAwaitingApproval = state === "STATE_AWAITING";

    return (
        <>
            <Title title={title || "Awaiting approval."} />

            <Layout.FixedContainer>
                <EmptyState.Root>
                    <EmptyState.Container>
                        <EmptyState.Icon>
                            {isAwaitingApproval ? (
                                <ClipboardIcon />
                            ) : (
                                <MessageClockIcon />
                            )}
                        </EmptyState.Icon>

                        <EmptyState.Body>
                            <EmptyState.Title>
                                {isAwaitingApproval
                                    ? "Awaiting approval."
                                    : "Waiting on presenter."}
                            </EmptyState.Title>

                            <EmptyState.Description>
                                {isAwaitingApproval
                                    ? "The presenter needs to approval you joining the room."
                                    : "The presenter has not given you any actions to do yet."}
                            </EmptyState.Description>
                        </EmptyState.Body>
                    </EmptyState.Container>
                </EmptyState.Root>
            </Layout.FixedContainer>
        </>
    );
}
