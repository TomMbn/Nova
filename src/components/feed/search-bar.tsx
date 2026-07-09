"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Building2 } from "lucide-react";

import {
  quickSearchMembers,
  quickSearchPosts,
  quickSearchCompanies,
  type QuickSearchMember,
  type QuickSearchPost,
  type QuickSearchCompany,
} from "@/actions/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 250;

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TABS = [
  { id: "people", label: "Personnes" },
  { id: "posts", label: "Posts" },
  { id: "companies", label: "Entreprises" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("people");
  const [members, setMembers] = useState<QuickSearchMember[]>([]);
  const [posts, setPosts] = useState<QuickSearchPost[]>([]);
  const [companies, setCompanies] = useState<QuickSearchCompany[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setMembers([]);
      setPosts([]);
      setCompanies([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      const [membersData, postsData, companiesData] = await Promise.all([
        quickSearchMembers(trimmed),
        quickSearchPosts(trimmed),
        quickSearchCompanies(trimmed),
      ]);
      setMembers(membersData);
      setPosts(postsData);
      setCompanies(companiesData);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToFullResults() {
    setOpen(false);
    router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
  }

  const counts: Record<Tab, number> = {
    people: members.length,
    posts: posts.length,
    companies: companies.length,
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-muted-foreground focus-within:ring-2 focus-within:ring-primary/40">
        <Search size={14} strokeWidth={2} className="shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) goToFullResults();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Rechercher dans Nova..."
          className="w-full bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
          <div className="flex border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 truncate px-1.5 py-2.5 text-[11px] font-bold whitespace-nowrap transition-colors",
                  tab === t.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                )}
              >
                {t.label}
                {counts[t.id] > 0 && ` (${counts[t.id]})`}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">Recherche...</p>
          ) : tab === "people" ? (
            members.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">Aucun membre trouvé.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {members.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/profil/${user.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
                    >
                      <Avatar size="sm">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                        <AvatarFallback className="text-[10px]">
                          {initialsOf(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">{user.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : tab === "posts" ? (
            posts.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">Aucun post trouvé.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/#post-${post.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
                    >
                      <Avatar size="sm">
                        <AvatarImage
                          src={post.author.avatarUrl ?? undefined}
                          alt={post.author.name}
                        />
                        <AvatarFallback className="text-[10px]">
                          {initialsOf(post.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">{post.author.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {post.content}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : companies.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">Aucune entreprise trouvée.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {companies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/recherche?companyId=${company.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Building2 size={16} strokeWidth={1.8} className="text-muted-foreground" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{company.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {company.memberCount} membre{company.memberCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={goToFullResults}
            className="w-full border-t border-border px-4 py-2.5 text-left text-xs font-semibold text-primary hover:bg-muted"
          >
            Voir tous les résultats pour « {query.trim()} »
          </button>
        </div>
      )}
    </div>
  );
}
