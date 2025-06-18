import mitt from "mitt";
import { UserDTO } from "@/types/user/types";
import { ObjectType } from "@/types/object/types";

// Definicja typów zdarzeń aplikacji
type Events = {
  // Users
  userCreated: UserDTO;
  userUpdated: UserDTO;
  userDeleted: string;
  openUserDialog: UserDTO;

  // Objects (organizacja)
  objectCreated: ObjectType;
  objectUpdated: ObjectType;
  objectDeleted: string;
  objectDeleteRequested: string;
  objectEditRequested: string;
  edgeDeleteRequested: {
    id: string;
    source: string;
    target: string;
  };
};

// Globalny emitter typu Events
const emitter = mitt<Events>();

export default emitter;
