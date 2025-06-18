"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { signUpSchema } from "@/types/auth/schema";
import { signIn, signUp } from "@/app/actions/auth.action";
import { toast } from "@/hooks/use-toast";

import { User, Lock, Mail, UserCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export function SignUpForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    try {
      const signUpRes = await signUp(values);

      if (signUpRes.error) {
        toast({ variant: "destructive", description: signUpRes.error });
        return;
      }

      toast({ variant: "default", description: "Pomyślnie zarejestrowano" });

      const signInRes = await signIn({
        userName: values.userName,
        password: values.password,
      });

      if (signInRes.error) {
        toast({
          variant: "destructive",
          description: "Rejestracja się udała, ale logowanie nie powiodło się.",
        });
        return;
      }

      router.push("/");
    } catch (error) {
      console.error("Unexpected error:", error);
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
              <FormLabel>Login</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} placeholder="Wpisz nazwę użytkownika..." />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} placeholder="Wpisz imię..." />
                    <UserCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwisko</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} placeholder="Wpisz nazwisko..." />
                    <UserCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} placeholder="Wpisz email..." />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type="password" placeholder="Wpisz hasło..." />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdź hasło</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type="password" placeholder="Potwierdź hasło..." />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
              Rejestrowanie...
            </span>
          ) : (
            "Zarejestruj się"
          )}
        </Button>
      </form>
    </Form>
  );
}
