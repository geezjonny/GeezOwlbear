import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adjustHp,setCondition} from '../combat.mjs';

test('damage and healing clamp HP and preserve other combat fields',()=>{
  const combat={hp_current:10,hp_max:20,temp_hp:4,conditions:['Prone']};
  assert.equal(adjustHp(combat,-50).hp_current,0);
  assert.equal(adjustHp(combat,50).hp_current,20);
  assert.equal(adjustHp(combat,-3).hp_current,10);
  assert.equal(adjustHp(combat,-3).temp_hp,1);
  assert.deepEqual(adjustHp(combat,-3).conditions,['Prone']);
  assert.equal(combat.hp_current,10);
});
test('temporary HP absorbs damage first and is untouched by healing',()=>{
  const combat={hp_current:10,hp_max:20,temp_hp:4};
  assert.deepEqual(adjustHp(combat,-4),{hp_current:10,hp_max:20,temp_hp:0});
  assert.deepEqual(adjustHp(combat,-6),{hp_current:8,hp_max:20,temp_hp:0});
  assert.deepEqual(adjustHp(combat,5),{hp_current:15,hp_max:20,temp_hp:4});
  assert.equal(adjustHp({hp_current:10,hp_max:20},-3).temp_hp,undefined);
  assert.equal(adjustHp({hp_current:10,hp_max:20,temp_hp:'bad'},-3).hp_current,7);
});
test('invalid or missing HP data aborts changes',()=>{
  for(const combat of [null,{}, {hp_current:'bad',hp_max:20}])assert.equal(adjustHp(combat,1),undefined);
  assert.equal(adjustHp({hp_current:1,hp_max:2},1.5),undefined);
});
test('conditions preserve unknown values and remove duplicates regardless of case',()=>{
  const combat={hp_current:10,conditions:['prone','Blessed']};
  assert.deepEqual(setCondition(combat,'Prone',true).conditions,['Blessed','Prone']);
  assert.deepEqual(setCondition(combat,'Prone',false).conditions,['Blessed']);
  assert.deepEqual(setCondition({hp_current:10},'Poisoned',true).conditions,['Poisoned']);
  assert.equal(setCondition(combat,'Unknown',true),undefined);
  assert.equal(setCondition({conditions:{bad:true}},'Prone',true),undefined);
});
