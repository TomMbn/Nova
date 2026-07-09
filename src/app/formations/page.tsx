import { getFormationVideos, getFormationSessions } from "@/queries/formations";
import { TopBar } from "@/components/feed/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { FormationsWithTabs } from "@/components/formations/formations-with-tabs";

export default async function FormationsPage() {
  const [videos, sessions] = await Promise.all([
    getFormationVideos(),
    getFormationSessions(),
  ]);

  return (
    <>
      <div className="flex flex-col min-h-full pb-20">
        <TopBar />
        <main className="flex-1">
          <FormationsWithTabs videos={videos} sessions={sessions} />
        </main>
      </div>
      <BottomNav />
    </>
  );
}
