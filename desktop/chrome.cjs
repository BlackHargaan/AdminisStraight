function chromeOptions(platform){return {titleBarStyle:'hidden',autoHideMenuBar:platform!=='darwin',...(platform==='darwin'?{trafficLightPosition:{x:14,y:12}}:{titleBarOverlay:{color:'#1c2529',symbolColor:'#e8eeed',height:38}})}}
function validateChromeTheme(value){if(!value||!['background','foreground'].every(k=>typeof value[k]==='string'&&/^#[0-9a-f]{6}$/i.test(value[k])))throw Error('Invalid window colors.');return {color:value.background,symbolColor:value.foreground,height:38}}
module.exports={chromeOptions,validateChromeTheme};
