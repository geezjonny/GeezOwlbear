import OBR from 'https://esm.sh/@owlbear-rodeo/sdk@2';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js';
const BASE = 'https://geezjonny.github.io/GeezOwlbear/';
const ID = 'io.github.geezjonny.geezowlbear';
const LINK = ID+'/characterId';
const OLD_HP_LABEL_MARK = `${ID}/hpLabelFor`;
const ORIGINAL_CAPTION_KEY = `${ID}/originalCaption`;
const ORIGINAL_CAPTION_TYPE_KEY = `${ID}/originalCaptionType`;
// HP is displayed in the token's OWN caption rather than a separate LABEL item.
// Owlbear controls its font size and zoom behavior exactly like the token name.
const config = {apiKey:'AIzaSyCJrkcYjFjyyx5UNA9FUaCIlCvxxOYabis',
  authDomain:'geezsheets.firebaseapp.com',
  databaseURL:'https://geezsheets-default-rtdb.firebaseio.com',
  projectId:'geezsheets',
  storageBucket:'geezsheets.firebasestorage.app',
  messagingSenderId:'57811286242',
  appId:'1:57811286242:web:cd9cac596acdb355a2c6bb'
};
const db = getDatabase(initializeApp(config));
let unsubscribeItems = null;
let watchers = new Map(); // tokenId -> { characterId, unsubscribe }
let processing = Promise.resolve();
let sceneGeneration = 0;
let gm = false;

function logError(error) {
  console.error('[GeezSheets HP]', error);
}

function enqueue(task) {
  processing = processing.then(task, task).catch(logError);
}

function stopWatchers() {
  for (const watcher of watchers.values()) watcher.unsubscribe();
  watchers.clear();
}

function stopScene() {
  sceneGeneration++;
  unsubscribeItems?.();
  unsubscribeItems = null;
  stopWatchers();
  processing = Promise.resolve();
}

function hpText(combat) {
  if (!combat) return '—';
  const current = Number(combat.hp_current);
  const max = Number(combat.hp_max);
  if (!Number.isFinite(current) || !Number.isFinite(max)) return '—';
  return `${current}/${max}`;
}

async function clearOldLabels(items) {
  const ids = items
    .filter(item => item.metadata?.[OLD_HP_LABEL_MARK])
    .map(item => item.id);
  if (ids.length) await OBR.scene.items.deleteItems(ids);
}

async function setCaption(tokenId, hp, generation) {
  if (generation !== sceneGeneration || !gm) return;
  const items = await OBR.scene.items.getItems([tokenId]);
  if (generation !== sceneGeneration) return;
  const token = items[0];
  if (!token || token.type !== 'IMAGE' || !token.metadata?.[LINK]) return;

  // Remember the original native caption once, before any HP is appended.
  const hasOriginal = Object.prototype.hasOwnProperty.call(
    token.metadata, ORIGINAL_CAPTION_KEY
  );
  const original = hasOriginal
    ? token.metadata[ORIGINAL_CAPTION_KEY]
    : (token.text?.plainText || token.name || 'Character');
  const nextCaption = `${original} · ${hp} HP`;
  if (token.text?.plainText === nextCaption && hasOriginal) return;

  await OBR.scene.items.updateItems([tokenId], drafts => {
    for (const draft of drafts) {
      if (draft.type !== 'IMAGE' || !draft.metadata?.[LINK]) continue;
      if (!Object.prototype.hasOwnProperty.call(draft.metadata, ORIGINAL_CAPTION_KEY)) {
        draft.metadata[ORIGINAL_CAPTION_KEY] = original;
        draft.metadata[ORIGINAL_CAPTION_TYPE_KEY] = draft.textItemType;
      }
      draft.text.plainText = nextCaption;
      draft.textItemType = 'LABEL';
      // Deliberately leave text.style unchanged: native sizing is the goal.
    }
  });
}

async function restoreUnlinkedCaption(token) {
  if (token.type !== 'IMAGE') return;
  if (!Object.prototype.hasOwnProperty.call(token.metadata || {}, ORIGINAL_CAPTION_KEY)) return;
  await OBR.scene.items.updateItems([token.id], drafts => {
    for (const draft of drafts) {
      draft.text.plainText = draft.metadata[ORIGINAL_CAPTION_KEY];
      if (draft.metadata[ORIGINAL_CAPTION_TYPE_KEY]) {
        draft.textItemType = draft.metadata[ORIGINAL_CAPTION_TYPE_KEY];
      }
      delete draft.metadata[ORIGINAL_CAPTION_KEY];
      delete draft.metadata[ORIGINAL_CAPTION_TYPE_KEY];
    }
  });
}

async function reconcile(items) {
  if (!gm) return;
  const generation = sceneGeneration;

  // Remove the huge HP objects from older GeezOwlbear versions.
  await clearOldLabels(items);

  const linked = new Map(items
    .filter(item => item.layer === 'CHARACTER' &&
      item.type === 'IMAGE' &&
      typeof item.metadata?.[LINK] === 'string' && item.metadata[LINK])
    .map(item => [item.id, item.metadata[LINK]]));

  for (const [tokenId, entry] of watchers) {
    if (linked.get(tokenId) !== entry.characterId) {
      entry.unsubscribe();
      watchers.delete(tokenId);
    }
  }

  for (const item of items) {
    if (item.metadata?.[ORIGINAL_CAPTION_KEY] !== undefined && !linked.has(item.id)) {
      await restoreUnlinkedCaption(item);
    }
  }

  for (const [tokenId, characterId] of linked) {
    if (watchers.has(tokenId)) continue;
    const entry = { characterId, unsubscribe: () => {} };
    watchers.set(tokenId, entry);
    entry.unsubscribe = onValue(
      ref(db, `characters/pcs/${characterId}/combat`),
      snapshot => {
        const hp = hpText(snapshot.val());
        enqueue(() => setCaption(tokenId, hp, generation));
      },
      error => {
        logError(error);
        enqueue(() => setCaption(tokenId, 'unavailable', generation));
      }
    );
  }
}

async function startScene(){
 stopScene();
 if(!gm||!await OBR.scene.isReady())return;
 const generation=sceneGeneration;
 unsubscribeItems=OBR.scene.items.onChange(items=>{enqueue(()=>reconcile(items));});
 const items=await OBR.scene.items.getItems();
 if(generation===sceneGeneration)enqueue(()=>reconcile(items));
}
OBR.onReady(async()=>{
 await OBR.contextMenu.create({
   id:ID+'/character-menu',
   icons:[{icon:BASE+'icon.svg',label:'GeezSheets HP',filter:{every:[{key:'layer',value:'CHARACTER'}]}}],
   every:[{key:'layer',value:'CHARACTER'}],
   onClick:async(context,elementId)=>{
     if(context.items.length!==1)return;
     const url=new URL(BASE+'index.html');url.searchParams.set('token',context.items[0].id);
     await OBR.popover.open({id:ID+'/link-popover',url:url.href,width:360,height:390,anchorElementId:elementId});
   }
 });
 // One writer (the GM) manages shared scene labels. Players still see them.
 gm=(await OBR.player.getRole())==='GM';
 if(gm){
   await startScene();
   OBR.scene.onReadyChange(ready=>{if(ready)startScene().catch(logError);else stopScene();});
 }
});
