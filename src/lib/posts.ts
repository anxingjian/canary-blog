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

// Essays
export interface Essay {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  content: string;
}

const essaysDir = path.join(process.cwd(), "content", "essays");

function parseEssay(filename: string): Essay | null {
  const filepath = path.join(essaysDir, filename);
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
    date: fm.date || "",
    content: match[2].trim(),
  };
}

export function getAllEssays(): Essay[] {
  if (!fs.existsSync(essaysDir)) return [];
  const files = fs.readdirSync(essaysDir).filter((f) => f.endsWith(".md"));
  const essays = files.map(parseEssay).filter(Boolean) as Essay[];
  return essays.sort((a, b) => b.date.localeCompare(a.date));
}

export function getEssay(slug: string): Essay | null {
  const filepath = path.join(essaysDir, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  return parseEssay(`${slug}.md`);
}

// Letters (hidden)
export interface Letter {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  content: string;
}

const lettersDir = path.join(process.cwd(), "content", "letters");

function parseLetter(filename: string): Letter | null {
  const filepath = path.join(lettersDir, filename);
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
    date: fm.date || "",
    content: match[2].trim(),
  };
}

export function getAllLetters(): Letter[] {
  if (!fs.existsSync(lettersDir)) return [];
  const files = fs.readdirSync(lettersDir).filter((f) => f.endsWith(".md"));
  const letters = files.map(parseLetter).filter(Boolean) as Letter[];
  return letters.sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getLetter(slug: string): Letter | null {
  const filepath = path.join(lettersDir, `${slug}.md`);
  if (!fs.existsSync(filepath)) return null;
  return parseLetter(`${slug}.md`);
}
