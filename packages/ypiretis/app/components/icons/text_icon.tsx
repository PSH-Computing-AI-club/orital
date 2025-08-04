import {makeIconComponent} from "./icon";

const TextIcon = makeIconComponent({
    icon: (
        <path d="M 4,19 H 20 V 17 H 4 Z M 4,15 H 20 V 13 H 4 Z m 8,-4 h 8 V 9 H 12 Z M 4,5 v 6 h 6 V 5 Z M 8,7 V 9 H 6 V 7 Z m 4,0 h 8 V 5 h -8 z" />
    ),
});

export default TextIcon;
