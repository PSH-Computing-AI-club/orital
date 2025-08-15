import {useEffect, useState} from "react";

// **HACK:** This whole file really. While not a hack... Chakra UI does provide
// a built-in `useBreakpoint` hook. HOWEVER, it fails to give proper return values
// on mobile even when the `ssr` option is disabled.

export function useBreakpoint(): "sm" | "md" | "lg" | "xl" | "2xl" | null {
    const [activeBreakpoint, setActiveBreakpoint] = useState<
        "sm" | "md" | "lg" | "xl" | "2xl" | null
    >(null);

    useEffect(() => {
        const onResize = () => {
            const {innerWidth} = window;

            if (innerWidth <= 480) {
                setActiveBreakpoint("sm");
            } else if (innerWidth <= 768) {
                setActiveBreakpoint("md");
            } else if (innerWidth <= 1024) {
                setActiveBreakpoint("lg");
            } else if (innerWidth <= 1280) {
                setActiveBreakpoint("xl");
            } else {
                setActiveBreakpoint("2xl");
            }
        };

        onResize();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return activeBreakpoint;
}
