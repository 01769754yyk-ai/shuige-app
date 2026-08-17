import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const extra = body?.extra || '';
    const base = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const apiKey = '6d2ddfa1709b49ed80efaa8a2b8a7b21.6Tg1HbDd1BmSrsaB';
    const systemPrompt = '你是一个友好的生活助手，名叫水哥清单助手。请用简洁、温暖的中文回答。' +
      (extra ? '\n\n以下是用户当前的数据，回答相关问题时请参考：\n' + extra : '');
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'glm-4-flash', messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
    });
    const data = await res.json();
    return NextResponse.json({ ok: res.ok, status: res.status, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e && e.message || e) });
  }
}