export const CONDITIONS = ['Blinded','Charmed','Deafened','Exhaustion','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious'];

export function adjustHp(combat, delta) {
  if (!combat || !Number.isSafeInteger(delta)) return;
  const current = Number(combat.hp_current), max = Number(combat.hp_max);
  if (!Number.isFinite(current) || !Number.isFinite(max) || max < 0) return;
  return {...combat, hp_current: Math.max(0, Math.min(max, current + delta))};
}

export function setCondition(combat, condition, enabled) {
  if (!combat || !CONDITIONS.includes(condition)) return;
  if (combat.conditions != null && !Array.isArray(combat.conditions)) return;
  const conditions = (combat.conditions || []).filter(value => typeof value !== 'string' || value.toLowerCase() !== condition.toLowerCase());
  if (enabled) conditions.push(condition);
  return {...combat, conditions};
}
