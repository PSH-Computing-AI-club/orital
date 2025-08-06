import {makeIconComponent} from "./icon";

const FileIcon = makeIconComponent({
    icon: (
        <path
            d="M3 22h18V8h-2V6h-2v2h-2V6h2V4h-2V2H3v20zm2-2V4h8v6h6v10H5z"
            fill="currentColor"
        />
    ),
});

export default FileIcon;
