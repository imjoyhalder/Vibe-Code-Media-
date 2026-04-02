import "dotenv/config";
import { defineConfig } from "prisma/config";
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // This allows 'npx prisma migrate' and 'generate' to find your DB
        url: process.env.DATABASE_URL,
    },
});
