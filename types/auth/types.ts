import { z } from "zod";
import { signInSchema, signUpSchema, activationSchema } from "./schema";

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ActivationInput = z.infer<typeof activationSchema>;
