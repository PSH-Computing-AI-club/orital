import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function ChevronUpIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M7 16H5v-2h2v-2h2v-2h2V8h2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2h-2v2H9v2H7v2z" />
        </IconRoot>
    );
}
