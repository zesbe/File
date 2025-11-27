l<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MiniMax Chat (WhatsApp style)</title>
<style>
  :root{
    --green:#25D366;
    --bg:#ECE5DD;
    --user:#DCF8C6;
    --assistant:#FFFFFF;
    --muted:#7a7a7a;
    --maxWidth:900px;
  }
  html,body{height:100%;margin:0;font-family:system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;}
  body{background:var(--bg);display:flex;align-items:center;justify-content:center;padding:8px;}
  .app{width:100%;max-width:var(--maxWidth);height:100vh;display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);}
  header{display:flex;align-items:center;gap:12px;padding:12px 14px;background:linear-gradient(90deg,var(--green),#06b86b);color:#fff;}
  header img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.18);}
  header .title{font-weight:600;font-size:16px;line-height:1;}
  header .sub{font-size:12px;opacity:0.95}
  /* chat area */
  main.chat{flex:1;padding:12px;overflow:auto;background:linear-gradient(#e9efe9, #f3f6f3);}
  .bubble-row{display:flex;gap:8px;align-items:flex-end;margin-bottom:8px;}
  .bubble{max-width:78%;padding:10px 12px;border-radius:18px;position:relative;word-wrap:break-word;box-shadow:0 1px 0 rgba(0,0,0,0.04);}
  .user-row{justify-content:flex-end;}
  .assistant-row{justify-content:flex-start;}
  .avatar{width:32px;height:32px;border-radius:50%;background:#ddd;flex:0 0 32px;display:block;overflow:hidden;}
  .avatar img{width:100%;height:100%;object-fit:cover;}
  .bubble.user{background:var(--user);border-bottom-right-radius:4px;}
  .bubble.assistant{background:var(--assistant);border-bottom-left-radius:4px;}
  .meta{font-size:11px;color:var(--muted);margin-top:6px;text-align:right;}
  .meta-left{text-align:left;}
  /* image inside bubble */
  .bubble img.msg-img{max-width:220px;max-height:220px;border-radius:8px;display:block;margin-bottom:8px;}
  /* input area */
  footer{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(0,0,0,0.06);align-items:flex-end;background:#fff;}
  .controls{flex:1;display:flex;gap:8px;align-items:end;}
  .file-btn{display:inline-flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:#f1f1f1;border:1px solid #e6e6e6;cursor:pointer;font-size:13px;}
  input[type="text"]{flex:1;padding:10px;border-radius:10px;border:1px solid #e6e6e6;font-size:15px}
  button.send{background:var(--green);color:#fff;border:none;padding:10px 12px;border-radius:10px;font-weight:600;cursor:pointer}
  .small{font-size:12px;color:var(--muted)}
  /* mobile tweaks */
  @media (max-width:420px){
    .bubble{max-width:82%}
    .bubble img.msg-img{max-width:160px}
  }
</style>
</head>
<body>
<div class="app" role="application" aria-label="MiniMax Chat">
  <header>
    <img src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=400&auto=format&fit=crop&crop=faces" alt="avatar">
    <div>
      <div class="title">MiniMax Chat</div>
      <div class="sub">Chat & Upload Gambar</div>
    </div>
  </header>

  <main id="chat" class="chat" aria-live="polite"></main>

  <footer>
    <div class="controls">
      <label class="file-btn" title="Pilih Gambar">
        <input id="file" type="file" accept="image/*" style="display:none" />
        🖼️ Pilih File
      </label>
      <input id="text" type="text" placeholder="Ketik pesan..." aria-label="Ketik pesan" />
    </div>
    <button id="send" class="send">Kirim</button>
  </footer>
</div>

<script>
  // Util: remove <think>...</think> if present (case-insensitive)
  function stripThinkTags(s){
    if(!s) return s||"";
    return s.replace(/<think>[\\s\\S]*?<\\/think>/gi, "").trim();
  }

  const chatEl = document.getElementById('chat');
  const textEl = document.getElementById('text');
  const fileEl = document.getElementById('file');
  const sendBtn = document.getElementById('send');

  let pendingImageFile = null;

  fileEl.addEventListener('change', (e) => {
    pendingImageFile = e.target.files[0] || null;
    // show small preview message so user sees selected image before sending
    if(pendingImageFile){
      appendLocalMessage('user', '', URL.createObjectURL(pendingImageFile), new Date());
    }
  });

  // append user message (local preview) or assistant
  function appendLocalMessage(role, text, imgUrl=null, date=new Date()){
    // create row
    const row = document.createElement('div');
    row.className = 'bubble-row ' + (role==='user' ? 'user-row' : 'assistant-row');
    if(role === 'assistant'){
      // avatar left
      const av = document.createElement('div'); av.className='avatar';
      av.innerHTML = '<img alt="bot" src="https://images.unsplash.com/photo-1508261304553-2d6f3f2f5f59?q=80&w=400&auto=format&fit=crop&crop=faces" />';
      row.appendChild(av);
    } else {
      // spacer for alignment
      const spacer = document.createElement('div'); spacer.style.width='40px'; row.appendChild(spacer);
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + (role==='user' ? 'user' : 'assistant');
    if(imgUrl){
      const img = document.createElement('img');
      img.className = 'msg-img';
      img.src = imgUrl;
      bubble.appendChild(img);
    }
    if(text){
      const p = document.createElement('div'); p.textContent = text; bubble.appendChild(p);
    }

    // meta (time)
    const meta = document.createElement('div');
    const hh = date.getHours().toString().padStart(2,'0');
    const mm = date.getMinutes().toString().padStart(2,'0');
    meta.className = 'meta ' + (role==='user' ? 'meta' : 'meta-left');
    meta.textContent = hh + ':' + mm;
    bubble.appendChild(meta);

    // push bubble
    if(role === 'assistant'){
      row.appendChild(bubble);
      // filler to right
      const filler = document.createElement('div'); filler.style.width='40px'; row.appendChild(filler);
    } else {
      row.appendChild(bubble);
    }

    chatEl.appendChild(row);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  // strip trailing preview user image messages (used if user selected file then sends)
  function removeLastLocalPreviewImage(){
    // find last user-row with an image and no text
    const rows = Array.from(chatEl.querySelectorAll('.bubble-row.user-row')).reverse();
    for(const r of rows){
      const img = r.querySelector('img.msg-img');
      const txt = r.querySelector('div:not(.meta)');
      // if it has image and no textual child (or empty), remove it to avoid duplicates
      // We'll just remove the first matching recent preview
      if(img){
        chatEl.removeChild(r);
        break;
      }
    }
  }

  async function send(){
    const message = textEl.value.trim();
    if(!message && !pendingImageFile) return;

    // show user's message (and image preview already appended); to avoid duplicate image preview, remove last preview
    removeLastLocalPreviewImage();
    appendLocalMessage('user', message, pendingImageFile ? URL.createObjectURL(pendingImageFile) : null, new Date());
    textEl.value = '';

    // upload image if present
    let imageUrl = null;
    if(pendingImageFile){
      try{
        const fd = new FormData();
        fd.append('image', pendingImageFile);
        sendBtn.disabled = true; sendBtn.textContent = 'Mengunggah...';
        const up = await fetch('/api/upload',{ method:'POST', body: fd });
        const j = await up.json();
        imageUrl = j.url;
      }catch(e){
        appendLocalMessage('assistant','Gagal upload gambar: '+ (e.message || e), null, new Date());
        pendingImageFile = null; fileEl.value = null; sendBtn.disabled = false; sendBtn.textContent = 'Kirim';
        return;
      }
    }

    // call chat endpoint
    try{
      sendBtn.disabled = true; sendBtn.textContent = 'Mengirim...';
      const resp = await fetch('/api/chat',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message, imageUrl })
      });
      const data = await resp.json();
      // strip <think> tags if exist
      const clean = stripThinkTags(data.reply || data?.message || "");
      appendLocalMessage('assistant', clean, imageUrl || null, new Date());
    }catch(e){
      appendLocalMessage('assistant', 'Error: '+ (e.message || e), null, new Date());
    }finally{
      pendingImageFile = null;
      fileEl.value = null;
      sendBtn.disabled = false; sendBtn.textContent = 'Kirim';
    }
  }

  // keyboard shortcuts
  sendBtn.addEventListener('click', send);
  textEl.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

  // Make chat scroller sticky on load (show top recent)
  window.addEventListener('load', ()=> chatEl.scrollTop = chatEl.scrollHeight );
</script>
</body>
</html>
