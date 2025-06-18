"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { createObject, updateObject } from "@/app/actions/object.action";
import { CreateObjectInput, createObjectSchema } from "@/types/object/schema";
import { ObjectType } from "@/types/object/types";
import emitter from "@/lib/eventBus";
import { toast } from "@/hooks/use-toast";

interface CreateObjectDialogProps {
  parentId?: string;
  parentLevel?: number;
  object?: ObjectType; // jeśli podany, tryb edycji
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateObjectDialog({
  parentId,
  parentLevel,
  object,
  open,
  onOpenChange,
}: CreateObjectDialogProps) {
  const isEdit = !!object;

  const form = useForm<CreateObjectInput>({
    resolver: zodResolver(createObjectSchema),
    defaultValues: {
      name: "",
      description: "",
      level: parentLevel !== undefined ? parentLevel + 1 : 0,
      type: "Organization",
      parentId,
    },
  });

  useEffect(() => {
    if (object) {
      form.reset({
        name: object.name,
        description: object.description || "",
        level: object.level,
        type: object.type,
        parentId: object.parentId || undefined,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        level: parentLevel !== undefined ? parentLevel + 1 : 0,
        type: "Unit",
        parentId,
      });
    }
  }, [object, parentId, parentLevel, form]);

  const onSubmit = useCallback(
    async (values: CreateObjectInput) => {
      if (
        !isEdit &&
        typeof parentLevel === "number" &&
        values.level <= parentLevel
      ) {
        toast({
          variant: "destructive",
          description: `Poziom musi być większy niż poziom rodzica (${parentLevel})`,
        });
        return;
      }

      const result = isEdit
        ? await updateObject(object!.id, values)
        : await createObject({ ...values, parentId });

      if (result.state === "error") {
        toast({ variant: "destructive", description: result.error });
        return;
      }

      toast({
        description: isEdit ? "Obiekt zaktualizowany" : "Obiekt utworzony",
      });

      emitter.emit(isEdit ? "objectUpdated" : "objectCreated", result.data!);

      form.reset();
      onOpenChange(false);
    },
    [form, onOpenChange, parentLevel, parentId, isEdit, object]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edytuj obiekt" : "Nowy obiekt"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa</FormLabel>
                  <FormControl>
                    <Input placeholder="Podaj nazwę" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opis obiektu..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poziom</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={
                        parentLevel !== undefined && !isEdit
                          ? parentLevel + 1
                          : 0
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Organization">Organizacja</SelectItem>
                      <SelectItem value="Unit">Jednostka</SelectItem>
                      <SelectItem value="Room">Pokój</SelectItem>
                      <SelectItem value="Bed">Łóżko</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full">
                {isEdit ? "Zapisz zmiany" : "Utwórz"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
