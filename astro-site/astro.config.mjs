import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkNoteNumbers from "./src/plugins/remark-note-numbers.mjs";

// https://astro.build/config
export default defineConfig({
	integrations: [mdx()],
	markdown: {
		remarkPlugins: [remarkNoteNumbers],
		shikiConfig: {
			theme: "nord",
		},
	},
	site: "https://burninghou.se",
});
