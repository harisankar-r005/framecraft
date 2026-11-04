// Guidance changes panel navigation only; it does not alter the saved creative.
const workflowSteps=Array.from(document.querySelectorAll('.workflow-step'));
function showWorkflowStep(number,scroll=true){
 const target=workflowSteps.find(item=>Number(item.dataset.step)===Number(number));if(!target)return;
 workflowSteps.forEach(item=>{item.open=item===target});
 const title=target.querySelector('strong').textContent;
 $('workflowProgress').textContent='Step '+number+' of 9 · '+title;
 if(scroll)target.scrollIntoView({behavior:'smooth',block:'nearest'});
}
workflowSteps.forEach(step=>{
 step.addEventListener('toggle',()=>{if(step.open)showWorkflowStep(step.dataset.step,false)});
 step.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>{
  if(exporting)return;
  if(Number(step.dataset.step)===3&&Number(button.dataset.go)>3&&!(state.template==='framed'?state.clips?.length:state.images.length)){message(state.template==='framed'?'Add at least one video clip in step 3 before continuing.':'Add at least one result image in step 3 before continuing.');$(state.template==='framed'?'clipUpload':'upload').click();return}
  showWorkflowStep(button.dataset.go);
 }));
});
$('workflowBackup').onclick=()=>$('downloadProject').click();
$('workflowExport').onclick=()=>$('export').click();
function refreshAnimationPanels(){
 const name=templates.find(t=>t.id===state.template)?.name||'your template',upload=state.template==='collage',framed=state.template==='framed';
 $('animationTemplateLabel').textContent='Animations · '+name;
 $('animationTemplateHint').textContent=upload?'Start with motion. Open Photo upload & loading only if you want an upload sequence.':framed?'Start with motion. Use Frame layout to style the supplied video clips.':'Start with Motion & transitions. Loading effects are not part of this template.';
 $('uploadAnimationGroup').hidden=!upload;$('frameAnimationGroup').hidden=!framed;$('uploadUnavailable').hidden=upload||framed;
 const solid=$('loaderColorMode').value!=='gradient';$('loaderColor2').closest('label').hidden=solid;$('loaderGradientDirection').closest('label').hidden=solid;
 const hasEffect=$('effects').value!=='none';for(const id of ['effectIntensity','effectSpeed','effectColor'])$(id).closest('label').hidden=!hasEffect;
}
function previewAnimationTemplate(){if(exporting)return;$('restart').click();$('play').click()}
$('previewAnimationTemplate').onclick=previewAnimationTemplate;
$('previewFrameLayout').onclick=previewAnimationTemplate;
for(const id of ['loaderColorMode','effects'])$(id).addEventListener('input',refreshAnimationPanels);
refreshAnimationPanels();
