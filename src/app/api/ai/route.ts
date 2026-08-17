import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const extra = body?.extra || '';
    const base = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    const apiKey = 'sk-ws-H.EPIHHHM.lDJ0.MEUCIQDgwZI03WNMai-Zh94nWoJI2LcJyOP2YmhyPe9G9gp3AgIgVs2XtGVaJzBW1GK2ff9wbZRtatyZRJAGaPKl0xT-7FQ';
    const systemPrompt = '你是一个友好的生活助手，名叫水哥清单助手。请用简洁、温暖的中文回答。' +
      (extra ? '\n\n以下是用户当前的数据，回答相关问题时请参考：\n' + extra : '');
    let upstream;
    try {
      upstream = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'qwen-turbo', messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
      });
    } catch (fe: any) {
      return NextResponse.json({
        choices: [{ message: { role: 'assistant', content: '⚠️ 请求阿里云失败(网络层)：' + String(fe && fe.message || fe) } }],
      });
    }
    const text = await upstream.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch (pe: any) { data = { raw: text }; }
    if (!data?.choices?.[0]?.message?.content) {
      return NextResponse.json({
        choices: [{ message: { role: 'assistant', content: '⚠️ 阿里云返回异常：' + JSON.stringify(data) } }],
      });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({
      choices: [{ message: { role: 'assistant', content: '⚠️ 服务器异常：' + String(e && e.message || e) } }],
    });
  }
}