import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function InfoBoxIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M3 3h2v18H3V3zm16 0H5v2h14v14H5v2h16V3h-2zm-8 6h2V7h-2v2zm2 8h-2v-6h2v6z" />
        </IconRoot>
    );
}
