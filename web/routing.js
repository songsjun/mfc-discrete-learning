export function routeFromHash(hash) {
  const path = hash.replace(/^#/, '');
  if (['','/','/path'].includes(path)) return {view:'path'};
  if (['/records','/about','/review'].includes(path)) return {view:path.slice(1)};
  const match = path.match(/^\/(lesson|review)\/(L\d{2}|B0[12])$/);
  return match ? {view:match[1],id:match[2]} : {view:'missing'};
}
