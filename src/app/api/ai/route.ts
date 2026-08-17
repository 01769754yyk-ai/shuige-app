import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const extra = body?.extra || '';
    const base = 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = 'sk-7093c7c9ac1a410fa81df15a572c7c03';
    const systemPrompt = '你是一个友好的生活助手，名叫水哥清单助手。请用简洁、温暖的中文回答。' +
      (extra ? '\n\n以下是用户当前的数据，回答相关问题时请参考：\n' + extra : '');
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
    });
    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch (pe: any) { data = { raw: text }; }
    if (!data?.choices?.[0]?.message?.content) {
      return NextResponse.json({
        choices: [{ message: { role: 'assistant', content: '联系AI出错：' + JSON.stringify(data) } }],
      });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({
      choices: [{ message: { role: 'assistant', content: '连接AI出错：' + String(e && e.message || e) } }],
    });
  }
}