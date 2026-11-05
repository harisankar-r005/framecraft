function refreshColorControls(){document.querySelectorAll('[data-color-control]').forEach(control=>{
 const swatch=control.querySelector('input[type=color]'),hex=control.querySelector('.color-hex');hex.value=swatch.value.toUpperCase();
})}
/* Keep compact hex fields and native color swatches synchronized. */
document.querySelectorAll('[data-color-control]').forEach(control=>{
 const swatch=control.querySelector('input[type=color]'),hex=control.querySelector('.color-hex');
 const write=()=>{hex.value=swatch.value.toUpperCase()};
 swatch.addEventListener('input',write);swatch.addEventListener('change',write);
 hex.addEventListener('change',()=>{const value=hex.value.trim();if(/^#[0-9a-f]{6}$/i.test(value)){swatch.value=value;swatch.dispatchEvent(new Event('input',{bubbles:true}));write()}else write()});
 write();
});
