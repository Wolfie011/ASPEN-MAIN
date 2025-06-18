"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { UserPlus2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";
import emitter from "@/lib/eventBus";

import { signUpSchema } from "@/types/auth/schema";
import { SignUpInput } from "@/types/auth/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { createUser } from "@/app/actions/user.action";

// Pola formularza konta
function AccountDetailsFields({ control }: { control: any }) {
  return (
    <TabsContent value="account" className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login</FormLabel>
              <FormControl>
                <Input placeholder="jankowalski" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jan.kowalski@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię</FormLabel>
              <FormControl>
                <Input placeholder="Jan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwisko</FormLabel>
              <FormControl>
                <Input placeholder="Kowalski" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdź hasło</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </TabsContent>
  );
}

// Główna funkcja komponentu dialogu
export function CreateUserDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

const onSubmit = useCallback(
    async (values: SignUpInput) => {
      try {
        const result = await createUser(values);

        if (result.state === "error") {
          toast({
            variant: "destructive",
            description: result.error || "Błąd podczas tworzenia użytkownika",
          });
          return;
        }

        toast({
          variant: "default",
          description: result.success || "Użytkownik został utworzony",
        });

        if (result.data) {
          emitter.emit("userCreated", result.data);
        }

        form.reset();
        setOpen(false);
      } catch (err) {
        console.error("An unexpected error occurred", err);
        toast({
          variant: "destructive",
          description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        });
      }
    },
    [form]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus2 />
          Utwórz użytkownika
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Stwórz nowego użytkownika</DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="account">Szczegóły konta</TabsTrigger>
              </TabsList>
              <AccountDetailsFields control={form.control} />
            </Tabs>

            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Tworzę..." : "Stwórz"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
