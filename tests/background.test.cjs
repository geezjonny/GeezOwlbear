const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ID = 'io.github.geezjonny.geezowlbear';
const link = ID + '/characterId';
const original = ID + '/originalCaption';
function harness() {
  const token = {id:'token', type:'IMAGE', layer:'CHARACTER', name:'Thorin',
    text:{plainText:'Thorin',style:{fontSize:24}}, textItemType:'TEXT', metadata:{[link]:'a'}};
  let writes = 0, subscriptions = 0;
  const context = vm.createContext({ console, URL, initializeApp:()=>({}), getDatabase:()=>({}),
    ref:(_db,path)=>path, onValue:()=>{subscriptions++;return ()=>{};},
    OBR:{onReady:()=>{},scene:{items:{getItems:async()=>[token],
      updateItems:async(_ids,callback)=>{writes++;callback([token]);},deleteItems:async()=>{}}}} });
  const source = fs.readFileSync(require('node:path').join(__dirname,'../background.js'),'utf8')
    .replace(/^import .*;\r?\n/gm,'');
  vm.runInContext(source + '\ngm=true;',context);
  return {token,run:code=>vm.runInContext(code,context),writes:()=>writes,subscriptions:()=>subscriptions};
}

test('HP preserves styling, caption edits, and restores the edited caption on unlink',async()=>{
  const h=harness();
  await h.run("setCaption('token','a','12/20',0)");
  assert.equal(h.token.text.plainText,'Thorin · 12/20 HP');
  assert.equal(h.token.text.style.fontSize,24);
  h.token.text.plainText='Captain Thorin · 12/20 HP';
  await h.run("setCaption('token','a','10/20',0)");
  assert.equal(h.token.text.plainText,'Captain Thorin · 10/20 HP');
  delete h.token.metadata[link];
  await h.run("OBR.scene.items.getItems().then(items=>restoreUnlinkedCaption(items[0],0))");
  assert.equal(h.token.text.plainText,'Captain Thorin');
  assert.equal(h.token.textItemType,'TEXT');
  assert.equal(h.token.metadata[original],undefined);
});

test('stale scenes and old character callbacks cannot write or subscribe',async()=>{
  const h=harness();
  await h.run("setCaption('token','old-character','1/20',0)");
  h.run('stopScene()');
  await h.run("setCaption('token','a','1/20',0)");
  await h.run('OBR.scene.items.getItems().then(items=>reconcile(items,0))');
  assert.equal(h.writes(),0);
  assert.equal(h.subscriptions(),0);
});

test('restoration ignores a token relinked before the queued restore runs',async()=>{
  const h=harness();
  await h.run("setCaption('token','a','12/20',0)");
  await h.run('OBR.scene.items.getItems().then(items=>restoreUnlinkedCaption(items[0],0))');
  assert.equal(h.token.text.plainText,'Thorin · 12/20 HP');
});

test('v1.5 captions migrate without appending HP twice',async()=>{
  const h=harness();
  h.token.metadata[original]='Thorin';
  h.token.text.plainText='Thorin · 12/20 HP';
  await h.run("setCaption('token','a','10/20',0)");
  assert.equal(h.token.text.plainText,'Thorin · 10/20 HP');
});
