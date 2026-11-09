/* Keep compact hex fields and native color swatches synchronized. */
document.querySelectorAll('[data-color-control]').forEach(control=>{
 const swatch=control.querySelector('input[type=color]'),hex=control.querySelector('.color-hex');
 const write=()=>{hex.value=swatch.value.toUpperCase();control.style.setProperty('--color-swatch-color',swatch.value)};
 swatch.addEventListener('input',write);swatch.addEventListener('change',write);
 hex.addEventListener('change',()=>{const value=hex.value.trim();if(/^#[0-9a-f]{6}$/i.test(value)){swatch.value=value;swatch.dispatchEvent(new Event('input',{bubbles:true}));write()}else write()});
 write();
});

/* Give every titled editor card the same compact, collapsible treatment. */
document.querySelectorAll('.workflow-step[data-step="4"] .overlay-gradient-editor,.workflow-step[data-step="4"] .captions-group,.workflow-step[data-step="5"] .watermark-panel,.workflow-step[data-step="6"] .animation-subpanel,.workflow-step[data-step="7"] .endcard-media').forEach(panel=>{
 if(panel.tagName==='DETAILS')return;
 const heading=panel.querySelector(':scope > h3,:scope > .section-title');if(!heading)return;
 const details=document.createElement('details'),summary=document.createElement('summary');
 details.className=panel.className+' collapsible-panel';details.open=true;if(panel.id)details.id=panel.id;
 summary.innerHTML='<span></span><span aria-hidden="true">−</span>';summary.firstElementChild.textContent=heading.textContent;
 const children=[...panel.childNodes];details.append(summary);for(const child of children)if(child!==heading)details.append(child);
 panel.replaceWith(details);
});
