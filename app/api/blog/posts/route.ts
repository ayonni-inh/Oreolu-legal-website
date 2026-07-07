import { NextRequest, NextResponse } from 'next/server';
import { fallbackBlogPosts, getModel, cleanJsonText } from '@/lib/server/shared';

function safeParsePosts(text: string) {
  try {
    const cleaned = cleanJsonText(text);
    if (!cleaned) return null;
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch { return null; }
}

export async function GET(_req: NextRequest) {
  try {
    const model = getModel();
    if (!model) return NextResponse.json({ posts: fallbackBlogPosts });
    const prompt = `Generate 6 recent and highly relevant legal news articles or blog posts. 
      Focus on worldwide law news, but specifically target topics that Africans and Nigerians would be interested in (e.g., international trade laws affecting Africa, tech regulations in Nigeria, human rights, immigration, corporate law developments in Africa, etc.).
      
      Return purely a JSON array of objects with the following properties:
      - id: A unique string ID
      - title: The headline of the news
      - excerpt: A short 2-sentence summary
      - content: A detailed 3-paragraph article content
      - date: A recent date (e.g., "March 24, 2026")
      - readTime: Estimated read time (e.g., "5 min read")
      - category: The legal category (e.g., "Corporate Law", "Tech Regulation", "Immigration")
      - imageUrl: A relevant Unsplash image keyword (e.g., "law", "africa", "technology", "court")`;

    const result = await model.generateContent(prompt);
    const posts = safeParsePosts(result.response.text())?.map((p: any) => ({
      ...p,
      imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(p.imageUrl)}`
    }));
    if (posts) return NextResponse.json({ posts });
    return NextResponse.json({ posts: fallbackBlogPosts });
  } catch {
    return NextResponse.json({ posts: fallbackBlogPosts });
  }
}
