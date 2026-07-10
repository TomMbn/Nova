import Link from "next/link";
import { Search } from "lucide-react";
import { getConversations } from "@/queries/messages";
import { TopBar } from "@/components/feed/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatTime(date: Date) {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />

      <main className="flex-1 flex flex-col px-[14px] pt-2">
        {/* Titre + bouton recherche */}
        <div className="flex items-center justify-between py-3">
          <h1 className="text-[18px] font-bold">Messages</h1>
          <Link
            href="/recherche"
            className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors"
          >
            <Search size={18} strokeWidth={1.8} />
          </Link>
        </div>

        {conversations.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-muted-foreground">
            Aucune conversation pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col">
            {conversations.map(({ partner, lastMessage, unreadCount }) => {
              const initials = partner.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const isUnread = unreadCount > 0;

              return (
                <li key={partner.id}>
                  <Link
                    href={`/messages/${partner.id}`}
                    className="flex items-center gap-3 py-[12px] border-b border-border last:border-0"
                  >
                    {/* Avatar avec indicateur en ligne */}
                    <div className="relative shrink-0">
                      <Avatar className="size-[48px]">
                        <AvatarImage src={partner.avatarUrl ?? undefined} alt={partner.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Contenu */}
                    <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                      <span className={`text-[14px] leading-tight ${isUnread ? "font-bold" : "font-medium"}`}>
                        {partner.name}
                      </span>
                      <span className={`truncate text-[12px] ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {lastMessage.content}
                      </span>
                    </div>

                    {/* Date + badge */}
                    <div className="flex flex-col items-end gap-[6px] shrink-0">
                      <span className={`text-[11px] ${isUnread ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {formatTime(lastMessage.createdAt)}
                      </span>
                      {isUnread && (
                        <span className="flex items-center justify-center size-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
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
