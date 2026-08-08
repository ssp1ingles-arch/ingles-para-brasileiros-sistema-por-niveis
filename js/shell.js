(() => {
  const root = location.pathname.includes('/niveis/') ? '../../' : '';
  const redesign = document.createElement('link'); redesign.rel = 'stylesheet'; redesign.href = root + 'css/redesign.css'; document.head.append(redesign); const fixes=document.createElement('link');fixes.rel='stylesheet';fixes.href=root+'css/redesign-fixes.css';document.head.append(fixes);
  const current = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const items = [
    ['index.html', 'Início'], ['jornada.html', 'Jornada'], ['index.html#niveis', 'Níveis'],
    ['praticar.html', 'Praticar'], ['estudar.html', 'Revisar'],
    ['estudar.html?origem=favoritos', 'Favoritos'], ['estudar.html#progresso', 'Progresso']
  ];
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Navegação principal');
  nav.innerHTML = `<a class="brand" href="${root}index.html" aria-label="Inglês para Brasileiros — início"><span aria-hidden="true">IB</span><strong>Inglês para Brasileiros</strong></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-menu"><span aria-hidden="true">☰</span><span class="sr-only">Abrir menu</span></button><div class="nav-links" id="main-menu">${items.map(([href,label])=>`<a href="${root}${href}"${href.startsWith(current)?' aria-current="page"':''}>${label}</a>`).join('')}</div>`;
  document.body.insertBefore(nav, document.body.firstChild);
  nav.querySelector('a[href*="estudar.html"]')?.classList.add('study-entry');nav.querySelector('a[href*="jornada.html"]')?.classList.add('journey-entry');nav.querySelector('a[href*="praticar.html"]')?.classList.add('practice-entry');
  const toggle = nav.querySelector('.menu-toggle');
  const links = nav.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('open', !open);
    toggle.querySelector('.sr-only').textContent = open ? 'Abrir menu' : 'Fechar menu';
  });
  links.addEventListener('click', () => { toggle.setAttribute('aria-expanded','false'); links.classList.remove('open'); });
  const friendlyOptions=()=>document.querySelectorAll('option').forEach(o=>{if(/^(a1|a2|b1|b2|c1|c2|kids)-/i.test(o.textContent)){o.textContent=o.textContent.replace(/^(a1|a2|b1|b2|c1|c2|kids)-/i,'').replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}});friendlyOptions();new MutationObserver(friendlyOptions).observe(document.body,{childList:true,subtree:true});
})();
