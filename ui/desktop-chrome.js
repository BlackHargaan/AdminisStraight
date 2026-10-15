const bridge=window.adminisDesktop;
if(bridge?.platform){
 document.documentElement.dataset.desktopPlatform=bridge.platform;
 const bar=document.createElement('header');bar.className='desktop-titlebar';bar.setAttribute('aria-label','Application window');
 const menu=document.createElement('button');menu.className='desktop-menu-button';menu.type='button';menu.textContent='☰';menu.setAttribute('aria-label','Application menu');menu.title='Application menu';menu.addEventListener('click',()=>bridge.openAppMenu().catch(()=>{}));
 const mark=document.createElement('span');mark.className='desktop-title-mark';mark.textContent='a.';mark.setAttribute('aria-hidden','true');
 const title=document.createElement('span');title.className='desktop-window-title';title.textContent=document.title;
 bar.append(menu,mark,title);document.body.prepend(bar);
 new MutationObserver(()=>{title.textContent=document.title}).observe(document.querySelector('title'),{childList:true,subtree:true,characterData:true});
 function hex(value){const c=value.trim();if(/^#[0-9a-f]{6}$/i.test(c))return c;const m=c.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);return m?'#'+m.slice(1,4).map(v=>Number(v).toString(16).padStart(2,'0')).join(''):null}
 function sync(){requestAnimationFrame(()=>{const s=getComputedStyle(document.documentElement),background=hex(s.getPropertyValue('--paper')),foreground=hex(s.getPropertyValue('--ink'));if(background&&foreground)bridge.setWindowTheme({background,foreground}).catch(()=>{});})}
 window.addEventListener('appearancechange',sync);sync();
}
