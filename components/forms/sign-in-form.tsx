"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signInSchema } from "@/types/auth.type";
import { signIn } from "@/app/actions/auth.actions";
import { toast } from "@/hooks/use-toast";
import { User, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function SignInForm() {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      userName: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    try {
      const res = await signIn(values);
      if (res.error) {
        toast({ variant: "destructive", description: res.error });
      } else if (res.success) {
        toast({ variant: "default", description: "Pomyślnie zalogowano" });
      }
    } catch (error) {
      console.error("An unexpected error occurred", error);
      toast({
        variant: "destructive",
        description: "Wystąpil nieoczekiwany błąd. Spróbuj ponownie.",
      });    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField control={form.control} name="userName" render={({ field }) => (
          <FormItem>
          <FormLabel className="text-sm font-medium">Login</FormLabel>
          <FormControl>
            <div className="relative">
              <Input placeholder="Wpisz nazwę użytkownika..." {...field} className="p-3" />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </FormControl>
          <FormMessage>{form.formState.errors?.userName?.message}</FormMessage>
        </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
          <FormLabel className="text-sm font-medium">Hasło</FormLabel>
          <FormControl>
            <div className="relative">
              <Input type="password" placeholder="Wpisz hasło..." {...field} className="p-3" />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </FormControl>
          <FormMessage>{form.formState.errors?.password?.message}</FormMessage>
        </FormItem>
        )} />

<Button
          type="submit"
          variant="default"
          className="w-full mt-4"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logowanie...
            </span>
          ) : (
            "Zaloguj się"
          )}
        </Button>
      </form>
    </Form>
  );
}
