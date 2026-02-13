const api = (path, opts={}) => fetch(path, opts).then(r => r.json());

let token = null;

document.getElementById('register').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const result = await api('/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
  if (result.token) { token = result.token; document.getElementById('token').textContent = 'Token: ' + token; }
  else alert(JSON.stringify(result));
}

document.getElementById('login').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const result = await api('/api/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
  if (result.token) { token = result.token; document.getElementById('token').textContent = 'Token: ' + token; }
  else alert(JSON.stringify(result));
}

document.getElementById('create').onclick = async () => {
  const name = document.getElementById('sitename').value;
  const html = document.getElementById('html').value;
  const result = await api('/api/site/create', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ name, html }) });
  document.getElementById('siteInfo').textContent = JSON.stringify(result);
}

document.getElementById('publish').onclick = async () => {
  const info = document.getElementById('siteInfo').textContent;
  if (!info) return alert('Create a site first');
  const parsed = JSON.parse(info);
  const result = await api('/api/site/publish', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ siteId: parsed.siteId }) });
  if (result.publicUrl) {
    const url = result.publicUrl;
    document.getElementById('siteInfo').innerHTML = 'Published to: <a href="'+url+'" target="_blank">'+url+'</a>';
  } else alert(JSON.stringify(result));
}

document.getElementById('checkDomain').onclick = async () => {
  const domain = document.getElementById('domain').value;
  const result = await api('/api/namecom/check', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ domain }) });
  document.getElementById('domainResult').textContent = JSON.stringify(result);
}

document.getElementById('registerDomain').onclick = async () => {
  const domain = document.getElementById('domain').value;
  const result = await api('/api/namecom/register', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ domain, years: 1 }) });
  document.getElementById('domainResult').textContent = JSON.stringify(result);
}
