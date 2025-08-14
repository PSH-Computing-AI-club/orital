import DownasaurIcon from "~/components/icons/downasaur_icon";

import EmptyState from "~/components/controlpanel/empty_state";
import Layout from "~/components/controlpanel/layout";

import {Route} from "./+types/admin_._index";

export default function AdminIndex(_props: Route.ComponentProps) {
    return (
        <Layout.FixedContainer>
            <EmptyState.Root>
                <EmptyState.Container>
                    <EmptyState.Icon>
                        <DownasaurIcon />
                    </EmptyState.Icon>

                    <EmptyState.Body>
                        <EmptyState.Title>To be implemented</EmptyState.Title>

                        <EmptyState.Description>
                            This feature has not yet been implemented.
                        </EmptyState.Description>
                    </EmptyState.Body>
                </EmptyState.Container>
            </EmptyState.Root>
        </Layout.FixedContainer>
    );
}
