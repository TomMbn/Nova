import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSessionUserId } from "@/lib/auth";
import { getMessagesWith } from "@/queries/messages";
import { getUserById } from "@/queries/users";
import { markAsRead } from "@/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      {/* Header */}
      <header className="flex items-center gap-3 px-[14px] py-[15px] sticky top-0 bg-background z-40 border-b border-[#e8e8e8]">
        <Link
          href="/messages"
          className="flex items-center justify-center size-[38px] rounded-[10px] hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <Avatar size="sm">
          <AvatarImage src={partner.avatarUrl ?? undefined} alt={partner.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="text-[14px] font-bold truncate">{partner.name}</span>
      </header>

      <Conversation
        partnerId={userId}
        currentUserId={String(currentUserId)}
        initialMessages={result.messages}
      />
    </div>
  );
}
