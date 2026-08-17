import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const base = 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = process.env.DEEPSEEK_KEY || 'sk-6f0cf320c5dc45e1bdbf5c4ace13a445';
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'deepseek-chat', messages }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e && e.message || e) }, { status: 500 });
  }
}