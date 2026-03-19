import fs from "fs";
import path from "path";

export interface Art {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  medium: string;
  date: string;
  series?: string;
  seriesIndex?: number;
  htmlFile?: string;
  image?: string;
  interactive?: boolean;
  content: string;
}

const artsDir = path.join(process.cwd(), "content", "arts");

function parseArt(filename: string): Art | null {
  const filepath = path.join(artsDir, filename);
  const raw = fs.readFileSync(filepath, "utf-8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const fm: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      fm[key.trim()] = rest.join(":").trim().replace(/^["']|["']$/g, "");
    }
  });

  return {
    slug: filename.replace(/\.md$/, ""),
    title: fm.title || "",
    subtitle: fm.subtitle || "",
    description: fm.description || "",
    medium: fm.medium || "",
    date: fm.date || "",
    series: fm.series || undefined,
    seriesIndex: fm.seriesIndex ? parseInt(fm.seriesIndex) : undefined,
    htmlFile: fm.htmlFile || undefined,
    image: fm.image || undefined,
    interactive: fm.interactive === "true",
    content: match[2].trim(),
  };
}

export function getAllArts(): Art[] {
  if (!fs.existsSync(artsDir)) return [];
  const files = fs.readdirSync(artsDir).filter((f) => f.endsWith(".md"));
  const arts = files.map(parseArt).filter(Boolean) as Art[];
  return arts.sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}

export function getArt(slug: string): Art | null {
  const filepath = path.join(artsDir, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  return parseArt(`${slug}.md`);
}
