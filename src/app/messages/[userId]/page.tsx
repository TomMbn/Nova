import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MoreHorizontal } from "lucide-react";
import { getSessionUserId } from "@/lib/auth";
import { getMessagesWith } from "@/queries/messages";
import { getUserById } from "@/queries/users";
import { markAsRead } from "@/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopBar } from "@/components/feed/top-bar";
import { Conversation } from "@/components/messages/conversation";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [currentUserId, partner, result] = await Promise.all([
    getSessionUserId(),
    getUserById(userId),
    getMessagesWith(userId),
  ]);

  if (!partner) notFound();
  if (!result || !currentUserId) notFound();

  await markAsRead(userId);

  const initials = partner.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col h-svh">
      <TopBar />

      {/* Header conversation */}
      <header className="flex items-center gap-3 px-[14px] py-[10px] bg-background z-40 border-b border-border">
        <Link
          href="/messages"
          className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <Avatar className="size-[48px] shrink-0">
          <AvatarImage src={partner.avatarUrl ?? undefined} alt={partner.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[15px] font-bold truncate">{partner.name}</span>
          <div className="flex items-center gap-[5px]">
            <span className="size-[8px] rounded-full bg-green-500 shrink-0" />
            <span className="text-[12px] text-muted-foreground">En ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors">
            <Calendar size={18} strokeWidth={1.8} className="text-primary" />
          </button>
          <button className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors">
            <MoreHorizontal size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <Conversation
        partnerId={userId}
        currentUserId={String(currentUserId)}
        initialMessages={result.messages}
      />
    </div>
  );
}
