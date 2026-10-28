import type gsap from "gsap";
import type { Ref } from "vue";

export function useReveal(root: Ref<HTMLElement | undefined>) {
  const { $gsap } = useNuxtApp();
  const animation = $gsap as typeof gsap;

  let ctx: ReturnType<typeof animation.context> | undefined;

  onMounted(() => {
    if (
      !root.value
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    ctx = animation.context(() => {
      animation.from(root.value!.children, {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root.value,
          start: "top 85%",
          once: true,
        },
      });
    }, root.value);
  });

  onBeforeUnmount(() => ctx?.revert());
}
