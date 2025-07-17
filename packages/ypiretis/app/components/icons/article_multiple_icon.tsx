import type {IIconProps} from "./icon";
import IconRoot from "./icon";

export default function ArticleMultipleIcon(props: IIconProps) {
    return (
        <IconRoot {...props}>
            <path d="M3 1H1v18h18V1H3zm14 2v14H3V3h14zm4 18H5v2h18V5h-2v16zM15 5H5v2h10V5zM5 9h10v2H5V9zm7 4H5v2h7v-2z" />
        </IconRoot>
    );
}
