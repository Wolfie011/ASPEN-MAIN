// lib/swagger.ts
import { promises as fs } from "fs";
import { join } from "path";
import { createSwaggerSpec } from "next-swagger-doc";
const PUBLIC_PATH = join(process.cwd(), "public", "openapi.json");

export async function getApiDocs() {
	if (process.env.NODE_ENV !== "production") {
		// === DEVELOPMENT: generuj na bieżąco ===
		const spec = createSwaggerSpec({
			apiFolder: "app/api",
			definition: {
				openapi: "3.0.0",
				info: {
					title: "MedicalTech - API",
					version: "1.0.0",
				},
				components: {},
			},
		});

		// Zapisz do pliku, żeby klienty mogły go pobrać
		await fs.writeFile(PUBLIC_PATH, JSON.stringify(spec, null, 2), "utf8");
		console.log("✔️  OpenAPI spec regenerated");
		return spec;
	} else {
		// === PRODUCTION: odczyt z gotowego pliku ===
		const raw = await fs.readFile(PUBLIC_PATH, "utf8");
		return JSON.parse(raw);
	}
}
