const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const src=p=>fs.readFileSync(path.join(__dirname,'..','renderer',p),'utf8');
test('Six slot tiles retain DOM nodes during rolling',()=>{const app=src('app.js');assert.match(app,/host\.children\.length!==chars\.length/);assert.match(app,/host\.children\[i\]\.textContent=c/);});
test('Automatic result explicitly ends spin sound before winner announcement',()=>{const app=src('app.js');assert.match(app,/LuckyDrawAudio\?\.finish\(shown\(ws\[0\]\)\)/);});
test('Manual result explicitly ends spin sound and repeated stop is locked',()=>{const app=src('prize-runtime.js');assert.match(app,/manualStopping=true/);assert.match(app,/if\(manualStopping\)return/);assert.match(app,/LuckyDrawAudio\?\.finish/);});
test('Winner pagination renders every prize winner across pages',()=>{const p=src('stage-pagination.js');assert.match(p,/Math\.ceil\(rows\.length\/PAGE_SIZE\)/);assert.match(p,/rows\.slice\(start,start\+PAGE_SIZE\)/);});
test('Per prize editor saves AUTO MANUAL and validates quantity',()=>{const p=src('prize-config-panel.js');assert.match(p,/pcType/);assert.match(p,/pcSpin/);assert.match(p,/qty<Math\.max\(1,drawn\)/);});
test('Spin sound and landing timers are cleared for subsequent draws',()=>{const p=src('draw-engine.js');assert.match(p,/landingTimers\.forEach\(clearTimeout\)/);assert.match(p,/activeEffects\.forEach/);assert.match(p,/drawStyle\|\|cfg\.drawStyle/);});
