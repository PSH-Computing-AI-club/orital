import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function ChevronDownIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M7 8H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z" />
        </IconRoot>
    );
}
