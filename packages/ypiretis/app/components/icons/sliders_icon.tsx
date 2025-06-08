import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function SlidersIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M17 4h2v10h-2V4zm0 12h-2v2h2v2h2v-2h2v-2h-4zm-4-6h-2v10h2V10zm-8 2H3v2h2v6h2v-6h2v-2H5zm8-8h-2v2H9v2h6V6h-2V4zM5 4h2v6H5V4z" />
        </IconRoot>
    );
}
