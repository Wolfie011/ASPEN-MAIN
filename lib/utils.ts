import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

import type { ZodSchema } from "zod";

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}
export function validate<T>(schema: ZodSchema<T>, values: unknown): T {
	const result = schema.safeParse(values);
	if (!result.success) {
		// Return errors in a structured way
		throw new ValidationError(
			JSON.stringify(result.error.flatten().fieldErrors),
		);
	}
	return result.data;
}