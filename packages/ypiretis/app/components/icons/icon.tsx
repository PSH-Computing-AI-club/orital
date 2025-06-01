import type {PropsWithChildren} from "react";

export type IIconProps = PropsWithChildren;

export default function Icon(props: IIconProps) {
    const {children} = props;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            width="1.25em"
            height="1.25em"
            viewBox="0 0 24 24"
        >
            {children}
        </svg>
    );
}
