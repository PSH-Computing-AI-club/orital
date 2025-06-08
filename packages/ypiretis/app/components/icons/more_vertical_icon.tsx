import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function MoreVerticalIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M15 1v6H9V1h6zm-2 2h-2v2h2V3zm2 6v6H9V9h6zm-2 2h-2v2h2v-2zm2 6v6H9v-6h6zm-2 2h-2v2h2v-2z" />
        </IconRoot>
    );
}
