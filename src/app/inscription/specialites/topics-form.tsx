"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { chooseTopics } from "../actions";

export function TopicsForm({
  topics,
}: {
  topics: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <form action={chooseTopics} className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2.5">
        {topics.map((topic) => (
          <label
            key={topic.id}
            className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors has-[:checked]:border-transparent has-[:checked]:bg-foreground has-[:checked]:text-background"
          >
            <input
              type="checkbox"
              name="topicIds"
              value={topic.id}
              checked={selected.includes(topic.id)}
              onChange={() => toggle(topic.id)}
              className="sr-only"
            />
            {topic.name}
          </label>
        ))}
      </div>

      <Button type="submit" className="h-11 rounded-xl text-sm font-bold">
        Continuer
        {selected.length > 0 &&
          ` (${selected.length} sélectionnée${selected.length > 1 ? "s" : ""})`}
      </Button>
    </form>
  );
}
