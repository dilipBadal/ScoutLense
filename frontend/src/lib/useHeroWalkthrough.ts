import { useEffect, useRef, useState } from "react";

export function useHeroWalkthrough() {
  const container = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [manual, setManual] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (container.current) observer.observe(container.current);
    return () => {
      motion.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (paused || reduced || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setManual(false);
        setTick((t) => (t + 1) % 6);
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [paused, reduced, visible]);
  const select = (scene: number) => {
    setManual(true);
    setPaused(true);
    setTick(scene * 2 + 1);
  };
  return {
    container,
    tick,
    scene: Math.floor(tick / 2),
    manual,
    stopped: paused || reduced,
    select,
    toggle: () => {
      setManual(false);
      setPaused((p) => !p);
    },
    reduced,
  };
}
