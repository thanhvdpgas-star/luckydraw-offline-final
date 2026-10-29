const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const path=require('path'),fs=require('fs');let win;
const dataFile=()=>path.join(app.getPath('userData'),'luckydraw-data.json');
function load(){try{return JSON.parse(fs.readFileSync(dataFile(),'utf8'))}catch{return null}}
function save(d){fs.writeFileSync(dataFile(),JSON.stringify(d,null,2),'utf8');return true}
function create(){win=new BrowserWindow({width:1280,height:800,minWidth:1024,minHeight:700,backgroundColor:'#0f0f28',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,'renderer','index.html'))}
app.whenReady().then(create);app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('data:load',()=>load());ipcMain.handle('data:save',(_,d)=>save(d));
ipcMain.handle('fullscreen',()=>{win.setFullScreen(!win.isFullScreen());return win.isFullScreen()});
ipcMain.handle('backup',async(_,d)=>{const r=await dialog.showSaveDialog(win,{defaultPath:'luckydraw-backup.json',filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return false;fs.writeFileSync(r.filePath,JSON.stringify(d,null,2),'utf8');return true});
ipcMain.handle('restore',async()=>{const r=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return null;return JSON.parse(fs.readFileSync(r.filePaths[0],'utf8'))});
ipcMain.handle('printPdf',async()=>{const r=await dialog.showSaveDialog(win,{defaultPath:'ket-qua-quay-thuong.pdf',filters:[{name:'PDF',extensions:['pdf']}]});if(r.canceled)return false;const b=await win.webContents.printToPDF({printBackground:true,pageSize:'A4'});fs.writeFileSync(r.filePath,b);return true});
