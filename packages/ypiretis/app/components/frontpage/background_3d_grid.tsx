import type {PropsWithChildren} from "react";

import type {BoxProps} from "@chakra-ui/react";
import {Box} from "@chakra-ui/react";

import "./background_3d_grid.css";

export interface IBackground3DGridSceneProps extends BoxProps {}

export interface IBackground3DGridRootProps
    extends PropsWithChildren<BoxProps> {}

function Background3DGridScene(props: IBackground3DGridSceneProps) {
    const {className, inset = "0", position = "absolute"} = props;

    return (
        <Box
            className={`backgrounds--3d-grid--scene ${className ?? ""}`}
            position={position}
            inset={inset}
        />
    );
}

function Background3DGridRoot(props: IBackground3DGridRootProps) {
    const {className, children, position = "relative", ...rest} = props;

    return (
        <Box
            className={`backgrounds--3d-grid--root ${className ?? ""}`}
            position={position}
            overflow="hidden"
            asChild
            {...rest}
        >
            {children}
        </Box>
    );
}

const Background3DGrid = {
    Root: Background3DGridRoot,
    Scene: Background3DGridScene,
};

export default Background3DGrid;
