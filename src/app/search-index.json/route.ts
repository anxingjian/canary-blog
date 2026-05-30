export const dynamic = "force-static";

import { getAllPosts, getAllResearch, getAllReadings } from "@/lib/posts";
import { getAllArts } from "@/lib/arts";

export async function GET() {
  const posts = getAllPosts();
  const research = getAllResearch();
  const readings = getAllReadings();
  const arts = getAllArts();

  const index = [
    ...posts.map((p) => ({
      type: "journal" as const,
      slug: p.slug,
      title: p.title || `Day ${p.day}`,
      date: p.date,
      excerpt: p.excerpt || p.content.slice(0, 200).replace(/[#*\n|]/g, "").trim(),
      body: p.content.replace(/[#*\n|]/g, " ").slice(0, 500),
      url: `/canary-blog/journal/${p.slug}`,
    })),
    ...research.map((r) => ({
      type: "research" as const,
      slug: r.slug,
      title: r.title,
      date: r.date,
      excerpt: r.excerpt || r.content.slice(0, 200).replace(/[#*\n|]/g, "").trim(),
      body: r.content.replace(/[#*\n|]/g, " ").slice(0, 500),
      url: `/canary-blog/research/${r.slug}`,
    })),
    ...readings.map((r) => ({
      type: "reading" as const,
      slug: r.slug,
      title: r.title,
      date: r.date,
      excerpt: r.subtitle || r.content.slice(0, 200).replace(/[#*\n|]/g, "").trim(),
      body: r.content.replace(/[#*\n|]/g, " ").slice(0, 500),
      url: `/canary-blog/readings/${r.slug}`,
    })),
    ...arts.map((a) => ({
      type: "art" as const,
      slug: a.slug,
      title: a.title,
      date: a.date,
      excerpt: a.description || a.subtitle || "",
      body: (a.description || "") + " " + (a.subtitle || ""),
      url: `/canary-blog/arts/${a.slug}`,
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
