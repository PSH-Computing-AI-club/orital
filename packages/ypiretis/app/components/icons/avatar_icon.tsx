import {makeIconComponent} from "./icon";

const AvatarIcon = makeIconComponent({
    icon: (
        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM14 7h-4v4h4V7zm1 6H9v2H7v2h2v-2h6v2h2v-2h-2v-2z" />
    ),
});

export default AvatarIcon;
