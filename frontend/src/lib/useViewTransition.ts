import { useEffect, useRef, useState } from "react";

/** Fade out the current view before swapping it, without animating layout. */
export function useViewTransition(context: unknown) {
  const [leaving, setLeaving] = useState(false);
  const [animate, setAnimate] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setLeaving(false);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [context]);
  const transition = (action: () => void, pointer = true) => {
    if (timer.current) return;
    const motion =
      pointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimate(motion);
    if (!motion) {
      action();
      return;
    }
    setLeaving(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      action();
      setLeaving(false);
    }, 120);
  };
  return { leaving, animate, transition };
}
