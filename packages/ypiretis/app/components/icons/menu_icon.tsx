import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function MenuIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm16 5H4v2h16v-2z" />
        </IconRoot>
    );
}
