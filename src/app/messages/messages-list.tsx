"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { quickSearchMembers, type QuickSearchMember } from "@/actions/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEBOUNCE_MS = 250;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Conversation = {
  partner: { id: string; name: string; avatarUrl: string | null };
  lastMessage: { content: string; createdAt: Date };
  unreadCount: number;
};

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

export function MessagesList({ conversations }: { conversations: Conversation[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [memberResults, setMemberResults] = useState<QuickSearchMember[]>([]);

  const trimmed = query.trim();
  const existingIds = new Set(conversations.map((c) => c.partner.id));

  const filteredConversations = trimmed
    ? conversations.filter((c) =>
        c.partner.name.toLowerCase().includes(trimmed.toLowerCase())
      )
    : conversations;

  useEffect(() => {
    if (!trimmed) {
      setMemberResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const results = await quickSearchMembers(trimmed);
      setMemberResults(results.filter((m) => !existingIds.has(m.id)));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed]);

  return (
    <>
      <div className="flex items-center justify-between py-3">
        <h1 className="text-[18px] font-bold">Messages</h1>
        <button
          type="button"
          onClick={() => {
            setSearchOpen((v) => !v);
            setQuery("");
          }}
          aria-label={searchOpen ? "Fermer la recherche" : "Rechercher une conversation"}
          className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors"
        >
          {searchOpen ? (
            <X size={18} strokeWidth={1.8} />
          ) : (
            <Search size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {searchOpen && (
        <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 mb-3">
          <Search size={14} strokeWidth={2} className="shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une personne..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

      {memberResults.length > 0 && (
        <div className="flex flex-col gap-1 pb-2">
          <p className="px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase">
            Nouvelle conversation
          </p>
          {memberResults.map((member) => (
            <Link
              key={member.id}
              href={`/messages/${member.id}`}
              className="flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-muted"
            >
              <Avatar size="sm">
                <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name} />
                <AvatarFallback className="text-[10px]">
                  {initialsOf(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.role}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredConversations.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-muted-foreground">
          {trimmed ? "Aucune conversation trouvée." : "Aucune conversation pour le moment."}
        </p>
      ) : (
        <ul className="flex flex-col">
          {filteredConversations.map(({ partner, lastMessage, unreadCount }) => {
            const initials = initialsOf(partner.name);
            const isUnread = unreadCount > 0;

            return (
              <li key={partner.id}>
                <Link
                  href={`/messages/${partner.id}`}
                  className="flex items-center gap-3 py-[12px] border-b border-border last:border-0"
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-[48px]">
                      <AvatarImage src={partner.avatarUrl ?? undefined} alt={partner.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <span className={`text-[14px] leading-tight ${isUnread ? "font-bold" : "font-medium"}`}>
                      {partner.name}
                    </span>
                    <span className={`truncate text-[12px] ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {lastMessage.content}
                    </span>
                  </div>

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
    </>
  );
}
