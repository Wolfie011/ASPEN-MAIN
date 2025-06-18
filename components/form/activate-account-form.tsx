"use client";

import { accountActivation } from "@/app/actions/auth.action";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { activationSchema } from "@/types/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Loader2, Lock, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export function AccountActivationDialog() {
	const [open, setOpen] = useState(false);
	const [enablePin, setEnablePin] = useState(false);

	useEffect(() => {
		setOpen(true);
	}, []);

	const form = useForm<z.infer<typeof activationSchema>>({
		resolver: zodResolver(activationSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
			pin: "",
		},
	});

	async function onSubmit(values: z.infer<typeof activationSchema>) {
		try {
			const res = await accountActivation(values);
			if (res.error) {
				toast({ variant: "destructive", description: res.error });
			} else {
				toast({ variant: "default", description: res.success! });
				form.reset();
				setEnablePin(false);
				setOpen(false);
			}
		} catch (err) {
			console.error("An unexpected error occurred", err);
			toast({
				variant: "destructive",
				description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				className="sm:max-w-[425px]"
				forceMount
				onEscapeKeyDown={(e) => e.preventDefault()}
				onPointerDownOutside={(e) => e.preventDefault()}
			>
				<AnimatePresence>
					{open && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<DialogHeader>
								<div className="flex items-center gap-2">
									<KeyRound className="size-5" />
									<DialogTitle>Aktywuj swoje konto</DialogTitle>
								</div>
								<DialogDescription className="mt-1">
									Ustaw nowe hasło i (opcjonalnie) kod PIN, aby zwiększyć
									bezpieczeństwo.
								</DialogDescription>
							</DialogHeader>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6 pt-4"
								>
									{/* Password */}
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nowe hasło</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type="password"
															placeholder="Wprowadź nowe hasło"
															{...field}
															className="pl-10"
														/>
														<Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Confirm Password */}
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Potwierdź hasło</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type="password"
															placeholder="Potwierdź nowe hasło"
															{...field}
															className="pl-10"
														/>
														<Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Enable PIN Switch */}
									<div className="flex items-center justify-between rounded-lg border p-4">
										<div>
											<p className="text-base font-medium">Ustaw kod PIN</p>
											<p className="text-sm text-muted-foreground">
												Szybkie odblokowywanie
											</p>
										</div>
										<Switch
											id="enablePin"
											checked={enablePin}
											onCheckedChange={(val) => {
												setEnablePin(val);
												if (!val) form.setValue("pin", "");
											}}
										/>
									</div>

									{/* PIN Field (conditionally rendered) */}
									<AnimatePresence>
										{enablePin && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2 }}
												className="overflow-hidden"
											>
												<FormField
													control={form.control}
													name="pin"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Kod PIN</FormLabel>
															<FormControl>
																<Input
																	type="text"
																	inputMode="numeric"
																	placeholder="6 cyfr"
																	maxLength={6}
																	required={false}
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</motion.div>
										)}
									</AnimatePresence>

									<Button
										type="submit"
										className="w-full flex justify-center gap-2"
										disabled={form.formState.isSubmitting}
									>
										{form.formState.isSubmitting ? (
											<>
												<Loader2 className="animate-spin size-4" />
												Zapisuję...
											</>
										) : (
											<>
												<Save className="size-4" />
												Zapisz zmiany
											</>
										)}
									</Button>
								</form>
							</Form>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}
