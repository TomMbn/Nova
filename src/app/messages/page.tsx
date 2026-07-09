import { getConversations } from "@/queries/messages";
import { TopBar } from "@/components/feed/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />
      <main className="flex-1 flex flex-col px-4 pt-1">
        <h1 className="pb-3 text-lg font-semibold">Messages</h1>

        {conversations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune conversation pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {conversations.map(({ partner, lastMessage, unreadCount }) => {
              const initials = partner.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <li key={partner.id} className="flex items-center gap-3 py-3">
                  <Avatar size="lg">
                    <AvatarImage
                      src={partner.avatarUrl ?? undefined}
                      alt={partner.name}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">{partner.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {lastMessage.content}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                    {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
