async function enterPreviewFullscreen(element){
 try{if(typeof element.requestFullscreen!=='function'){message('Full-screen preview is unavailable in this browser. Try recent Chrome or Edge.');return}await element.requestFullscreen()}
 catch(error){message('Could not open full-screen preview: '+error.message)}
}
$('fullscreenPreview').onclick=()=>enterPreviewFullscreen(canvas.parentElement);
$('fullscreenPlay').onclick=()=>{if(!exporting)$('play').click()};
$('fullscreenExit').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(e=>message(e.message))};
$('trimFullscreen').onclick=()=>enterPreviewFullscreen($('trimPreview'));
document.addEventListener('fullscreenchange',()=>{$('fullscreenPreview').setAttribute('aria-pressed',document.fullscreenElement===canvas.parentElement?'true':'false')});
canvas.parentElement.addEventListener('keydown',event=>{if(document.fullscreenElement===canvas.parentElement&&event.code==='Space'&&!['BUTTON','INPUT','SELECT'].includes(event.target.tagName)){event.preventDefault();if(!exporting)$('play').click()}});
