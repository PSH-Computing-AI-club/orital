import {Box} from "@chakra-ui/react";

import type {PerformanceMonitorApi} from "@react-three/drei";
import {Html, PerformanceMonitor, useProgress} from "@react-three/drei";

import {Canvas, useFrame} from "@react-three/fiber";

import {
    Bloom,
    EffectComposer,
    N8AO,
    ToneMapping,
} from "@react-three/postprocessing";

import {KernelSize, ToneMappingMode} from "postprocessing";

import type {PropsWithChildren} from "react";
import {
    Suspense,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type {Mesh} from "three";

import Logo3DModel from "~/components/models/logo_3d_model";

import {useBreakpoint} from "~/hooks/breakpoint";
import type {
    IUseIntersectionObserverCallback,
    IUseIntersectionObserverOptions,
} from "~/hooks/intersection_observer";
import useIntersectionObserver from "~/hooks/intersection_observer";

const ANIMATION_BOUNCE_START_X = 0;

const ANIMATION_BOUNCE_START_Y = -5;

const ANIMATION_BOUNCE_STRENGTH_X = 2;

const ANIMATION_BOUNCE_STRENGTH_Y = 10;

const ANIMATION_BACKGROUND_SCENE_SELECTOR = ".backgrounds--3d-grid--scene";

const ANIMATION_PIVOT_START = -0.01;

const ANIMATION_PIVOT_STRENGTH = 0.025;

const ANIMATION_SMEAR_STRENGTH_Y = 0.2;

const ANIMATION_SMEAR_STRENGTH_Z = 0.8;

const GRID_COLOR = "#0c5c72";

const MESH_SCALE_DEFAULT = 1.75;

const MESH_SCALE_MD = 1.5;

const MESH_SCALE_SM = 1.25;

const QUALITY_MODES = {
    potato: "MODE_POTATO",

    low: "MODE_LOW",

    medium: "MODE_MEDIUM",

    high: "MODE_HIGH",

    ultra: "MODE_ULTRA",
} as const;

const QUALITY_DOWN_THRESHOLDS = {
    low: 0.4,

    medium: 0.6,

    high: 0.75,

    ultra: 0.85,
} as const;

const QUALITY_UP_THRESHOLDS = {
    potato: 0.6,

    low: 0.75,

    medium: 0.85,

    high: 0.95,
} as const;

const CONTEXT_QUALITY_MODE = createContext<IQualityModes>(QUALITY_MODES.medium);

type IQualityModes = (typeof QUALITY_MODES)[keyof typeof QUALITY_MODES];

export interface IAnimatedLogoRootProps extends PropsWithChildren {}

function easeOutQuad(x: number): number {
    // **SOURCE:** https://easings.net/#easeOutQuad

    return 1 - (1 - x) * (1 - x);
}

function useResponsiveMeshScale(): number {
    const breakpoint = useBreakpoint();

    switch (breakpoint) {
        case "sm":
            return MESH_SCALE_SM;

        case "md":
            return MESH_SCALE_MD;

        default:
            return MESH_SCALE_DEFAULT;
    }
}

function useQualityMode(): IQualityModes {
    return useContext(CONTEXT_QUALITY_MODE);
}

function AnimatedLogoLoader() {
    const {progress} = useProgress();

    return (
        <Html center>
            <span>{progress.toFixed(0)}% loaded</span>
        </Html>
    );
}

function AnimatedLogoModel() {
    const scale = useResponsiveMeshScale();

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

        if (!animationEffect || !mesh) {
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

        mesh.scale.x = scale;
        mesh.scale.y = scale + ANIMATION_SMEAR_STRENGTH_Y * bounceEasing;
        mesh.scale.z = scale + ANIMATION_SMEAR_STRENGTH_Z;
    });

    return <Logo3DModel ref={meshRef} position={[0, 0, 0]} />;
}

function AnimatedLogoLights() {
    return (
        <>
            <spotLight
                position={[12, -5, 34]}
                angle={0.9}
                penumbra={1}
                decay={0}
                intensity={2.5}
                distance={100}
                castShadow={false}
            />

            <pointLight
                position={[0, -30, 12]}
                decay={0.3}
                intensity={6}
                distance={100}
                castShadow={false}
            />
        </>
    );
}

function AnimatedLogoEffects() {
    const qualityMode = useQualityMode();

    const {bloomKernelSize, multisampling, showExpensiveEffects} =
        useMemo(() => {
            switch (qualityMode) {
                case QUALITY_MODES.ultra:
                    return {
                        bloomKernelSize: KernelSize.LARGE,
                        multisampling: 8,
                        showExpensiveEffects: true,
                    };

                case QUALITY_MODES.high:
                    return {
                        bloomKernelSize: KernelSize.MEDIUM,
                        multisampling: 4,
                        showExpensiveEffects: true,
                    };

                case QUALITY_MODES.medium:
                    return {
                        bloomKernelSize: KernelSize.SMALL,
                        multisampling: 2,
                        showExpensiveEffects: false,
                    };

                default:
                    return {
                        bloomKernelSize: KernelSize.VERY_SMALL,
                        multisampling: 0,
                        showExpensiveEffects: false,
                    };
            }
        }, [qualityMode]);

    return (
        <EffectComposer
            depthBuffer={showExpensiveEffects}
            enableNormalPass={showExpensiveEffects}
            multisampling={multisampling}
            stencilBuffer={false}
            enabled
        >
            <ToneMapping
                mode={ToneMappingMode.OPTIMIZED_CINEON}
                resolution={512}
            />

            {showExpensiveEffects ? (
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
                        kernelSize={bloomKernelSize}
                        mipmapBlur
                    />
                </>
            ) : (
                <></>
            )}
        </EffectComposer>
    );
}

