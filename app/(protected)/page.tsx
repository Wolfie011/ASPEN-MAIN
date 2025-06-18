import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Users, Building2, Lock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Użytkownicy</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-muted-foreground">Zarejestrowanych w systemie</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Jednostki</CardTitle>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">Oddziały i podjednostki</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Uprawnienia</CardTitle>
          <Lock className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">Zdefiniowane role w systemie</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Witaj w panelu administracyjnym</CardTitle>
          <CardDescription>
            Tutaj możesz zarządzać użytkownikami, jednostkami organizacyjnymi i uprawnieniami. Wybierz odpowiednią sekcję z menu po lewej stronie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeCheck className="text-green-600 h-10 w-10" />
        </CardContent>
      </Card>
    </div>
  );
}
