import {Canvas, useFrame} from "@react-three/fiber";

import type {Mesh} from "three";

import type {PropsWithChildren} from "react";
import {useEffect, useRef} from "react";

export interface IAnimatedLogoSceneProps extends PropsWithChildren {}

export interface IAnimatedLogoRootProps extends PropsWithChildren {}

const ANIMATION_BOUNCE_HEIGHT = 0.5;

const ANIMATION_BOUNCE_START = -1;

function easeOutCirc(x: number): number {
    // **SOURCE:** https://easings.net/#easeOutCirc

    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

function AnimatedLogoModel() {
    const animationEffectRef = useRef<AnimationEffect>(null);
    const meshRef = useRef<Mesh>(null);

    useEffect(() => {
        const backgroundElement = document.querySelector(
            ".backgrounds--3d-grid--scene",
        );

        if (!backgroundElement) {
            throw new ReferenceError(
                "bad dispatch to 'getAnimation' (background element not found)",
            );
        }

        const [backgroundAnimation] = backgroundElement.getAnimations();

        if (!backgroundAnimation) {
            throw new ReferenceError(
                "bad dispatch to 'getAnimationProgress' (background animation not found)",
            );
        }

        const {effect} = backgroundAnimation;

        if (!effect) {
            throw new ReferenceError(
                "bad dispatch to 'getAnimationProgress' (animation effect not found)",
            );
        }

        animationEffectRef.current = effect;
    }, []);

    useFrame((_state, _delta) => {
        const {current: animationEffect} = animationEffectRef;
        const {current: mesh} = meshRef;

        if (!animationEffect || !mesh) {
            return;
        }

        const animationProgress =
            animationEffect.getComputedTiming().progress ?? 0;

        const animationDelta = Math.sin(animationProgress * Math.PI);

        mesh.position.y =
            ANIMATION_BOUNCE_START + ANIMATION_BOUNCE_HEIGHT * animationDelta;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]} scale={0.5}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

function AnimatedLogoScene(props: IAnimatedLogoSceneProps) {
    const {children} = props;

    return (
        <>
            <ambientLight intensity={Math.PI / 2} />

            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                decay={0}
                intensity={Math.PI}
            />

            <pointLight
                position={[-10, -10, -10]}
                decay={0}
                intensity={Math.PI}
            />

            {children}
        </>
    );
}

function AnimatedLogoRoot(props: IAnimatedLogoRootProps) {
    const {children} = props;

    return <Canvas>{children}</Canvas>;
}

const AnimatedLogo = {
    Model: AnimatedLogoModel,
    Scene: AnimatedLogoScene,
    Root: AnimatedLogoRoot,
} as const;

export default AnimatedLogo;
