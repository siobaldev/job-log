import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger);

  let lenis: Lenis | null = null;

  // Respect "reduce motion": skip smooth scroll and use native scrolling
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lenis = new Lenis({ autoRaf: false });

    // Let GSAP drive Lenis so ScrollTrigger stays in sync
    const instance = lenis;
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => instance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  return { provide: { lenis, gsap, ScrollTrigger } };
});
