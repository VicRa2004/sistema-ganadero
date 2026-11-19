import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	workers: 1,
	retries: 0,
	use: {
		baseURL: "http://localhost:5173",
		launchOptions: {
			executablePath: "/usr/bin/google-chrome",
			args: ["--no-sandbox"],
		},
	},
});
