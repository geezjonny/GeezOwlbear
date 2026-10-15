import OBR from 'https://esm.sh/@owlbear-rodeo/sdk@2';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import {getDatabase,ref,get,onValue} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
// Public Firebase web-app configuration (not an admin credential).
const config = {apiKey:'AIzaSyCJrkcYjFjyyx5UNA9FUaCIlCvxxOYabis',
  authDomain:'geezsheets.firebaseapp.com',
  databaseURL:'https://geezsheets-default-rtdb.firebaseio.com',
  projectId:'geezsheets',
  storageBucket:'geezsheets.firebasestorage.app',
  messagingSenderId:'57811286242',
  appId:'1:57811286242:web:cd9cac596acdb355a2c6bb'
};
const db = getDatabase(initializeApp(config));
const KEY = 'io.github.geezjonny.geezowlbear/characterId';
const id = new URLSearchParams(location.search).get('token');
const $ = name=>document.getElementById(name);
let characters = new Map(),linkedId='',unsubscribe=null,ready=false;
const status = s=>$('status').textContent=s;
function updateLinkButton(){
  const chosen=$('character').value;
  $('link').disabled=!ready||!chosen||chosen===linkedId;
  $('unlink').disabled=!ready||!linkedId;
}
function displayCharacter(charId){
  if(unsubscribe){unsubscribe();unsubscribe=null;}
  const c=characters.get(charId);
  $('stats').hidden=!charId;
  $('open').hidden=!charId;
  if(!charId)return;
  $('characterName').textContent=c?.name||charId;
  const u=new URL('https://geezjonny.github.io/GeezSheets/sheet.html');u.searchParams.set('char',charId);$('open').href=u.href;
  $('hp').textContent='Loading HP…';$('bar').style.width='0%';
  unsubscribe=onValue(ref(db,`characters/pcs/${charId}/combat`),snap=>{
    const combat=snap.val();
    if(!combat){$('hp').textContent='No combat data';$('bar').style.width='0%';return;}
    const current=Number(combat.hp_current??0),max=Number(combat.hp_max??0);
    $('hp').textContent=`${current} / ${max} HP`;
    const pct=max>0?Math.max(0,Math.min(100,current/max*100)):0;
    $('bar').style.width=pct+'%';
    $('bar').style.background=pct<=25?'#ef4444':pct<=50?'#eab308':'#22c55e';
    status('Live HP connected to GeezSheets.');
  },err=>status('Firebase HP read failed: '+err.message));
}
OBR.onReady(async()=>{
  try{
    if(!id)throw Error('No token selected');
    const items=await OBR.scene.items.getItems([id]);
    if(items.length!==1)throw Error('Token was not found');
    $('tokenName').textContent=items[0].name||'Character token';
    linkedId=items[0].metadata?.[KEY]||'';
    const snap=await get(ref(db,'characters/pcs'));
    if(!snap.exists())throw Error('No characters available in Firebase');
    const all=Object.entries(snap.val()).map(([charId,c])=>({id:charId,name:c?.name||c?.identity?.name||c?.basic?.name||'',type:c?.type,record_type:c?.record_type,campaign:c?.campaign})).filter(c=>c.name&&c.campaign!=='__oracle__'&&c.type!=='npc'&&c.record_type!=='npc');
    all.sort((a,b)=>a.name.localeCompare(b.name));
    characters=new Map(all.map(c=>[c.id,c]));
    const sel=$('character');sel.replaceChildren();
    const blank=new Option('No linked character','');sel.add(blank);
    for(const c of all)sel.add(new Option(c.name+(c.campaign?' — '+c.campaign:''),c.id));
    if(linkedId&&!characters.has(linkedId))sel.add(new Option('Previously linked: '+linkedId,linkedId));
    sel.value=linkedId||'';sel.disabled=false;ready=true;updateLinkButton();
    if(linkedId){displayCharacter(linkedId);status('Linked. HP updates live.');}
    else status('Choose a character and press Link.');
  }catch(e){status('Error: '+e.message);$('tokenName').textContent='Cannot load token';}
});
$('character').onchange=()=>{updateLinkButton();status($('character').value===linkedId?'No changes to save.':$('character').value?'Press Link to save this character to the token.':'Press Unlink to restore the token caption.');};
async function saveLink(chosen){
  if(!ready)return;
  ready=false;
  $('link').disabled=true;
  $('unlink').disabled=true;
  $('character').disabled=true;
  try{
    await OBR.scene.items.updateItems([id],items=>{for(const item of items){if(chosen)item.metadata[KEY]=chosen;else delete item.metadata[KEY];}});
    linkedId=chosen;$('character').value=chosen;displayCharacter(chosen);status(chosen?'Linked! Live HP is displayed above.':'Unlinked. The GM connection restores the token caption.');
  }catch(e){status('Link failed: '+e.message);}
  finally{ready=true;$('character').disabled=false;updateLinkButton();}
}
$('link').onclick=()=>{const chosen=$('character').value;if(chosen)return saveLink(chosen);};
$('unlink').onclick=()=>{if(linkedId)return saveLink('');};
window.addEventListener('pagehide',()=>unsubscribe?.());
