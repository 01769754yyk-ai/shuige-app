// 云同步工具：把数据自动上传到 Supabase
const SUPABASE_URL = 'https://pxxasqqitngbskfxbobt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGFzcXFpdG5nYnNrZnhib2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTY4NjYsImV4cCI6MjEwMjUzMjg2Nn0.-enHkG_nT5BAQAzp4RExrBmULYAVoiS5DpjfWP4mF7o';
const ALL_KEYS = ['tasks_v1', 'money_v1', 'diary_v1', 'countdown_v1', 'branches_v1', 'shuige:name', 'shuige:city'];

let lastUpload = 0;
export function autoUpload() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (now - lastUpload < 2000) return;
  lastUpload = now;
  const name = 'default';
  const data: any = {};
  ALL_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch { } });
  data.__savedAt = new Date().toISOString();
  const payload = { name, data: JSON.stringify(data) };
  fetch(SUPABASE_URL + '/rest/v1/user_data?name=eq.' + encodeURIComponent(name) + '&select=id', { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } })
    .then(r => r.json())
    .then((found) => {
      if (found && found.length > 0) {
        return fetch(SUPABASE_URL + '/rest/v1/user_data?id=eq.' + found[0].id, { method: 'PATCH', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ data: payload.data }) });
      } else {
        return fetch(SUPABASE_URL + '/rest/v1/user_data', { method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify(payload) });
      }
    })
    .catch((e) => { console.log('autoUpload error', e); });
}