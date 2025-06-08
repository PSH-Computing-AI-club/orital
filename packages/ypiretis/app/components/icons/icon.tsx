import type {PropsWithChildren} from "react";

export type IIconProps = Omit<IIconRootProps, "children">;

export interface IIconRootProps extends PropsWithChildren {
    readonly size?: string;
}

export default function IconRoot(props: IIconRootProps) {
    const {children, size = "1.25em"} = props;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            width={size}
            height={size}
        >
            {children}
        </svg>
    );
}
