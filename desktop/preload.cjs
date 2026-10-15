const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('adminisDesktop',Object.freeze({
 platform:process.platform,
 setWindowTheme:theme=>ipcRenderer.invoke('chrome:theme',theme),
 openAppMenu:()=>ipcRenderer.invoke('chrome:menu'),
 readData:()=>ipcRenderer.sendSync('planner:read'),
 writeData:data=>ipcRenderer.sendSync('planner:write',data),
 exportBackup:()=>ipcRenderer.invoke('planner:export'),
 importBackup:()=>ipcRenderer.invoke('planner:import'),
 showDataFolder:()=>ipcRenderer.invoke('planner:show-folder'),
 updateStatus:()=>ipcRenderer.invoke('updates:status'),
 checkUpdates:includePrerelease=>ipcRenderer.invoke('updates:check',includePrerelease),
 downloadUpdate:()=>ipcRenderer.invoke('updates:download'),
 installUpdate:()=>ipcRenderer.invoke('updates:install'),
 openUpdateDownloads:testBuilds=>ipcRenderer.invoke('updates:open-downloads',testBuilds),
 onUpdateStatus:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('updates:status',listener);return ()=>ipcRenderer.removeListener('updates:status',listener)},
 onShowUpdates:callback=>{const listener=()=>callback();ipcRenderer.on('updates:show',listener);return ()=>ipcRenderer.removeListener('updates:show',listener)}
}));

