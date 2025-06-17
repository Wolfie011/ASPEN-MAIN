import mitt from "mitt";
import { User } from "@/app/actions/user.action";
import { Role, RolePermission } from "@/types/permission.type";

type Events = {
  userCreated: User;
  userUpdated: User;
  userDeleted: string;
  openUserDialog: User;

  roleCreated: Role;
  roleDeleted: string;

  rolePermissionUpdated: RolePermission;
};

const  emitter = mitt<Events>();

export default emitter;
