"use client"
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth.action";
import { toast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react"
export function SignOutForm() {
  const router = useRouter(); // Next.js router for navigation
  const signOutForm = useForm();

  async function onSubmit() {
    try {
      const res = await signOut();
      if (res.error) {
        toast({
          variant: "destructive",
          description: res.error,
        });
      } else if (res.success) {
        toast({
          variant: "default",
          description: "Signed out successfully",
        });
        router.push("/"); // Use `useRouter` for client-side navigation
      }
    } catch (error: unknown) {
      // Use unknown instead of any
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          description: `An unexpected error occurred. Please try again.\n ${error.message}`,
        });
      } else {
        toast({
          variant: "destructive",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    }
  }

  return (
    <Form {...signOutForm}>
      <form onSubmit={signOutForm.handleSubmit(onSubmit)} className="w-full">
        <Button type="submit" className="w-full">
            <LogOut />
            Log out
        </Button>
      </form>
    </Form>
  );
}
