import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.API_PORT || process.env.PORT || 8787);
const KEY = process.env.OPENROUTER_API_KEY;
const DIST = resolve(process.cwd(), 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const send = (res, status, value) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'}); res.end(JSON.stringify(value)); };
async function chat(req,res) {
  if (!KEY) return send(res,503,{error:{message:'서버 OPENROUTER_API_KEY 환경변수를 확인하세요.'}});
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') return send(res,415,{error:{message:'JSON만 허용됩니다.'}});
  try {
    let raw = '';
    for await (const chunk of req) { raw += chunk.toString(); if (raw.length > 80000) return send(res,413,{error:{message:'요청 크기 초과'}}); }
    const { model, prompt } = JSON.parse(raw);
    if (typeof model !== 'string' || !/^[a-z0-9-]+\/[a-zA-Z0-9._:-]+$/.test(model) || typeof prompt !== 'string' || !prompt.trim() || prompt.length > 40000) return send(res,400,{error:{message:'잘못된 모델 또는 프롬프트'}});
    const result = await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST', signal:AbortSignal.timeout(90000),
      headers:{'Content-Type':'application/json', Authorization:`Bearer ${KEY}`,'X-Title':'Study Note Organizer'},
      body:JSON.stringify({model,messages:[{role:'user',content:prompt}],temperature:0.2}),
    });
    const data = await result.json().catch(()=>({}));
    if (!result.ok) return send(res,result.status,{error:{message:data.error?.message || 'AI 제공자 요청 실패'}});
    send(res,200,{choices:data.choices,usage:data.usage});
  } catch(error) {send(res,error?.name==='TimeoutError'?504:502,{error:{message:'서버 처리 중 오류가 발생했습니다.'}});}
}
async function serve(req,res) {
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=resolve(DIST,'.'+pathname);
    if(path!==DIST&&!path.startsWith(DIST+sep)) return send(res,403,{error:{message:'접근 거부'}});
    const selected=(await stat(path).catch(()=>null))?.isFile()?path:resolve(DIST,'index.html');
    const content=await readFile(selected);
    res.writeHead(200,{'Content-Type':mime[extname(selected)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(content);
  } catch {send(res,404,{error:{message:'빌드 파일이 없습니다. npm run build를 실행하세요.'}});}
}
createServer((req,res)=>{
  if(req.url?.split('?')[0]==='/api/chat') {
    if(req.method!=='POST') return send(res,405,{error:{message:'POST만 허용됩니다.'}});
    return chat(req,res);
  }
  if(req.method!=='GET'&&req.method!=='HEAD') return send(res,405,{error:{message:'허용되지 않은 요청'}});
  return serve(req,res);
}).listen(PORT,HOST,()=>console.log(`Study Note Organizer http://${HOST}:${PORT}`));
