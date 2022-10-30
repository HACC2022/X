module.export({within:()=>within,withinMaxClamp:()=>withinMaxClamp});let mathMax,mathMin;module.link("./math.js",{max(v){mathMax=v},min(v){mathMin=v}},0);
function within(min, value, max) {
  return mathMax(min, mathMin(value, max));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}