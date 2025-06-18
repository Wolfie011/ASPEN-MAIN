"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTableUser/DataTable";
import { columns } from "@/app/(protected)/users/columns";
import { UserDTO } from "@/types/user/types";
import { UserManagementDialog } from "@/components/DataTableUser/userManagementDialog";
import emitter from "@/lib/eventBus";
import { listUsers } from "@/app/actions/user.action";

export default function UserPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(14);

  const fetchUsers = async (page: number, size: number) => {
    const result = await listUsers(page + 1, size);
    if (result.state === "success" && result.data) {
      setUsers(result.data.data);
      setTotal(result.data.total);
    }
  };

  useEffect(() => {
    fetchUsers(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  useEffect(() => {
    const openHandler = (user: UserDTO) => {
      setEditingUser(user);
      setDialogOpen(true);
    };

    const createdHandler = (newUser: UserDTO) => {
      fetchUsers(pageIndex, pageSize);
    };

    const deletedHandler = (deletedId: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== deletedId));
      setTotal((prev) => prev - 1);
    };

    const updatedHandler = (updated: UserDTO) => {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    };

    emitter.on("openUserDialog", openHandler);
    emitter.on("userCreated", createdHandler);
    emitter.on("userDeleted", deletedHandler);
    emitter.on("userUpdated", updatedHandler);

    return () => {
      emitter.off("openUserDialog", openHandler);
      emitter.off("userCreated", createdHandler);
      emitter.off("userDeleted", deletedHandler);
      emitter.off("userUpdated", updatedHandler);
    };
  }, [pageIndex, pageSize]);

 

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        total={total}
        onPaginationChange={(index: number, size: number) => {
          setPageIndex(index);
          setPageSize(size);
        }}
      />

      <UserManagementDialog
        user={editingUser!}
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDialogOpen(false);
            setEditingUser(null);
          }
        }}
      />
    </>
  );
}
