(()=>{
const KEY='lucky.assets.v28';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{placeholder:'question',effect:'fireworks'}}catch{return {placeholder:'question',effect:'fireworks'}}};
const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
const fileData=(file,max=4*1024*1024)=>new Promise((resolve,reject)=>{if(!file)return reject();if(file.size>max)return reject(new Error('Tệp quá lớn'));const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
function apply(v){
 const stage=document.querySelector('.stage'),pic=document.getElementById('prizePic'),head=document.querySelector('.stageHead');
 let logo=document.getElementById('eventLogoV28'); if(!logo&&head){logo=document.createElement('img');logo.id='eventLogoV28';logo.className='eventLogoV28';head.prepend(logo)}
 if(logo){logo.src=v.logo||'';logo.style.display=v.logo?'block':'none'}
 if(pic){if(v.prizeImage){pic.innerHTML=`<img class="prizeImageV28" src="${v.prizeImage}" alt="Ảnh phần thưởng">`}else if(!pic.textContent.trim())pic.textContent='🎁'}
 document.documentElement.style.setProperty('--idle-char',v.placeholder==='dash'?'"—"':v.placeholder==='star'?'"★"':'"?"');
 if(stage){stage.dataset.stageEffect=v.effect||'fireworks';stage.classList.toggle('stagePulse',v.effect==='glow');stage.classList.toggle('stageShimmer',v.effect==='shimmer')}
}
function resetTiles(v){document.querySelectorAll('#roller span').forEach(x=>{if(x.textContent==='?'||x.textContent==='—'||x.textContent==='★')x.textContent=v.placeholder==='dash'?'—':v.placeholder==='star'?'★':'?'})}
function init(){const settings=document.querySelector('#settings .settings');if(!settings||document.getElementById('assetEditorV28'))return;const sec=document.createElement('section');sec.id='assetEditorV28';sec.className='deepEditor';sec.innerHTML=`<h3>Logo, ảnh giải & hiệu ứng sân khấu</h3><p class="sectionHint">Các layer Logo, Prize image, Number-box placeholder và Stage effect được tách riêng theo cấu trúc editor của bundle nguồn.</p><div class="assetGrid"><label>Logo sự kiện<input id="logoUploadV28" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><label>Ảnh phần thưởng<input id="prizeUploadV28" type="file" accept="image/png,image/jpeg,image/webp"></label><label>Ký tự ô trước khi quay<select id="placeholderV28"><option value="question">?</option><option value="dash">—</option><option value="star">★</option></select></label><label>Hiệu ứng sân khấu<select id="effectV28"><option value="fireworks">Fireworks</option><option value="confetti">Confetti</option><option value="shimmer">Gold shimmer</option><option value="glow">Glow pulse</option><option value="none">Không hiệu ứng</option></select></label></div><div class="assetActions"><button id="clearLogoV28" type="button">Xóa logo</button><button id="clearPrizeV28" type="button">Xóa ảnh giải</button><button id="previewEffectV28" type="button" class="primary">Xem hiệu ứng</button></div>`;
 const anchor=document.getElementById('backgroundLibrary')?.closest('.deepEditor');(anchor?.parentNode||settings).insertBefore(sec,anchor?.nextSibling||null);
 let v=read();sec.querySelector('#placeholderV28').value=v.placeholder||'question';sec.querySelector('#effectV28').value=v.effect||'fireworks';
 sec.querySelector('#logoUploadV28').onchange=async e=>{try{v={...v,logo:await fileData(e.target.files?.[0])};save(v);apply(v)}catch(err){alert(err.message||'Không đọc được logo')}};
 sec.querySelector('#prizeUploadV28').onchange=async e=>{try{v={...v,prizeImage:await fileData(e.target.files?.[0])};save(v);apply(v)}catch(err){alert(err.message||'Không đọc được ảnh giải')}};
 sec.querySelector('#placeholderV28').onchange=e=>{v={...v,placeholder:e.target.value};save(v);apply(v);resetTiles(v)};
 sec.querySelector('#effectV28').onchange=e=>{v={...v,effect:e.target.value};save(v);apply(v)};
 sec.querySelector('#clearLogoV28').onclick=()=>{v={...v,logo:null};save(v);apply(v)};sec.querySelector('#clearPrizeV28').onclick=()=>{v={...v,prizeImage:null};save(v);if(document.getElementById('prizePic'))document.getElementById('prizePic').textContent='🎁';apply(v)};
 sec.querySelector('#previewEffectV28').onclick=()=>preview(v.effect);
 apply(v);resetTiles(v)
}
function preview(kind){const stage=document.querySelector('.stage');if(!stage||kind==='none')return;const layer=document.createElement('div');layer.className='effectPreviewV28 '+kind;stage.appendChild(layer);if(kind==='confetti'){for(let i=0;i<45;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.animationDelay=Math.random()*.6+'s';p.style.transform=`rotate(${Math.random()*180}deg)`;layer.appendChild(p)}}else if(kind==='fireworks'){for(let i=0;i<5;i++){const p=document.createElement('i');p.style.left=(10+Math.random()*80)+'%';p.style.top=(10+Math.random()*55)+'%';p.style.animationDelay=(i*.18)+'s';layer.appendChild(p)}}setTimeout(()=>layer.remove(),2600)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();