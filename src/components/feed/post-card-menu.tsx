"use client";

import { useTransition } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { deletePost } from "@/actions/posts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Menu "..." affiché uniquement pour l'auteur du post — seule action : supprimer. */
export function PostCardMenu({
  postId,
  onDeleted,
}: {
  postId: string;
  onDeleted: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Supprimer définitivement ce post ?")) return;
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.success) onDeleted();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label="Options du post"
        className="flex items-center justify-center size-6 rounded-[6px] hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
      >
        <MoreVertical size={16} strokeWidth={1.8} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 size={14} strokeWidth={1.8} />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
