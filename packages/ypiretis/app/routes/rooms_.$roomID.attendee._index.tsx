import EmptyState from "~/components/controlpanel/empty_state";
import Layout from "~/components/controlpanel/layout";

import MessageClockIcon from "~/components/icons/message_clock_icon";

import {Route} from "./+types/rooms_.$roomID.presenter.settings";

export default function RoomsAttendeeIndex(_props: Route.ComponentProps) {
    return (
        <Layout.FixedContainer>
            <EmptyState.Root>
                <EmptyState.Container>
                    <EmptyState.Icon>
                        <MessageClockIcon />
                    </EmptyState.Icon>

                    <EmptyState.Body>
                        <EmptyState.Title>
                            Waiting on presenter
                        </EmptyState.Title>

                        <EmptyState.Description>
                            The presenter has not given you any actions to do
                            yet.
                        </EmptyState.Description>
                    </EmptyState.Body>
                </EmptyState.Container>
            </EmptyState.Root>
        </Layout.FixedContainer>
    );
}
