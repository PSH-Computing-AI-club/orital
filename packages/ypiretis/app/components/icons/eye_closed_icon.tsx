import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function EyeClosedIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M0 7h2v2H0V7zm4 4H2V9h2v2zm4 2v-2H4v2H2v2h2v-2h4zm8 0H8v2H6v2h2v-2h8v2h2v-2h-2v-2zm4-2h-4v2h4v2h2v-2h-2v-2zm2-2v2h-2V9h2zm0 0V7h2v2h-2z" />
        </IconRoot>
    );
}
