import {Box} from "@chakra-ui/react";

import {Canvas, useFrame} from "@react-three/fiber";

import type {PropsWithChildren} from "react";
import {useEffect, useRef} from "react";

import type {Mesh} from "three";

import Logo3DModel from "~/components/models/Logo3DModel";

export interface IAnimatedLogoSceneProps extends PropsWithChildren {}

export interface IAnimatedLogoRootProps extends PropsWithChildren {}

const ANIMATION_BOUNCE_HEIGHT = 5;

const ANIMATION_BOUNCE_START = -5;

const ANIMATION_BACKGROUND_SCENE_SELECTOR = ".backgrounds--3d-grid--scene";

const BREAKPOINT_WIDTH_SM = 480;

const BREAKPOINT_WIDTH_MD = 768;

function easeOutQuad(x: number): number {
    // **SOURCE:** https://easings.net/#easeOutQuad

    return 1 - (1 - x) * (1 - x);
}

function isBreakpoint(breakpoint: number): boolean {
    return window.innerWidth <= breakpoint;
}

function AnimatedLogoModel() {
    const animationEffectRef = useRef<AnimationEffect>(null);
    const meshRef = useRef<Mesh>(null);

    useEffect(() => {
        const backgroundElement = document.querySelector(
            ANIMATION_BACKGROUND_SCENE_SELECTOR,
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

        if (!mesh) {
            return;
        }

        if (isBreakpoint(BREAKPOINT_WIDTH_SM)) {
            mesh.scale.setScalar(1.25);
        } else if (isBreakpoint(BREAKPOINT_WIDTH_MD)) {
            mesh.scale.setScalar(1.5);
        } else {
            mesh.scale.setScalar(1.75);
        }

        if (!animationEffect) {
            return;
        }

        const animationProgress =
            animationEffect.getComputedTiming().progress ?? 0;

        const bounceMultiplier = easeOutQuad(
            1 - 2 * Math.abs(animationProgress - 0.5),
        );

        mesh.position.y =
            ANIMATION_BOUNCE_START + ANIMATION_BOUNCE_HEIGHT * bounceMultiplier;
    });

    return <Logo3DModel ref={meshRef} position={[0, 0, -30]} />;
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

    return (
        <Box
            position="absolute"
            insetBlockStart="50%"
            insetInlineStart="50%"
            blockSize="lg"
            inlineSize="lg"
            translate="-50% -50%"
        >
            <Canvas>{children}</Canvas>
        </Box>
    );
}

const AnimatedLogo = {
    Model: AnimatedLogoModel,
    Scene: AnimatedLogoScene,
    Root: AnimatedLogoRoot,
} as const;

export default AnimatedLogo;
