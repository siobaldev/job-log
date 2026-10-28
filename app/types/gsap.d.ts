import type gsap from "gsap";

declare module "#app" {
  type NuxtApp = {
    $gsap: typeof gsap;
  };
}

declare module "vue" {
  type ComponentCustomProperties = {
    $gsap: typeof gsap;
  };
}

export {};
