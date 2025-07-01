import {useGLTF} from "@react-three/drei";

import type React from "react";

import type * as THREE from "three";
import type {GLTF} from "three-stdlib";

type GLTFResult = GLTF & {
    materials: {};
    nodes: {
        ["C&AI_Redux"]: THREE.Mesh;
    };
};

export default function Logo3DModel(
    props: React.JSX.IntrinsicElements["group"],
) {
    const {nodes, materials: _materials} = useGLTF(
        "/models/cai-logo-3d.glb",
    ) as unknown as GLTFResult;

    return (
        <group {...props} dispose={null}>
            <mesh
                geometry={nodes["C&AI_Redux"].geometry}
                material={nodes["C&AI_Redux"].material}
            />
        </group>
    );
}

useGLTF.preload("/models/cai-logo-3d.glb");
