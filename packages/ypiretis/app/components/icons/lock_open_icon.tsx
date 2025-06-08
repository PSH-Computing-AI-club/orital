import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function LockOpenIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M15 2H9v2H7v2h2V4h6v4H4v14h16V8h-3V4h-2V2zm0 8h3v10H6V10h9zm-2 3h-2v4h2v-4z" />
        </IconRoot>
    );
}
