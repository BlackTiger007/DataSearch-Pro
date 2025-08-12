import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	out: './src-tauri/migrations',
	dbCredentials: { url: ':memory:' },
	verbose: true,
	strict: true
});
