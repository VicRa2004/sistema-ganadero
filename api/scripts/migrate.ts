import { execSync } from "node:child_process";

async function runMigrations() {
	const dbUrl = process.env.DATABASE_URL;

	if (!dbUrl) {
		console.error(
			"❌ ERROR: DATABASE_URL is not set in environment variables!",
		);
		process.exit(1);
	}

	// Mask password for safe logging
	const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
	console.log(`📡 Target Database: ${maskedUrl}`);

	const maxRetries = 10;
	const retryDelayMs = 3000;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(
				`🔄 Executing Prisma migrations (Attempt ${attempt}/${maxRetries})...`,
			);
			execSync("bun run prisma migrate deploy", {
				stdio: "inherit",
				env: process.env,
			});
			console.log("✅ Database migrations applied successfully!");
			process.exit(0);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error(`⚠️ Migration attempt ${attempt} failed: ${errorMessage}`);
			if (attempt < maxRetries) {
				console.log(
					`⏳ Waiting ${retryDelayMs / 1000}s before next attempt...`,
				);
				await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
			} else {
				console.error("❌ All migration attempts failed. Exiting.");
				process.exit(1);
			}
		}
	}
}

runMigrations();
