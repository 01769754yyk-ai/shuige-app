import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const key = process.env.DEEPSEEK_KEY;
    if (!key) return NextResponse.json({ __error: '未配置 DEEPSEEK_KEY' }, { status: 500 });
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: 'deepseek-chat', messages, stream: false }),
      // 加超时，避免挂起
      signal: AbortSignal.timeout(60000),
    });
    let text = '';
    try { text = await res.text(); } catch (e) { }
    let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
    // 原样返回，含错误
    return new NextResponse(JSON.stringify({ status: res.status, ok: res.ok, __error: res.ok ? undefined : text, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new NextResponse(JSON.stringify({ __error: '代理异常：' + (e?.message || '未知') }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}