"use client";

import { useState, useTransition } from "react";
import { vote } from "@/actions/polls";
import { cn } from "@/lib/utils";

export type PollWithResults = {
  id: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
  totalVotes: number;
  votedOptionId: string | null;
};

/** Sondage interactif : vote optimiste, changement de vote autorisé. */
export function PollVote({ poll: initialPoll }: { poll: PollWithResults }) {
  const [poll, setPoll] = useState(initialPoll);
  const [isPending, startTransition] = useTransition();

  function handleVote(optionId: string) {
    if (isPending || optionId === poll.votedOptionId) return;

    const previous = poll;
    const votedBefore = previous.votedOptionId;

    setPoll({
      ...previous,
      votedOptionId: optionId,
      totalVotes: votedBefore ? previous.totalVotes : previous.totalVotes + 1,
      options: previous.options.map((o) => {
        if (o.id === optionId) return { ...o, votes: o.votes + 1 };
        if (o.id === votedBefore) return { ...o, votes: o.votes - 1 };
        return o;
      }),
    });

    startTransition(async () => {
      const result = await vote(poll.id, optionId);
      if (!result.success) setPoll(previous);
    });
  }

  return (
    <div className="rounded-[10px] border border-border p-3 flex flex-col gap-2">
      <p className="text-sm font-bold">{poll.question}</p>
      <div className="flex flex-col gap-1.5">
        {poll.options.map((opt) => {
          const pct =
            poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
          const isSelected = poll.votedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleVote(opt.id)}
              disabled={isPending}
              className={cn(
                "relative w-full rounded-[6px] bg-muted px-3 py-2 text-xs font-medium text-left overflow-hidden transition-colors disabled:cursor-default",
                isSelected && "ring-1 ring-foreground"
              )}
            >
              {poll.votedOptionId && (
                <span
                  className="absolute inset-y-0 left-0 bg-foreground/10 transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between gap-2">
                <span>{opt.label}</span>
                {poll.votedOptionId && (
                  <span className="text-muted-foreground shrink-0">{pct}%</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {poll.totalVotes} vote{poll.totalVotes > 1 ? "s" : ""}
      </p>
    </div>
  );
}
