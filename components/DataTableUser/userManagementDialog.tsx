"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ThemedAsyncSelect from "@/components/ui/themed-select";
import emitter from "@/lib/eventBus";
import { toast } from "@/hooks/use-toast";

import { updateUserSchema } from "@/types/user/schema";
import { UpdateUserInput, UserDTO } from "@/types/user/types";

import { listRoles } from "@/app/actions/role.action";
import { listRoleJobs } from "@/app/actions/role-job.action";
import { updateUser } from "@/app/actions/user.action";

type Option = { value: string; label: string };

interface UserManagementDialogProps {
  user: UserDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({
  user,
  open,
  onOpenChange,
}: UserManagementDialogProps) {
  if (!user) return null;

  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [allRoles, setAllRoles] = useState<Option[]>([]);
  const [isLoadingRoleJob, setIsLoadingRoleJob] = useState(true);
  const [allRoleJobs, setAllRoleJobs] = useState<Option[]>([]);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: user.id,
      firstName: user.firstName,
      userName: user.userName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      roleJob:
        user.roleJob?.map(({ id, tag }) => ({ value: id, label: tag })) || [],
      permissionRole:
        user.permissionRole?.map(({ id, tag }) => ({
          value: id,
          label: tag,
        })) || [],
    },
  });

  useEffect(() => {
    form.reset({
      id: user.id,
      firstName: user.firstName,
      userName: user.userName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      roleJob:
        user.roleJob?.map(({ id, tag }) => ({ value: id, label: tag })) || [],
      permissionRole:
        user.permissionRole?.map(({ id, tag }) => ({
          value: id,
          label: tag,
        })) || [],
    });
  }, [user, form]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingRole(true);
        const rolesRes = await listRoles();
        if (rolesRes.state === "success" && rolesRes.data) {
          setAllRoles(
            rolesRes.data.map((r) => ({ value: r.id, label: r.tag }))
          );
        } else {
          throw new Error(rolesRes.error);
        }
      } catch {
        toast({
          title: "Błąd",
          description: "Wystąpił błąd podczas ładowania ról.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRole(false);
      }

      try {
        setIsLoadingRoleJob(true);
        const jobsRes = await listRoleJobs();
        if (jobsRes.state === "success" && jobsRes.data) {
          setAllRoleJobs(
            jobsRes.data.map((rj) => ({ value: rj.id, label: rj.tag }))
          );
        } else {
          throw new Error(jobsRes.error);
        }
      } catch {
        toast({
          title: "Błąd",
          description: "Wystąpił błąd podczas ładowania stanowisk.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRoleJob(false);
      }
    }

    if (open) fetchData();
  }, [open]);

  const promiseRole = (inputValue: string): Promise<Option[]> =>
    Promise.resolve(
      inputValue.trim() === ""
        ? allRoles
        : allRoles.filter((role) =>
            role.label.toLowerCase().includes(inputValue.toLowerCase())
          )
    );

  const promiseRoleJob = (inputValue: string): Promise<Option[]> =>
    Promise.resolve(
      inputValue.trim() === ""
        ? allRoleJobs
        : allRoleJobs.filter((rj) =>
            rj.label.toLowerCase().includes(inputValue.toLowerCase())
          )
    );

  const onSubmit = useCallback(
    async (values: UpdateUserInput) => {
      try {
        const res = await updateUser(values);

        if (res.state === "error") {
          toast({
            variant: "destructive",
            description: res.error || "Błąd podczas aktualizacji użytkownika",
          });
          return;
        }

        toast({
          variant: "default",
          description: res.success || "Użytkownik został zaktualizowany",
        });
        if(!res.data){
          toast({
            variant: "destructive", 
            description: "Nie otrzymano danych użytkownika po aktualizacji."
          });
          return;
        }
        emitter.emit("userUpdated", res.data);
        form.reset();
        onOpenChange(false);
      } catch (err) {
        console.error("Nieoczekiwany błąd:", err);
        toast({
          variant: "destructive",
          description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
        });
      }
    },
    [form, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Aktualizuj dane użytkownika</DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Szczegóły Konta</TabsTrigger>
                <TabsTrigger value="personal">Informacje Osobiste</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="jan.kowalski@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer Telefonu</FormLabel>
                      <FormControl>
                        <Input placeholder="(+00) 000-000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleJob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stanowiska</FormLabel>
                      <ThemedAsyncSelect
                        isMulti
                        cacheOptions
                        defaultOptions
                        isDisabled={isLoadingRoleJob}
                        isLoading={isLoadingRoleJob}
                        loadOptions={promiseRoleJob}
                        onChange={(selected: Option[]) =>
                          field.onChange(selected || [])
                        }
                        value={field.value || []}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permissionRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uprawnienia</FormLabel>
                      <ThemedAsyncSelect
                        isMulti
                        cacheOptions
                        defaultOptions
                        isDisabled={isLoadingRole}
                        isLoading={isLoadingRole}
                        loadOptions={promiseRole}
                        onChange={(selected: Option[]) =>
                          field.onChange(selected || [])
                        }
                        value={field.value || []}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit" className="w-full">
                Aktualizuj
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
