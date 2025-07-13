import {APP_NAME} from "~/utils/constants";

export interface ITitleProps {
    readonly title?: string;
}

export default function Title(props: ITitleProps) {
    const {title} = props;

    return title ? (
        // **HACK:** React's special handling of the `<title>` element
        // requires that it has no child elements. That is, it is only
        // a singular primitive value.

        <title>{`${title} :: ${APP_NAME}`}</title>
    ) : (
        <title>{APP_NAME}</title>
    );
}
