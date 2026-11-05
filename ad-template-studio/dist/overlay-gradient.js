/* Keep gradient controls synchronized without writing stale UI into a project. */
function refreshOverlayGradientControls(){
 const g=state.overlayGradient||(state.overlayGradient=defaultOverlayGradient());
 $('overlayGradientEnabled').checked=!!g.enabled;
 for(const [prefix,stop] of [['overlayTop',g.top],['overlayBottom',g.bottom]]){
  $(prefix+'Color').value=stop.color;$(prefix+'Hex').value=stop.color.toUpperCase();
  $(prefix+'Opacity').value=stop.opacity;$(prefix+'Position').value=stop.position;
 }
 const stops=[g.top,g.bottom].sort((a,b)=>a.position-b.position);
 $('overlayGradientPreview').style.background=`linear-gradient(to right,${stops.map(stop=>{
  const n=parseInt(stop.color.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${stop.opacity/100}) ${stop.position}%`;
 }).join(',')}),repeating-conic-gradient(#59616a 0 25%,#303842 0 50%) 50%/12px 12px`;
}
(()=>{
 const clamp=value=>Math.max(0,Math.min(100,Number(value)||0));
 const read=()=>{
  state.overlayGradient={enabled:$('overlayGradientEnabled').checked,
   top:{color:$('overlayTopColor').value,opacity:clamp($('overlayTopOpacity').value),position:clamp($('overlayTopPosition').value)},
   bottom:{color:$('overlayBottomColor').value,opacity:clamp($('overlayBottomOpacity').value),position:clamp($('overlayBottomPosition').value)}};
  refreshOverlayGradientControls();changed();
 };
 for(const id of ['overlayGradientEnabled','overlayTopColor','overlayTopOpacity','overlayTopPosition','overlayBottomColor','overlayBottomOpacity','overlayBottomPosition'])$(id).addEventListener('input',read);
 refreshOverlayGradientControls();
})();
