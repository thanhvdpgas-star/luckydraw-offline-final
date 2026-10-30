(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

  function prizeFormHardening(){
    const form=$('#prizeForm'), old=$('#addPrize');
    if(!form||!old) return;
    form.addEventListener('submit',e=>e.preventDefault(),true);
    const btn=old.cloneNode(true); old.replaceWith(btn);
    btn.type='button';
    btn.addEventListener('click',async e=>{
      e.preventDefault();
      const name=$('#pname')?.value.trim()||'';
      const qty=Math.max(1,Number($('#pqty')?.value)||1);
      const drawCount=Math.max(1,Number($('#pdraw')?.value)||1);
      if(!name) return alert('Vui lòng nhập tên giải thưởng.');
      if(data.prizes.some(p=>String(p.name).trim().toLowerCase()===name.toLowerCase()) && !confirm('Tên giải đã tồn tại. Vẫn thêm giải mới?')) return;
      data.prizes.push({id:crypto.randomUUID(),name,qty,drawCount,drawType:'AUTO',drawStyle:'standard',spinTime:Number(data.settings?.duration)||3,stopDuration:0.8,celebration:'firework',musicId:''});
      $('#pname').value=''; $('#pqty').value='1'; $('#pdraw').value='1';
      await save(); renderPrizes();
      $('#pname').focus();
    });
  }

  function settingsHardening(){
    const old=$('#saveSettings'); if(!old) return;
    const btn=old.cloneNode(true); old.replaceWith(btn);
    btn.addEventListener('click',async e=>{
      e.preventDefault();
      const previous=data.settings||{};
      data.settings={...previous,
        title:$('#sTitle')?.value.trim()||DEF.settings.title,
        sub:$('#sSub')?.value.trim()||'',
        repeat:!!$('#repeat')?.checked,
        duration:clamp(Number($('#duration')?.value)||3,1,20),
        bg:$('#bg')?.value||previous.bg||DEF.settings.bg,
        accent:$('#accent')?.value||previous.accent||DEF.settings.accent,
        drawField:$('#drawField')?.value||previous.drawField||'code'
      };
      apply(); await save(); openPage('draw');
    });
  }

  function importHardening(){
    const input=$('#excel'); if(!input) return;
    input.addEventListener('change',()=>setTimeout(()=>{
      const seen=new Set(); let duplicate=0;
      for(const p of data.participants||[]){const key=String(p.code||'').trim().toLowerCase();if(key&&seen.has(key))duplicate++;else if(key)seen.add(key)}
      if(duplicate) console.warn(`[LuckyDraw] ${duplicate} mã người tham dự bị trùng. ID nội bộ vẫn duy nhất.`);
    },0));
  }

  function runtimeGuards(){
    window.addEventListener('unhandledrejection',e=>{console.error('[LuckyDraw] Unhandled rejection',e.reason)});
    window.addEventListener('error',e=>{console.error('[LuckyDraw] Runtime error',e.error||e.message)});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        const sm=$('#soundModal'); if(sm&&!sm.classList.contains('hidden')) sm.classList.add('hidden');
      }
    });
    window.addEventListener('beforeunload',e=>{
      if(typeof drawing!=='undefined'&&drawing){e.preventDefault();e.returnValue='';}
    });
  }

  function boot(){prizeFormHardening();settingsHardening();importHardening();runtimeGuards();console.info('[LuckyDraw] V3.6 integration hardening active');}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
