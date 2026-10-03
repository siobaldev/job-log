import tailwindcss from "@tailwindcss/vite";

import "./lib/env";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  supabase: {
    redirect: false,
  },

  app: {
    head: {
      title: "Job Log",
      meta: [
        { name: "description", content: "Track, organize, and manage your daily work tasks seamlessly. Monitor your project progress, log hours, and streamline your productivity with our intuitive job log." },
        { name: "apple-mobile-web-app-title", content: "Job Log" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },

  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/eslint", "@nuxtjs/supabase", "@nuxt/image"],
});
