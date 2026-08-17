import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const extra = body?.extra || '';

    const systemPrompt = '你是一个友好的生活助手，名叫水哥清单助手。请用简洁、温暖的中文回答。' +
      (extra ? '\n\n以下是用户当前的数据，回答相关问题时请参考：\n' + extra : '');

    const base = 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = process.env.DEEPSEEK_KEY || 'sk-6f0cf320c5dc45e1bdbf5c4ace13a445';

    const payload = {
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    };

    const upstream = await fetch(base, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ choices: [{ message: { content: '⚠️ 连接 AI 失败，请稍后再试' } }] });
  }
}