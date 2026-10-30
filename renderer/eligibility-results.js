// V3.3 - eligibility filtering + deleted/restored results, implemented locally/offline.
(() => {
  const q = s => document.querySelector(s);
  const html = v => String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const ensure = () => {
    if (typeof data === 'undefined') return false;
    data.deletedResults ||= [];
    data.settings ||= {};
    data.settings.redrawRemoved ??= false;
    (data.prizes || []).forEach(p => { p.eligibility ||= {enabled:false, field:'', condition:'equals', values:[]}; });
    return true;
  };
  const customValue = (p, field) => {
    if (!field) return '';
    const direct = p[field];
    if (direct !== undefined && direct !== null) return String(direct).trim();
    const obj = p.custom || {};
    const key = Object.keys(obj).find(k => k.trim().toLowerCase() === String(field).trim().toLowerCase());
    return key == null ? '' : String(obj[key] ?? '').trim();
  };
  const passesRule = (person, rule) => {
    if (!rule?.enabled || !rule.field || !(rule.values || []).length) return true;
    const actual = customValue(person, rule.field).toLowerCase();
    const values = rule.values.map(v => String(v).trim().toLowerCase()).filter(Boolean);
    if (!values.length) return true;
    switch (rule.condition) {
      case 'not_equals': return !values.includes(actual);
      case 'contains': return values.some(v => actual.includes(v));
      case 'not_contains': return values.every(v => !actual.includes(v));
      default: return values.includes(actual);
    }
  };
  const originalEligible = typeof eligible === 'function' ? eligible : null;
  if (originalEligible) eligible = function () {
    ensure();
    const prize = data.prizes?.[selected];
    const won = new Set((data.results || []).map(r => r.participantId));
    if (!data.settings.redrawRemoved) (data.deletedResults || []).forEach(r => won.add(r.participantId));
    return (data.participants || []).filter(p => (data.settings.repeat || !won.has(p.id)) && passesRule(p, prize?.eligibility));
  };

  function fields() {
    const base = new Set(['code','name','phone','qr','position','company']);
    (data.participants || []).slice(0,500).forEach(p => Object.keys(p.custom || {}).forEach(k => base.add(k)));
    return [...base];
  }
  function eligibleCount(prize) {
    return (data.participants || []).filter(p => passesRule(p, prize?.eligibility)).length;
  }
  function injectPrizeEligibility() {
    const form = q('#prizeForm'); if (!form || q('#eligibilityBox')) return;
    const box = document.createElement('div'); box.id='eligibilityBox'; box.className='eligibilityBox';
    box.innerHTML = `<label class="check"><input id="eligEnable" type="checkbox"> Lọc người đủ điều kiện cho giải mới</label>
      <label class="field"><span>Trường dữ liệu</span><select id="eligField"></select></label>
      <label class="field"><span>Điều kiện</span><select id="eligCond"><option value="equals">Bằng một trong các giá trị</option><option value="not_equals">Không bằng</option><option value="contains">Có chứa</option><option value="not_contains">Không chứa</option></select></label>
      <label class="field"><span>Giá trị (ngăn cách bằng dấu ;)</span><input id="eligValues" placeholder="Ví dụ: Hà Nội; Kinh doanh"></label><small id="eligStats">Chưa bật lọc</small>`;
    form.insertAdjacentElement('afterend', box);
    const refreshFields=()=>{q('#eligField').innerHTML='<option value="">Chọn trường...</option>'+fields().map(f=>`<option>${html(f)}</option>`).join('')};
    const stats=()=>{const rule={enabled:q('#eligEnable').checked,field:q('#eligField').value,condition:q('#eligCond').value,values:q('#eligValues').value.split(';').map(x=>x.trim()).filter(Boolean)}; const n=(data.participants||[]).filter(p=>passesRule(p,rule)).length;q('#eligStats').textContent=rule.enabled?`${n} / ${(data.participants||[]).length} người đủ điều kiện`:'Chưa bật lọc'};
    ['change','input'].forEach(ev=>box.addEventListener(ev,stats)); refreshFields();
    const old = q('#addPrize').onclick;
    q('#prizeForm').addEventListener('submit',()=>{ setTimeout(()=>{const p=data.prizes?.[data.prizes.length-1];if(!p)return;p.eligibility={enabled:q('#eligEnable').checked,field:q('#eligField').value,condition:q('#eligCond').value,values:q('#eligValues').value.split(';').map(x=>x.trim()).filter(Boolean)};save();renderPrizes();},0); }, true);
    window.refreshEligibilityFields=refreshFields;
  }
  function decoratePrizeCards() {
    const root=q('#prizeList'); if(!root) return;
    [...root.children].forEach((card,i)=>{const p=data.prizes?.[i];if(!p||card.querySelector('.eligBadge'))return;const b=document.createElement('small');b.className='eligBadge';b.textContent=p.eligibility?.enabled?` · Đủ điều kiện: ${eligibleCount(p)}/${data.participants.length}`:' · Không lọc điều kiện';card.querySelector('small')?.append(b);});
  }
  const oldRenderPrizes = typeof renderPrizes === 'function' ? renderPrizes : null;
  if(oldRenderPrizes) renderPrizes=function(){const r=oldRenderPrizes.apply(this,arguments);setTimeout(decoratePrizeCards,0);return r};

  function injectResultControls(){
    const modal=q('#results .resultModal'); if(!modal||q('#deletedControls'))return;
    const tabs=modal.querySelector('.resultTabs');
    tabs.innerHTML='<button id="tabActive" class="resultTabBtn active">Tất cả kết quả</button><button id="tabDeleted" class="resultTabBtn">Kết quả đã xóa</button>';
    const bar=document.createElement('div');bar.id='deletedControls';bar.className='deletedControls';bar.innerHTML='<label class="check"><input id="redrawRemoved" type="checkbox"> Cho phép người đã xóa/skip được quay lại</label>';
    tabs.insertAdjacentElement('afterend',bar);q('#redrawRemoved').checked=!!data.settings.redrawRemoved;
    q('#redrawRemoved').onchange=async e=>{data.settings.redrawRemoved=e.target.checked;await save()};
    q('#tabActive').onclick=()=>showResultMode(false);q('#tabDeleted').onclick=()=>showResultMode(true);
  }
  function activeRows(){return (data.results||[]).map((r,i)=>`<tr><td>${i+1}</td><td>${html(r.prize)}</td><td>${html(r.code)}</td><td><b>${html(r.name)}</b></td><td>${html(r.position||r.company)}</td><td>${new Date(r.drawnAt).toLocaleString('vi-VN')}</td><td><button class="danger miniDelete" data-id="${r.id}">Xóa</button></td></tr>`).join('')}
  function deletedRows(){return (data.deletedResults||[]).map((r,i)=>`<tr><td>${i+1}</td><td>${html(r.prize)}</td><td>${html(r.code)}</td><td><b>${html(r.name)}</b></td><td>${html(r.position||r.company)}</td><td>${r.deletedAt?new Date(r.deletedAt).toLocaleString('vi-VN'):''}</td><td><button class="restoreResult" data-id="${r.id}">Khôi phục</button> <button class="danger purgeResult" data-id="${r.id}">Xóa hẳn</button></td></tr>`).join('')}
  function showResultMode(deleted){
    q('#tabActive')?.classList.toggle('active',!deleted);q('#tabDeleted')?.classList.toggle('active',deleted);
    const t=q('#resultTable');if(!t)return;
    t.innerHTML=`<tr><th>STT</th><th>Giải</th><th>Mã</th><th>Họ tên</th><th>Bộ phận</th><th>${deleted?'Đã xóa lúc':'Thời điểm'}</th><th>Thao tác</th></tr>`+(deleted?deletedRows():activeRows());
  }
  document.addEventListener('click',async e=>{
    const del=e.target.closest('.miniDelete'); if(del){const i=data.results.findIndex(r=>r.id===del.dataset.id);if(i>=0&&confirm('Chuyển kết quả này vào Kết quả đã xóa?')){const [r]=data.results.splice(i,1);r.deletedAt=new Date().toISOString();data.deletedResults.push(r);await save();renderResults();showResultMode(false);renderPrizes();}return;}
    const res=e.target.closest('.restoreResult');if(res){const i=data.deletedResults.findIndex(r=>r.id===res.dataset.id);if(i>=0){const [r]=data.deletedResults.splice(i,1);delete r.deletedAt;data.results.push(r);await save();renderResults();showResultMode(true);renderPrizes();}return;}
    const purge=e.target.closest('.purgeResult');if(purge){const i=data.deletedResults.findIndex(r=>r.id===purge.dataset.id);if(i>=0&&confirm('Xóa vĩnh viễn kết quả này?')){data.deletedResults.splice(i,1);await save();showResultMode(true);}return;}
  });
  const oldRenderResults=typeof renderResults==='function'?renderResults:null;
  if(oldRenderResults) renderResults=function(){const r=oldRenderResults.apply(this,arguments);setTimeout(()=>{if(q('#tabActive')?.classList.contains('active'))showResultMode(false)},0);return r};
  setTimeout(()=>{if(!ensure())return;injectPrizeEligibility();injectResultControls();decoratePrizeCards();},700);
})();
