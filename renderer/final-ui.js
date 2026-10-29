(()=>{
  const $=s=>document.querySelector(s);
  const overlay=document.createElement('div');
  overlay.id='winnerReveal';
  overlay.className='winnerReveal hidden';
  overlay.innerHTML=`<div class="revealBurst"></div><div class="revealInner"><div class="revealCrown">♛</div><div class="revealLead">CHÚC MỪNG</div><div id="revealPrize" class="revealPrize"></div><div id="revealCards" class="revealCards"></div><div class="revealActions"><button id="revealClose">Tiếp tục quay</button><button id="revealResults">Xem kết quả</button></div></div>`;
  document.body.appendChild(overlay);
  const close=()=>overlay.classList.add('hidden');
  $('#revealClose').onclick=close;
  $('#revealResults').onclick=()=>{close();document.querySelector('[data-page="results"]')?.click()};
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  let last='';
  const winner=$('#winner');
  if(winner)new MutationObserver(()=>{
    const text=winner.textContent.trim();
    if(!text||text===last)return;
    last=text;
    const prize=$('#prizeLabel')?.textContent||'GIẢI THƯỞNG';
    const values=[...document.querySelectorAll('#roller span')].map(x=>x.textContent).join('');
    const names=text.split(' · ').filter(Boolean);
    $('#revealPrize').textContent=prize;
    $('#revealCards').innerHTML=names.map((n,i)=>`<div class="revealCard" style="--delay:${i*90}ms"><div class="revealCode">${names.length===1?values:(i+1).toString().padStart(2,'0')}</div><div class="revealName"></div><div class="revealRole">NGƯỜI TRÚNG GIẢI</div></div>`).join('');
    [...document.querySelectorAll('.revealName')].forEach((el,i)=>el.textContent=names[i]);
    overlay.classList.remove('hidden');
    overlay.classList.remove('pop'); void overlay.offsetWidth; overlay.classList.add('pop');
  },{childList:true,subtree:true,characterData:true});

  // Make modal close buttons consistently return to the draw stage.
  document.querySelectorAll('.modalPage .close').forEach(b=>b.onclick=()=>document.querySelector('[data-page="draw"]')?.click());
  // Double click the stage to toggle fullscreen, useful on LED/projector screens.
  document.querySelector('.stagePage')?.addEventListener('dblclick',e=>{if(!e.target.closest('button,input,select,.winnerPanel'))window.desktop?.fullscreen?.()});
})();
