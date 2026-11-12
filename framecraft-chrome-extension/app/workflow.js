// Guidance changes panel navigation only; it does not alter the saved creative.
const workflowSteps=Array.from(document.querySelectorAll('.workflow-step'));
const workflowStepStorageKey='framecraft-active-workflow-step';
function showWorkflowStep(number,scroll=true){
 const target=workflowSteps.find(item=>Number(item.dataset.step)===Number(number));if(!target)return;
 workflowSteps.forEach(item=>{item.open=item===target});
 try{sessionStorage.setItem(workflowStepStorageKey,String(number))}catch{}
 const title=target.querySelector('strong').textContent;
 const progress=$('workflowProgress');if(progress)progress.textContent='Step '+number+' of 9 · '+title;
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
try{const savedStep=Number(sessionStorage.getItem(workflowStepStorageKey));if(savedStep!==2&&savedStep!==5&&savedStep!==6&&workflowSteps.some(step=>Number(step.dataset.step)===savedStep))showWorkflowStep(savedStep,false)}catch{}
$('workflowBackup').onclick=()=>$('downloadProject').click();
$('workflowOpenProject').onclick=()=>{$('openProject').click()};
$('workflowExport').onclick=()=>$('export').click();
function refreshAnimationPanels(){
 const upload=['collage','styles'].includes(state.template),framed=state.template==='framed';
 $('fitControl').hidden=state.template==='styles';
 $('durationControl').style.gridColumn=state.template==='styles'?'1 / -1':'';
 $('uploadAnimationGroup').hidden=!upload;$('frameAnimationGroup').hidden=!framed;$('uploadUnavailable').hidden=upload||framed;
 const solid=$('loaderColorMode').value!=='gradient';$('loaderColor2').closest('label').hidden=solid;$('loaderGradientDirection').closest('label').hidden=solid;
 const hasEffect=$('effects').value!=='none';for(const id of ['effectIntensity','effectSpeed','effectColor'])$(id).closest('label').hidden=!hasEffect;$('zoomDirection').closest('label').hidden=!hasEffect||$('effects').value!=='zoom';
}
function previewAnimationTemplate(){if(exporting)return;$('restart').click();$('play').click()}
$('previewFrameLayout').onclick=previewAnimationTemplate;
for(const id of ['loaderColorMode','effects'])$(id).addEventListener('input',refreshAnimationPanels);
refreshAnimationPanels();