function AnimatedLogoScene() {
    return (
        <>
            <AnimatedLogoLights />

            <Suspense fallback={<AnimatedLogoLoader />}>
                <AnimatedLogoModel />
            </Suspense>

            <AnimatedLogoEffects />
        </>
    );
}

function AnimatedLogoRoot(props: IAnimatedLogoRootProps) {
    const {children} = props;

    const boxElementRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState<boolean>(false);
    const [qualityMode, setQualityMode] = useState<IQualityModes>(
        QUALITY_MODES.medium,
    );

    const onPerformanceChange = useCallback((api: PerformanceMonitorApi) => {
        const {factor} = api;

        setQualityMode((previousMode) => {
            switch (previousMode) {
                case QUALITY_MODES.low:
                    if (factor < QUALITY_DOWN_THRESHOLDS.low) {
                        return QUALITY_MODES.potato;
                    }

                    break;

                case QUALITY_MODES.medium:
                    if (factor < QUALITY_DOWN_THRESHOLDS.medium) {
                        return QUALITY_MODES.low;
                    }

                    break;

                case QUALITY_MODES.high:
                    if (factor < QUALITY_DOWN_THRESHOLDS.high) {
                        return QUALITY_MODES.medium;
                    }

                    break;

                case QUALITY_MODES.ultra:
                    if (factor < QUALITY_DOWN_THRESHOLDS.ultra) {
                        return QUALITY_MODES.high;
                    }

                    break;
            }

            switch (previousMode) {
                case QUALITY_MODES.potato:
                    if (factor > QUALITY_UP_THRESHOLDS.potato) {
                        return QUALITY_MODES.low;
                    }

                    break;

                case QUALITY_MODES.low:
                    if (factor > QUALITY_UP_THRESHOLDS.low) {
                        return QUALITY_MODES.medium;
                    }

                    break;

                case QUALITY_MODES.medium:
                    if (factor > QUALITY_UP_THRESHOLDS.medium) {
                        return QUALITY_MODES.high;
                    }

                    break;

                case QUALITY_MODES.high:
                    if (factor > QUALITY_UP_THRESHOLDS.high) {
                        return QUALITY_MODES.ultra;
                    }

                    break;
            }

            return previousMode;
        });
    }, []);

    const onIntersectionObserverEntry = useCallback(
        ((entries) => {
            const [firstEntry] = entries;

            setIsInView(firstEntry.isIntersecting);
        }) satisfies IUseIntersectionObserverCallback,
        [],
    );

    const intersectionObserverOptions = useMemo(
        () =>
            ({
                threshold: 0,
            }) satisfies IUseIntersectionObserverOptions,
        [],
    );

    const {dpr} = useMemo(() => {
        switch (qualityMode) {
            case QUALITY_MODES.ultra:
                return {
                    dpr: [1, 2] satisfies [number, number],
                };

            case QUALITY_MODES.high:
                return {
                    dpr: [1, 1.5] satisfies [number, number],
                };

            case QUALITY_MODES.medium:
                return {
                    dpr: [0.75, 1] satisfies [number, number],
                };

            case QUALITY_MODES.low:
                return {
                    dpr: [0.5, 0.75] satisfies [number, number],
                };

            default:
                return {
                    dpr: [0.25, 0.5] satisfies [number, number],
                };
        }
    }, [qualityMode]);

    useIntersectionObserver(
        boxElementRef,
        onIntersectionObserverEntry,
        intersectionObserverOptions,
    );

    return (
        <Box
            ref={boxElementRef}
            position="absolute"
            insetBlockStart="50%"
            insetInlineStart="50%"
            blockSize="xl"
            inlineSize="xl"
            translate="-50% -50%"
        >
            <Canvas
                dpr={dpr}
                fallback="Hero animated 3D voxel logo and shimmer effect."
                frameloop={isInView ? "always" : "demand"}
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
                <PerformanceMonitor
                    flipflops={6}
                    onChange={onPerformanceChange}
                />

                <CONTEXT_QUALITY_MODE.Provider value={qualityMode}>
                    {children}
                </CONTEXT_QUALITY_MODE.Provider>
            </Canvas>
        </Box>
    );
}

export default function AnimatedLogo() {
    return (
        <AnimatedLogoRoot>
            <AnimatedLogoScene />
        </AnimatedLogoRoot>
    );
}
