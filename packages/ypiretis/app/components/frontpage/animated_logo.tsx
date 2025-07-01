import {Box} from "@chakra-ui/react";

import {Canvas, useFrame} from "@react-three/fiber";

import {Bloom, EffectComposer, N8AO} from "@react-three/postprocessing";

import type {PropsWithChildren} from "react";
import {useEffect, useRef} from "react";

import type {Mesh} from "three";

import Logo3DModel from "~/components/models/Logo3DModel";

export interface IAnimatedLogoSceneProps extends PropsWithChildren {}

export interface IAnimatedLogoRootProps extends PropsWithChildren {}

const ANIMATION_BOUNCE_START = -5;

const ANIMATION_BOUNCE_STRENGTH = 10;

const ANIMATION_BACKGROUND_SCENE_SELECTOR = ".backgrounds--3d-grid--scene";

const ANIMATION_PIVOT_START = 0;

const ANIMATION_PIVOT_STRENGTH = 0.025;

const BREAKPOINT_WIDTH_MD = 768;

const BREAKPOINT_WIDTH_SM = 480;

const MESH_SCALE_DEFAULT = 1.75;

const MESH_SCALE_MD = 1.5;

const MESH_SCALE_SM = 1.25;

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
            mesh.scale.setScalar(MESH_SCALE_SM);
        } else if (isBreakpoint(BREAKPOINT_WIDTH_MD)) {
            mesh.scale.setScalar(MESH_SCALE_MD);
        } else {
            mesh.scale.setScalar(MESH_SCALE_DEFAULT);
        }

        if (!animationEffect) {
            return;
        }

        const timing = animationEffect.getComputedTiming();

        const currentIteration = timing.currentIteration ?? 0;
        const progress = timing.progress ?? 0;

        const isFirstPassPivot = currentIteration % 2;
        const firstPassPivotMultiplier = isFirstPassPivot ? -1 : 1;

        const bounceMultiplier = 1 - 2 * Math.abs(progress - 0.5);
        const bounceEasing = easeOutQuad(bounceMultiplier);

        mesh.position.y =
            ANIMATION_BOUNCE_START + ANIMATION_BOUNCE_STRENGTH * bounceEasing;

        mesh.rotation.x =
            ANIMATION_PIVOT_START +
            ANIMATION_PIVOT_STRENGTH * bounceEasing * -2;

        mesh.rotation.y =
            ANIMATION_PIVOT_START +
            ANIMATION_PIVOT_STRENGTH *
                bounceEasing *
                -2 *
                firstPassPivotMultiplier;

        mesh.rotation.z =
            ANIMATION_PIVOT_START +
            ANIMATION_PIVOT_STRENGTH * bounceEasing * firstPassPivotMultiplier;
    });

    return <Logo3DModel ref={meshRef} position={[0, 0, -30]} />;
}

function AnimatedLogoScene(props: IAnimatedLogoSceneProps) {
    const {children} = props;

    return (
        <>
            <spotLight
                position={[30, 30, 10]}
                angle={0.9}
                penumbra={1}
                decay={0.25}
                intensity={Math.PI}
            />

            <pointLight position={[-30, 20, -10]} decay={0.15} intensity={5} />

            {children}

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0}
                    luminanceSmoothing={0.9}
                    height={512}
                />

                <N8AO quality="performance" aoRadius={20} intensity={2} />
            </EffectComposer>
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
