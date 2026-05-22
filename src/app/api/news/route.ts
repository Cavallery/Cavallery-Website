import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch("https://api.crstlnz.my.id/api/news", {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CavalleryApp/1.0"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch news data: ${res.statusText}`);
    }
    
    const data = await res.json();
    const newsData = data.news || [];
    
    // Map crstlnz response to expected format
    const mappedNews = newsData.map((item: any) => ({
      id: item.id || item.link || Math.random().toString(),
      title: item.title,
      label: item.category || "Terkini",
      date: item.date,
      link_url: item.url || `https://jkt48.com/news/${item.link}`,
      description: "", // Description not available in this API
      image_url: "/images/jkt48-logo.svg"
    }));

    return NextResponse.json({ success: true, data: mappedNews });
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
