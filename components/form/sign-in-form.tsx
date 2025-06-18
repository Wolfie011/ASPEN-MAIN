"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { signIn } from "@/app/actions/auth.action";
import { signInSchema } from "@/types/auth/schema";
import { toast } from "@/hooks/use-toast";

import { User, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    try {
      const res = await signIn(values);

      if (res.error) {
        toast({ variant: "destructive", description: res.error });
      } else if (res.success) {
        router.push("/");
        toast({ variant: "default", description: "Pomyślnie zalogowano" });
      }
    } catch (error) {
      console.error("An unexpected error occurred", error);
      toast({
        variant: "destructive",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Login</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Wpisz nazwę użytkownika..."
                    className="p-3"
                  />
                  <User
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Hasło</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type="password"
                    placeholder="Wpisz hasło..."
                    className="p-3"
                  />
                  <Lock
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
