export const dynamic = "force-static";

import { getAllPosts } from "@/lib/posts";
import { getAllResearch } from "@/lib/posts";
import { getAllArts } from "@/lib/arts";

const SITE_URL = "https://anxingjian.github.io/canary-blog";
const SITE_TITLE = "Canary — An Xingjian";
const SITE_DESCRIPTION = "Journal, research, and generative art by An Xingjian.";

interface FeedItem {
  title: string;
  link: string;
  date: string;
  summary: string;
  category: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toUTCString();
  } catch {
    return dateStr;
  }
}

export async function GET() {
  const posts = getAllPosts();
  const research = getAllResearch();
  const arts = getAllArts();

  const items: FeedItem[] = [];

  // Journal posts
  for (const p of posts) {
    items.push({
      title: p.title || `Day ${p.day}`,
      link: `${SITE_URL}/journal/${p.slug}`,
      date: p.date,
      summary: p.excerpt || p.content.slice(0, 160).replace(/[#*\n]/g, "").trim(),
      category: "journal",
    });
  }

  // Research
  for (const r of research) {
    items.push({
      title: r.title,
      link: `${SITE_URL}/research/${r.slug}`,
      date: r.date,
      summary: r.excerpt || r.content.slice(0, 160).replace(/[#*\n]/g, "").trim(),
      category: "research",
    });
  }

  // Arts
  for (const a of arts) {
    items.push({
      title: a.title,
      link: `${SITE_URL}/arts/${a.slug}`,
      date: a.date,
      summary: a.description || a.subtitle || "",
      category: "arts",
    });
  }

  // Sort by date descending
  items.sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });

  // Limit to 50 most recent
  const feed = items.slice(0, 50);

  const lastBuildDate = feed.length > 0 ? toRfc822(feed[0].date) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${feed
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <pubDate>${toRfc822(item.date)}</pubDate>
      <category>${item.category}</category>
      <description>${escapeXml(item.summary)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
