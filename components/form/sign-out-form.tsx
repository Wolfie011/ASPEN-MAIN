"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { signOut } from "@/app/actions/auth.action";
import { toast } from "@/hooks/use-toast";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

export function SignOutForm() {
  const router = useRouter();
  const signOutForm = useForm();

  async function onSubmit() {
    try {
      const res = await signOut();

      if (res.error) {
        toast({ variant: "destructive", description: res.error });
      } else if (res.success) {
        toast({ variant: "default", description: "Wylogowano pomyślnie" });
        router.push("/");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          description: `Wystąpił błąd: ${error.message}`,
        });
      } else {
        toast({
          variant: "destructive",
          description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        });
      }
    }
  }

  return (
    <Form {...signOutForm}>
      <form onSubmit={signOutForm.handleSubmit(onSubmit)} className="w-full">
        <Button type="submit" className="w-full flex items-center gap-2">
          <LogOut size={18} />
          Wyloguj się
        </Button>
      </form>
    </Form>
  );
}
