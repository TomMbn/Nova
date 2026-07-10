import { getConversations } from "@/queries/messages";
import { TopBar } from "@/components/feed/top-bar";
import { BottomNav } from "@/components/bottom-nav";

import { MessagesList } from "./messages-list";

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />

      <main className="flex-1 flex flex-col px-[14px] pt-2">
        <MessagesList conversations={conversations} />
      </main>
      <BottomNav />
    </div>
  );
}
