const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('adminisDesktop',Object.freeze({
 readData:()=>ipcRenderer.sendSync('planner:read'),
 writeData:data=>ipcRenderer.sendSync('planner:write',data),
 exportBackup:()=>ipcRenderer.invoke('planner:export'),
 importBackup:()=>ipcRenderer.invoke('planner:import'),
 showDataFolder:()=>ipcRenderer.invoke('planner:show-folder')
}));
