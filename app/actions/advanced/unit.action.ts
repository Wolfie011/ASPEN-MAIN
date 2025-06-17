"use server";

import { eq, inArray } from "drizzle-orm";
import db from "@/lib/database";
import {
  unitTable,
  userTable,
  userUnitTable,
  roomTable,
  bedTable,
} from "@/lib/database/schema";
import wrap, { authorize, hasPermission } from "@/lib/utils_backend";
import { ActionResultGeneric } from "@/types/auth.type";

export type Unit = {
  id: string;
  name: string;
  description: string | null;
  director: {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
  } | null;
  phone: string | null;
  location: string | null;
  users: {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
  }[];
  rooms: {
    id: string;
    name: string;
    beds: { id: string; name: string }[];
  }[];
};

export const listUnits = async (): Promise<ActionResultGeneric<Unit[]>> =>
  wrap(async () => {
    const requiredPermission = "unit:list";
    const { user: authUser } = await authorize();
    if (!authUser) {
      return { state: "error", error: "Authentication required" };
    }
    if (!(await hasPermission(authUser.id, requiredPermission))) {
      return { state: "error", error: "Insufficient permissions" };
    }

    return await db.transaction(async (tx) => {
      // 1) Pobierz wszystkie jednostki
      const units = await tx.query.unitTable.findMany();
      const unitIds = units.map((u) => u.id);
      if (unitIds.length === 0) {
        return { state: "success", success: "No units found", data: [] };
      }

      // 2) Pobierz dyrektorów (LEFT JOIN)
      const directorRows = await tx
        .select({
          unitId: unitTable.id,
          dirId: userTable.id,            // może być null
          userName: userTable.userName,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
        })
        .from(unitTable)
        .leftJoin(userTable, eq(unitTable.directorId, userTable.id))
        .where(inArray(unitTable.id, unitIds));

      // 3) Pobierz użytkowników przypisanych do jednostek
      const unitUserRows = await tx
        .select({
          unitId: userUnitTable.unitId,
          id: userTable.id,
          userName: userTable.userName,
          firstName: userTable.firstName,
          lastName: userTable.lastName,
        })
        .from(userUnitTable)
        .innerJoin(userTable, eq(userUnitTable.userId, userTable.id))
        .where(inArray(userUnitTable.unitId, unitIds));

      // 4) Pobierz pokoje
      const roomRows = await tx
        .select({
          unitId: roomTable.unitId,
          id: roomTable.id,
          name: roomTable.name,
        })
        .from(roomTable)
        .where(inArray(roomTable.unitId, unitIds));

      // 5) Pobierz łóżka tylko dla istniejących pokoi
      const roomIds = roomRows.map((r) => r.id);
      let rawBedRows = await tx
        .select({
          roomId: bedTable.roomId,  // string|null
          id: bedTable.id,
          name: bedTable.name,
        })
        .from(bedTable)
        .where(inArray(bedTable.roomId, roomIds));

      // Filtrujemy tylko te, które mają nie-null roomId
      const bedRows: { roomId: string; id: string; name: string }[] =
        rawBedRows
          .filter((r): r is { roomId: string; id: string; name: string } => 
            r.roomId !== null
          );

      // 6) Przygotuj mapy
      const directorMap = new Map<string, Unit["director"]>();
      const usersMap = new Map<string, Unit["users"]>();
      const roomsMap = new Map<string, Unit["rooms"]>();

      for (const id of unitIds) {
        directorMap.set(id, null);
        usersMap.set(id, []);
        roomsMap.set(id, []);
      }

      // Wypełnij dyrektorów
      for (const row of directorRows) {
        if (row.dirId !== null) {
          directorMap.set(row.unitId, {
            id: row.dirId,
            userName: row.userName || "Unknown",
            firstName: row.firstName || "Unknown",
            lastName: row.lastName || "Unknown",
          });
        }
      }

      // Wypełnij użytkowników
      for (const row of unitUserRows) {
        usersMap.get(row.unitId)!.push({
          id: row.id,
          userName: row.userName,
          firstName: row.firstName,
          lastName: row.lastName,
        });
      }

      // Wypełnij pokoje
      for (const row of roomRows) {
        roomsMap.get(row.unitId)!.push({ id: row.id, name: row.name, beds: [] });
      }

      // Wypełnij łóżka
      for (const bed of bedRows) {
        // znajdź odpowiadający pokój
        const roomEntry = roomRows.find((r) => r.id === bed.roomId);
        if (!roomEntry) continue; 
        const unitId = roomEntry.unitId;
        const roomList = roomsMap.get(unitId)!;
        const room = roomList.find((r) => r.id === bed.roomId)!;
        room.beds.push({ id: bed.id, name: bed.name });
      }

      // 7) Złóż finalne Unit[]
      const result: Unit[] = units.map((u) => ({
        id: u.id,
        name: u.name,
        description: u.description,
        director: directorMap.get(u.id) ?? null,
        phone: u.phone,       // null lub string
        location: u.location, // null lub string
        users: usersMap.get(u.id)!,
        rooms: roomsMap.get(u.id)!,
      }));

      return { state: "success", success: "Units retrieved", data: result };
    });
  });