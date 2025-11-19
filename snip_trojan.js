// snippets.js - Trojan over WebSocket (WS) via Cloudflare Workers
// Based on original VLESS snippets.js; converted to Trojan with reference to worker.js

import { connect } from 'cloudflare:sockets';

let proxyIP = '111.119.215.93';  // default proxyIP (可在运行时通过 /proxyip=xx 修改)
let yourUUID = '93bf61d9-3796-44c2-9b3a-49210ece2585';  // 用作 Trojan 密码（客户端会自动对其做 SHA224）

// CDN 列表，用于生成订阅节点
// 格式：优选域名:端口#备注名称 或 优选IP:端口#备注名称 或 优选域名
let cfip = [
  'mfa.gov.ua#SG', 'saas.sin.fan#HK', 'store.ubi.com#JP','cf.130519.xyz#KR','cf.008500.xyz#HK', 
  'cf.090227.xyz#US', 'cf.877774.xyz#HK','cdns.doon.eu.org#JP','sub.danfeng.eu.org#TW','cf.zhetengsha.eu.org#HK'
];

// ------------------------ 页面部分 ------------------------

function getHomePageHTML(currentDomain) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Snippets</title><style>body{font-family:Arial,sans-serif;margin:0;padding:40px 20px;background:linear-gradient(135deg,#667eea 0%,#18800e 100%);min-height:100vh;display:flex;align-items:center;justify-content:center}.container{max-width:600px;background:#fff;padding:40px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.3);text-align:center}h1{color:#667eea;margin-bottom:20px}.info{font-size:18px;color:#666;margin:20px 0}.link{display:inline-block;background:#667eea;color:#fff;padding:12px 30px;border-radius:5px;text-decoration:none;margin-top:20px}.link:hover{background:#5568d3}.footer{margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:14px;color:#999}.footer a{color:#667eea;text-decoration:none;margin:0 10px}.footer a:hover{text-decoration:underline}</style></head><body><div class="container"><h1>Hello Snippets</h1><div class="info">请访问: <strong>https://${currentDomain}/你的uuid</strong><br><br>查看订阅和使用说明（Trojan/WS）</div><div class="footer"><a href="https://github.com/eooce/CF-Workers-and-Snip-VLESS" target="_blank">GitHub</a>|<a href="https://t.me/eooceu" target="_blank">TG群组</a></div></div></body></html>`;
}

function getSubPageHTML(currentDomain) {
  const v2raySubLink = `https://${currentDomain}/sub/${yourUUID}`;
  const clashSubLink = `https://sublink.eooce.com/clash?config=https://${currentDomain}/sub/${yourUUID}`;
  const singboxSubLink = `https://sublink.eooce.com/singbox?config=https://${currentDomain}/sub/${yourUUID}`;
  
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>订阅链接</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#18800e 100%);min-height:100vh;padding:20px}.container{max-width:900px;margin:0 auto;background:#fff;border-radius:15px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,.3)}h1{color:#667eea;margin-bottom:10px;font-size:2rem;text-align:center}.section{margin-bottom:25px}.section-title{color:#667eea;font-size:16px;font-weight:600;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #667eea}.link-box{background:#f7f9fc;border:1px solid #e1e8ed;border-radius:8px;padding:12px;margin-bottom:10px}.link-label{font-size:16px;color:#666;margin-bottom:6px;font-weight:700}.link-content{display:flex;gap:8px}.link-text{flex:1;background:#fff;padding:8px 12px;border-radius:5px;border:1px solid #ddd;font-size:.8rem;word-break:break-all;font-family:monospace}.copy-btn{background:#667eea;color:#fff;border:none;padding:8px 16px;border-radius:5px;cursor:pointer;font-size:13px;white-space:nowrap}.copy-btn:hover{background:#5568d3}.copy-btn.copied{background:#48c774}.usage-section{background:#fff9e6;border-left:4px solid #ffc107;padding:15px;border-radius:5px;margin-top:25px}.usage-title{color:#f57c00;font-size:1.2rem;font-weight:600;margin-bottom:12px}.usage-item{margin-bottom:12px;font-size:13px;line-height:1.6}.usage-item strong{color:#333;display:block;margin-bottom:4px}.usage-item code{background:#fff;padding:2px 6px;border-radius:3px;color:#e91e63;font-size:13px;border:1px solid #ddd;word-wrap:break-word;word-break:break-all;display:inline-block;max-width:100%}.example{color:#666;font-size:14px;margin-left:8px}.footer{margin-top:30px;padding-top:20px;border-top:1px solid #e1e8ed;text-align:center;font-size:14px;color:#999}.footer a{color:#667eea;text-decoration:none;margin:0 10px}.footer a:hover{text-decoration:underline}@media (max-width:768px){.container{padding:20px}.link-content{flex-direction:column}.copy-btn{width:100%}}</style></head><body><div class="container"><h1>Snippets 订阅中心 (Trojan/WS)</h1><div class="section"><div class="section-title">🔗 通用订阅</div><div class="link-box"><div class="link-label">v2rayN / Loon / Shadowrocket / Karing</div><div class="link-content"><div class="link-text" id="v2ray-link">${v2raySubLink}</div><button class="copy-btn" onclick="copyToClipboard('v2ray-link',this)">复制</button></div></div></div><div class="section"><div class="section-title">😺 Clash 系列订阅</div><div class="link-box"><div class="link-label">Mihomo / FlClash / Clash Meta</div><div class="link-content"><div class="link-text" id="clash-link">${clashSubLink}</div><button class="copy-btn" onclick="copyToClipboard('clash-link',this)">复制</button></div></div></div><div class="section"><div class="section-title">📦 Sing-box 系列订阅</div><div class="link-box"><div class="link-label">Sing-box / SFI / SFA</div><div class="link-content"><div class="link-text" id="singbox-link">${singboxSubLink}</div><button class="copy-btn" onclick="copyToClipboard('singbox-link',this)">复制</button></div></div></div><div class="usage-section"><div class="usage-title">⚙️ 自定义路径(节点里的path)使用说明</div><div class="usage-item"><strong>1. 默认路径</strong><code>/?ed=2560</code><div class="example">使用代码里设置的默认proxyip</div></div><div class="usage-item"><strong>2. 带端口的proxyip</strong><code>/?ed=2560&proxyip=210.61.97.241:81</code><br><code>/?ed=2560&proxyip=proxy.xxxxxxxx.tk:50001</code></div><div class="usage-item"><strong>3. 域名proxyip</strong><code>/?ed=2560&proxyip=ProxyIP.SG.CMLiussss.net</code></div><div class="usage-item"><strong>4. 全局SOCKS5</strong><code>/?ed=2560&proxyip=socks://host:port</code><br><code>/?ed=2560&proxyip=socks5://host:port</code><br><code>/?ed=2560&proxyip=socks://user:password@host:port</code><br><code>/?ed=2560&proxyip=socks5://user:password@host:port</code></div><div class="usage-item"><strong>5. 全局HTTP/HTTPS</strong><code>/?ed=2560&proxyip=http://host:port</code><br><code>/?ed=2560&proxyip=https://host:port</code><br><code>/?ed=2560&proxyip=http://user:password@host:port</code><br><code>/?ed=2560&proxyip=https://user:password@host:port</code></div></div><div class="footer"><a href="https://github.com/eooce/CF-Workers-and-Snip-VLESS" target="_blank">GitHub 项目</a>|<a href="https://t.me/eooceu" target="_blank">Telegram 群组</a>|<a href="https://check-proxyip.ssss.nyc.mn" target="_blank">ProxyIP 检测服务</a></div></div><script>function copyToClipboard(e,t){const n=document.getElementById(e).textContent;navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(n).then(()=>{showCopySuccess(t)}).catch(()=>{fallbackCopy(n,t)}):fallbackCopy(n,t)}function fallbackCopy(e,t){const n=document.createElement("textarea");n.value=e,n.style.position="fixed",n.style.left="-999999px",document.body.appendChild(n),n.select();try{document.execCommand("copy"),showCopySuccess(t)}catch(e){alert("复制失败，请手动复制")}document.body.removeChild(n)}function showCopySuccess(e){const t=e.textContent;e.textContent="已复制",e.classList.add("copied"),setTimeout(()=>{e.textContent=t,e.classList.remove("copied")},2e3)}</script></body></html>`;
}

async function handleHomePage(request) {
  const url = new URL(request.url);
  const currentDomain = url.hostname;
  return new Response(getHomePageHTML(currentDomain), {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

async function handleSubtionPage(request) {
  const url = new URL(request.url);
  const currentDomain = url.hostname;
  return new Response(getSubPageHTML(currentDomain), {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

// ------------------------ 工具函数 ------------------------

function base64ToArray(b64Str) {
  if (!b64Str) return { error: null };
  try { 
    const binaryString = atob(b64Str.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return { earlyData: bytes.buffer, error: null }; 
  } catch (error) { 
    return { error }; 
  }
}

function closeSocketQuietly(socket) { 
  try { 
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CLOSING) {
      socket.close(); 
    }
  } catch (error) {} 
}

function parseProxyAddress(proxyStr) {
  if (!proxyStr) return null;
  
  proxyStr = proxyStr.trim();
  // SOCKS5: socks://user:pass@host:port
  if (proxyStr.startsWith('socks://') || proxyStr.startsWith('socks5://')) {
    const urlStr = proxyStr.replace(/^socks:\/\//, 'socks5://');
    try {
      const url = new URL(urlStr);
      return {
        type: 'socks5',
        host: url.hostname,
        port: parseInt(url.port) || 1080,
        username: url.username ? decodeURIComponent(url.username) : '',
        password: url.password ? decodeURIComponent(url.password) : ''
      };
    } catch {
      return null;
    }
  }
  // HTTP(S): http://user:pass@host:port
  if (proxyStr.startsWith('http://') || proxyStr.startsWith('https://')) {
    try {
      const url = new URL(proxyStr);
      return {
        type: 'http',
        host: url.hostname,
        port: parseInt(url.port) || (proxyStr.startsWith('https://') ? 443 : 80),
        username: url.username ? decodeURIComponent(url.username) : '',
        password: url.password ? decodeURIComponent(url.password) : ''
      };
    } catch {
      return null;
    }
  }
  // IPv6: [host]:port
  if (proxyStr.startsWith('[')) {
    const closeBracket = proxyStr.indexOf(']');
    if (closeBracket > 0) {
      const host = proxyStr.substring(1, closeBracket);
      const rest = proxyStr.substring(closeBracket + 1);
      if (rest.startsWith(':')) {
        const port = parseInt(rest.substring(1), 10);
        if (!isNaN(port) && port > 0 && port <= 65535) {
          return { type: 'direct', host, port };
        }
      }
      return { type: 'direct', host, port: 443 };
    }
  }
  const lastColonIndex = proxyStr.lastIndexOf(':');
  if (lastColonIndex > 0) {
    const host = proxyStr.substring(0, lastColonIndex);
    const portStr = proxyStr.substring(lastColonIndex + 1);
    const port = parseInt(portStr, 10);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      return { type: 'direct', host, port };
    }
  }
  return { type: 'direct', host: proxyStr, port: 443 };
}

// ------------------------ 核心逻辑：Cloudflare Worker ------------------------

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // 动态设置默认 proxyIP：/proxyip=xxx
      if (pathname.startsWith('/proxyip=')) {
        const newProxyIP = decodeURIComponent(pathname.substring(9)).trim();
        if (newProxyIP) {
          proxyIP = newProxyIP;
          return new Response(`set proxyIP to: ${proxyIP}\n\n`, {
            headers: { 
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
          });
        }
      }

      if (request.headers.get('Upgrade') === 'websocket') {
        const customProxyIP = url.searchParams.get('proxyip');
        return await handleWsRequest(request, customProxyIP);
      } else if (request.method === 'GET') {
        if (url.pathname === '/') {
          return handleHomePage(request);
        }
        if (url.pathname === `/${yourUUID}`) {
          return handleSubtionPage(request);
        }
        // 订阅：/sub/{uuid}
        if (url.pathname.toLowerCase().includes(`/sub/${yourUUID}`)) {
          const currentDomain = url.hostname;

          // 生成 Trojan/WS 节点列表
          const nodeLinks = cfip.map(cdnItem => {
            let host, port = 443, nodeName = '';
            if (cdnItem.includes('#')) {
              const parts = cdnItem.split('#');
              cdnItem = parts[0];
              nodeName = parts[1];
            }
            if (cdnItem.includes(':')) {
              const parts = cdnItem.split(':');
              host = parts[0];
              port = parseInt(parts[1]) || 443;
            } else {
              host = cdnItem;
            }
            if (!nodeName) nodeName = `Snippets-Trojan`;

            // Trojan/WS 链接（参考 worker.js 生成逻辑）
            // 客户端会对密码进行 SHA224 自动哈希；本 worker 验证时使用哈希（见 parseTrojanHeader）
            const params = new URLSearchParams({
              security: 'tls',
              sni: currentDomain,
              fp: 'firefox',
              allowInsecure: '1',
              type: 'ws',
              host: currentDomain,
              path: '/?ed=2560'
            });
            return `trojan://${yourUUID}@${host}:${port}?${params.toString()}#${encodeURIComponent(nodeName)}`;
          });
          
          const linksText = nodeLinks.join('\n');
          const base64Content = btoa(unescape(encodeURIComponent(linksText)));
          return new Response(base64Content, {
            headers: { 
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
          });
        }
      }
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

// ------------------------ WS 处理（Trojan/WS） ------------------------

async function handleWsRequest(request, customProxyIP) {
  const wsPair = new WebSocketPair();
  const [clientSock, serverSock] = Object.values(wsPair);
  serverSock.accept();

  let remoteConnWrapper = { socket: null };

  // 读取首个数据帧以解析 Trojan Header
  const earlyData = request.headers.get('sec-websocket-protocol') || '';
  const readable = makeReadableStream(serverSock, earlyData);

  readable.pipeTo(new WritableStream({
    async write(chunk) {
      // 已建立到目标主机的连接，直接转发数据
      if (remoteConnWrapper.socket) {
        const writer = remoteConnWrapper.socket.writable.getWriter();
        await writer.write(chunk);
        writer.releaseLock();
        return;
      }

      // 解析 Trojan Header（参考 worker.js）
      const tj = await parseTrojanHeader(chunk, yourUUID);
      if (tj.hasError) {
        throw new Error(tj.message || 'Invalid trojan header');
      }

      // 连接目标并转发，Trojan不需要响应头
      await forwardTCP(
        tj.addressType,
        tj.hostname,
        tj.port,
        tj.rawClientData,
        serverSock,
        null,
        remoteConnWrapper,
        customProxyIP
      );
    },
  })).catch(() => {});

  return new Response(null, { status: 101, webSocket: clientSock });
}

// ------------------------ 出站连接（直连/代理） ------------------------

async function connectViaSocks5(proxyConfig, targetHost, targetPort, initialData) {
  const { host, port, username, password } = proxyConfig;
  const socket = connect({ hostname: host, port: port });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  
  try {
    const authMethods = username && password ? 
      new Uint8Array([0x05, 0x02, 0x00, 0x02]) :
      new Uint8Array([0x05, 0x01, 0x00]); 
    
    await writer.write(authMethods);
    const methodResponse = await reader.read();
    if (methodResponse.done || methodResponse.value.byteLength < 2) {
      throw new Error('S5 method selection failed');
    }
    const selectedMethod = new Uint8Array(methodResponse.value)[1];
    if (selectedMethod === 0x02) {
      if (!username || !password) throw new Error('S5 requires authentication');
      const userBytes = new TextEncoder().encode(username);
      const passBytes = new TextEncoder().encode(password);
      const authPacket = new Uint8Array(3 + userBytes.length + passBytes.length);
      authPacket[0] = 0x01; 
      authPacket[1] = userBytes.length;
      authPacket.set(userBytes, 2);
      authPacket[2 + userBytes.length] = passBytes.length;
      authPacket.set(passBytes, 3 + userBytes.length);
      await writer.write(authPacket);
      const authResponse = await reader.read();
      if (authResponse.done || new Uint8Array(authResponse.value)[1] !== 0x00) {
        throw new Error('S5 authentication failed');
      }
    } else if (selectedMethod !== 0x00) {
      throw new Error(`S5 unsupported auth method: ${selectedMethod}`);
    }
    
    const hostBytes = new TextEncoder().encode(targetHost);
    const connectPacket = new Uint8Array(7 + hostBytes.length);
    connectPacket[0] = 0x05;
    connectPacket[1] = 0x01;
    connectPacket[2] = 0x00; 
    connectPacket[3] = 0x03; 
    connectPacket[4] = hostBytes.length;
    connectPacket.set(hostBytes, 5);
    new DataView(connectPacket.buffer).setUint16(5 + hostBytes.length, targetPort, false);
    await writer.write(connectPacket);
    const connectResponse = await reader.read();
    if (connectResponse.done || new Uint8Array(connectResponse.value)[1] !== 0x00) {
      throw new Error('S5 connection failed');
    }
    
    await writer.write(initialData);
    writer.releaseLock();
    reader.releaseLock();
    return socket;
  } catch (error) {
    writer.releaseLock();
    reader.releaseLock();
    throw error;
  }
}

async function connectViaHttp(proxyConfig, targetHost, targetPort, initialData) {
  const { host, port, username, password } = proxyConfig;
  const socket = connect({ hostname: host, port: port });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  
  try {
    let connectRequest = `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\n`;
    connectRequest += `Host: ${targetHost}:${targetPort}\r\n`;
    if (username && password) {
      const auth = btoa(`${username}:${password}`);
      connectRequest += `Authorization: Basic ${auth}\r\n`;
    }
    connectRequest += '\r\n';
    await writer.write(new TextEncoder().encode(connectRequest));

    // 读取 HTTP 响应头
    let responseData = new Uint8Array(0);
    let headerComplete = false;
    while (!headerComplete) {
      const chunk = await reader.read();
      if (chunk.done) throw new Error('HTTP connection closed unexpectedly');
      const newData = new Uint8Array(responseData.length + chunk.value.byteLength);
      newData.set(responseData);
      newData.set(new Uint8Array(chunk.value), responseData.length);
      responseData = newData;
      const responseText = new TextDecoder().decode(responseData);
      if (responseText.includes('\r\n\r\n')) headerComplete = true;
    }
    const responseText = new TextDecoder().decode(responseData);
    if (!responseText.startsWith('HTTP/1.1 200') && !responseText.startsWith('HTTP/1.0 200')) {
      throw new Error(`HTTP connection failed: ${responseText.split('\r\n')[0]}`);
    }
    
    await writer.write(initialData);
    writer.releaseLock();
    reader.releaseLock();
    return socket;
  } catch (error) {
    writer.releaseLock();
    reader.releaseLock();
    throw error;
  }
}

// 建立到目标主机的 TCP 连接（支持直连 / SOCKS5 / HTTP 代理）并桥接 WS <-> TCP
async function forwardTCP(addrType, host, portNum, rawData, ws, respHeader, remoteConnWrapper, customProxyIP) {
  async function connectDirect(address, port, data) {
    const remoteSock = connect({ hostname: address, port: port });
    const writer = remoteSock.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
    return remoteSock;
  }
  
  let proxyConfig = null;
  let shouldUseProxy = false;
  if (customProxyIP) {
    proxyConfig = parseProxyAddress(customProxyIP);
    if (proxyConfig && (proxyConfig.type === 'socks5' || proxyConfig.type === 'http')) {
      shouldUseProxy = true;
    } else if (!proxyConfig) {
      proxyConfig = parseProxyAddress(proxyIP) || { type: 'direct', host: proxyIP, port: 443 };
    }
  } else {
    proxyConfig = parseProxyAddress(proxyIP) || { type: 'direct', host: proxyIP, port: 443 };
    if (proxyConfig.type === 'socks5' || proxyConfig.type === 'http') {
      shouldUseProxy = true;
    }
  }
  
  async function connectWithProxy() {
    let newSocket;
    if (proxyConfig.type === 'socks5') {
      newSocket = await connectViaSocks5(proxyConfig, host, portNum, rawData);
    } else if (proxyConfig.type === 'http') {
      newSocket = await connectViaHttp(proxyConfig, host, portNum, rawData);
    } else {
      // 作为“直连到 proxyIP:port”，这是原脚本的语义（保持兼容）
      newSocket = await connectDirect(proxyConfig.host, proxyConfig.port, rawData);
    }
    
    remoteConnWrapper.socket = newSocket;
    newSocket.closed.catch(() => {}).finally(() => closeSocketQuietly(ws));
    connectStreams(newSocket, ws, respHeader, null);
  }
  
  if (shouldUseProxy) {
    try {
      await connectWithProxy();
    } catch (err) {
      throw err;
    }
  } else {
    try {
      const initialSocket = await connectDirect(host, portNum, rawData);
      remoteConnWrapper.socket = initialSocket;
      connectStreams(initialSocket, ws, respHeader, connectWithProxy);
    } catch (err) {
      await connectWithProxy();
    }
  }
}

// 桥接 TCP -> WS，并在需要时附加响应头（Trojan 不使用 respHeader）
async function connectStreams(remoteSocket, webSocket, headerData, retryFunc) {
  let header = headerData, hasData = false;
  await remoteSocket.readable.pipeTo(
    new WritableStream({
      async write(chunk, controller) {
        hasData = true;
        if (webSocket.readyState !== WebSocket.OPEN) controller.error('ws.readyState is not open');
        if (header) { 
          const response = new Uint8Array(header.length + chunk.byteLength);
          response.set(header, 0);
          response.set(chunk, header.length);
          webSocket.send(response.buffer); 
          header = null; 
        } else { 
          webSocket.send(chunk); 
        }
      },
      abort() {},
    })
  ).catch(() => { closeSocketQuietly(webSocket); });
  if (!hasData && retryFunc) {
    await retryFunc();
  }
}

// 将 WS 变为 ReadableStream，并注入 Early-Data（sec-websocket-protocol）
function makeReadableStream(socket, earlyDataHeader) {
  let cancelled = false;
  return new ReadableStream({
    start(controller) {
      socket.addEventListener('message', (event) => { 
        if (!cancelled) controller.enqueue(event.data); 
      });
      socket.addEventListener('close', () => { 
        if (!cancelled) { 
          closeSocketQuietly(socket); 
          controller.close(); 
        } 
      });
      socket.addEventListener('error', (err) => controller.error(err));
      const { earlyData, error } = base64ToArray(earlyDataHeader);
      if (error) controller.error(error); 
      else if (earlyData) controller.enqueue(earlyData);
    },
    cancel() { 
      cancelled = true; 
      closeSocketQuietly(socket); 
    }
  });
}

// ------------------------ Trojan Header 解析（参考 worker.js） ------------------------

async function parseTrojanHeader(buffer, passwordPlainText) {
  // Trojan 密码在客户端侧会进行 SHA224（hex 长度 56）的发送，这里进行校验
  const sha224Password = await sha224Hash(passwordPlainText);
  
  if (buffer.byteLength < 56) {
    return { hasError: true, message: "invalid trojan data - too short" };
  }
  // 固定结构：<56字节sha224hex><0x0d><0x0a><socks5-like>
  let crLfIndex = 56;
  if (new Uint8Array(buffer.slice(56, 57))[0] !== 0x0d || new Uint8Array(buffer.slice(57, 58))[0] !== 0x0a) {
    return { hasError: true, message: "invalid trojan header format (missing CR LF)" };
  }
  const password = new TextDecoder().decode(buffer.slice(0, crLfIndex));
  if (password !== sha224Password) {
    return { hasError: true, message: "invalid trojan password" };
  }

  const socks5DataBuffer = buffer.slice(crLfIndex + 2);
  if (socks5DataBuffer.byteLength < 6) {
    return { hasError: true, message: "invalid SOCKS5 request data" };
  }

  const view = new DataView(socks5DataBuffer);
  const cmd = view.getUint8(0);
  if (cmd !== 1) {
    return { hasError: true, message: "unsupported command, only TCP (CONNECT) is allowed" };
  }

  const atype = view.getUint8(1);
  let addressLength = 0;
  let addressIndex = 2;
  let address = "";
  switch (atype) {
    case 1: // IPv4
      addressLength = 4;
      address = new Uint8Array(socks5DataBuffer.slice(addressIndex, addressIndex + addressLength)).join(".");
      break;
    case 3: // Domain
      addressLength = new Uint8Array(socks5DataBuffer.slice(addressIndex, addressIndex + 1))[0];
      addressIndex += 1;
      address = new TextDecoder().decode(socks5DataBuffer.slice(addressIndex, addressIndex + addressLength));
      break;
    case 4: // IPv6
      addressLength = 16;
      const dataView = new DataView(socks5DataBuffer.slice(addressIndex, addressIndex + addressLength));
      const ipv6 = [];
      for (let i = 0; i < 8; i++) {
        ipv6.push(dataView.getUint16(i * 2).toString(16));
      }
      address = ipv6.join(":");
      break;
    default:
      return { hasError: true, message: `invalid addressType is ${atype}` };
  }

  if (!address) {
    return { hasError: true, message: `address is empty, addressType is ${atype}` };
  }

  const portIndex = addressIndex + addressLength;
  const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
  const portRemote = new DataView(portBuffer).getUint16(0);

  // 后续原始数据（可能包含客户立即发来的TCP负载）
  return {
    hasError: false,
    addressType: atype,
    port: portRemote,
    hostname: address,
    rawClientData: socks5DataBuffer.slice(portIndex + 4)
  };
}

// ------------------------ SHA224（参考 worker.js） ------------------------

async function sha224Hash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  let H = [
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
  ];
  
  const msgLen = data.length;
  const bitLen = msgLen * 8;
  const paddedLen = Math.ceil((msgLen + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[msgLen] = 0x80;
  
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 4, bitLen, false);
  
  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    const W = new Uint32Array(64);
    
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(chunk + i * 4, false);
    }
    
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    
    let [a, b, c, d, e, f, g, h] = H;
    
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  
  const result = [];
  for (let i = 0; i < 7; i++) {
    result.push(
      ((H[i] >>> 24) & 0xff).toString(16).padStart(2, '0'),
      ((H[i] >>> 16) & 0xff).toString(16).padStart(2, '0'),
      ((H[i] >>> 8) & 0xff).toString(16).padStart(2, '0'),
      (H[i] & 0xff).toString(16).padStart(2, '0')
    );
  }
  return result.join('');
}

function rightRotate(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}
