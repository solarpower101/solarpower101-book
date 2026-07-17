import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://solarpower101.github.io",
  base: "/book",
  integrations: [
    starlight({
      title: "SolarPower101 Academy",
      description: "Public homeowner solar education that complements SolarPower101 Learn.",
      pagefind: false,
      social: [
        {
          icon: "github",
          label: "SolarPower101 Learn",
          href: "https://solarpower101.github.io/learn/",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [{ label: "Academy Home", slug: "index" }],
        },
        {
          label: "Free Lessons",
          items: [{ autogenerate: { directory: "free" } }],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
