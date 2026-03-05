import fs from "fs";
import path from "path";

export interface Post {
  slug: string;
  day: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
}

const contentDir = path.join(process.cwd(), "content");

function parsePost(filename: string): Post | null {
  const filepath = path.join(contentDir, filename);
  const raw = fs.readFileSync(filepath, "utf-8");

  // Parse frontmatter
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      frontmatter[key.trim()] = rest.join(":").trim().replace(/^["']|["']$/g, "");
    }
  });

  return {
    slug: filename.replace(/\.md$/, ""),
    day: frontmatter.day || "",
    date: frontmatter.date || "",
    title: frontmatter.title || "",
    excerpt: frontmatter.excerpt || "",
    content: match[2].trim(),
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  const posts = files.map(parsePost).filter(Boolean) as Post[];
  return posts.sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getPost(slug: string): Post | null {
  const filepath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  return parsePost(`${slug}.md`);
}
