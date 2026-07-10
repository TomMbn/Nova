import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { getSessionUserId } from "@/lib/auth";
import { TopBar } from "@/components/feed/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function NotificationsPage() {
  const userId = await getSessionUserId();
  if (userId === null) redirect("/login");

  return (
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />
      <main className="flex-1 flex flex-col">
        <h1 className="px-4 pt-3 pb-1 text-lg font-semibold">Notifications</h1>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Bell size={24} strokeWidth={1.6} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
