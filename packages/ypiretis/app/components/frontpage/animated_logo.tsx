import {Box} from "@chakra-ui/react";

import type {PerformanceMonitorApi} from "@react-three/drei";
import {PerformanceMonitor} from "@react-three/drei";

import {Canvas, useFrame} from "@react-three/fiber";

import {
    Bloom,
    EffectComposer,
    N8AO,
    ToneMapping,
} from "@react-three/postprocessing";

import {KernelSize, ToneMappingMode} from "postprocessing";

import type {PropsWithChildren} from "react";
import {useEffect, useRef, useState} from "react";

import type {Mesh} from "three";

import Logo3DModel from "~/components/models/logo_3d_model";

export interface IAnimatedLogoRootProps extends PropsWithChildren {}

const ANIMATION_BOUNCE_START_X = 0;

const ANIMATION_BOUNCE_START_Y = -5;

const ANIMATION_BOUNCE_STRENGTH_X = 2;

const ANIMATION_BOUNCE_STRENGTH_Y = 10;

const ANIMATION_BACKGROUND_SCENE_SELECTOR = ".backgrounds--3d-grid--scene";

const ANIMATION_PIVOT_START = -0.01;

const ANIMATION_PIVOT_STRENGTH = 0.025;

const BREAKPOINT_WIDTH_MD = 768;

const BREAKPOINT_WIDTH_SM = 480;

const GRID_COLOR = "#0c5c72";

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

        mesh.position.x =
            ANIMATION_BOUNCE_START_X -
            ANIMATION_BOUNCE_STRENGTH_X *
                bounceEasing *
                firstPassPivotMultiplier;

        mesh.position.y =
            ANIMATION_BOUNCE_START_Y +
            ANIMATION_BOUNCE_STRENGTH_Y * bounceEasing;

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

    return <Logo3DModel ref={meshRef} position={[0, 0, 0]} />;
}

function AnimatedLogoLights() {
    return (
        <>
            <spotLight
                position={[12, -20, 34]}
                angle={0.9}
                penumbra={1}
                decay={0}
                intensity={2}
                castShadow={false}
            />

            <pointLight
                position={[-0, -30, 12]}
                decay={0.3}
                intensity={6}
                distance={-2}
                castShadow={false}
            />
        </>
    );
}

function AnimatedLogoEffects() {
    const [hasDegradedPerformance, setHasDegradedPerformance] =
        useState<boolean>(false);

    function onPerformanceDecline(_api: PerformanceMonitorApi): void {
        setHasDegradedPerformance(true);
    }

    function onPerformanceIncline(_api: PerformanceMonitorApi): void {
        setHasDegradedPerformance(false);
    }

    return (
        <>
            <PerformanceMonitor
                onDecline={onPerformanceDecline}
                onIncline={onPerformanceIncline}
            />

            <EffectComposer
                depthBuffer={true}
                enableNormalPass={true}
                multisampling={hasDegradedPerformance ? 0 : 8}
                stencilBuffer={false}
                enabled
            >
                <ToneMapping
                    mode={ToneMappingMode.OPTIMIZED_CINEON}
                    resolution={512}
                />

                {!hasDegradedPerformance ? (
                    <>
                        <N8AO
                            quality="performance"
                            aoRadius={10}
                            intensity={2}
                            color={GRID_COLOR}
                            screenSpaceRadius
                        />

                        <Bloom
                            luminanceThreshold={0.3}
                            luminanceSmoothing={0.9}
                            height={512}
                            kernelSize={KernelSize.LARGE}
                            mipmapBlur
                        />
                    </>
                ) : (
                    <></>
                )}
            </EffectComposer>
        </>
    );
}

function AnimatedLogoScene() {
    return (
        <>
            <AnimatedLogoLights />
            <AnimatedLogoModel />
            <AnimatedLogoEffects />
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
            blockSize="xl"
            inlineSize="xl"
            translate="-50% -50%"
        >
            <Canvas
                frameloop="always"
                camera={{
                    aspect: 1,
                    far: 50,
                    fov: 75,
                    rotation: [0, 0, 0],
                    near: 0.1,
                    position: [0, 0, 40],
                    zoom: 1,
                }}
            >
                {children}
            </Canvas>
        </Box>
    );
}

const AnimatedLogo = {
    Scene: AnimatedLogoScene,
    Root: AnimatedLogoRoot,
} as const;

export default AnimatedLogo;
