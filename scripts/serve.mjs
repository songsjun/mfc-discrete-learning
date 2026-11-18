import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../web/',import.meta.url));
const argument = process.argv.indexOf('--port');
const port = argument >= 0 ? Number(process.argv[argument+1]) : 4173;
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid --port');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const server = http.createServer(async (request,response) => {
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405,{'Allow':'GET, HEAD'}); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname); } catch { response.writeHead(400);response.end('Bad path');return; }
  const path = resolve(root,`.${pathname === '/' ? '/index.html' : pathname}`);
  if (!path.startsWith(root.endsWith(sep) ? root : root+sep)) { response.writeHead(403);response.end('Forbidden');return; }
  try {
    if (!(await stat(path)).isFile()) throw new Error('Not a file');
    const content = await readFile(path);
    response.writeHead(200,{'Content-Type':mime[extname(path)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('没有找到这个文件。请从网站首页进入。'); }
});
server.on('error',error => { console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 已占用，请用 --port 换一个端口。` : error.message);process.exitCode=1; });
server.listen(port,'127.0.0.1',()=>console.log(`离散学习室 · Local: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
