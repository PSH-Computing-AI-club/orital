import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function LockIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M15 2H9v2H7v4H4v14h16V8h-3V4h-2V2zm0 2v4H9V4h6zm-6 6h9v10H6V10h3zm4 3h-2v4h2v-4z" />
        </IconRoot>
    );
}
