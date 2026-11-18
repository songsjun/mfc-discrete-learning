export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const dateLabel = timestamp => { const date=new Date(timestamp); return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(date) : '时间未知'; };
export const lines = text => String(text).split('\n').filter(Boolean).map(line => `<p>${escapeHTML(line)}</p>`).join('');
