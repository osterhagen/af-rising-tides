(() => {
  'use strict';
  const PREFIX = 'avery-agentforce-fieldlab-v1:';
  const stages = ['ready','discover','decide','understand','build','test','observe'];
  const allTasks = Array.from(document.querySelectorAll('[data-task]'));
  const notes = Array.from(document.querySelectorAll('[data-note]'));
  const extraFields = Array.from(document.querySelectorAll('[data-note-field]'));
  const $ = (id) => document.getElementById(id);
  let toastTimer;

  const store = {
    get(k) { try { return localStorage.getItem(PREFIX + k); } catch { return null; } },
    set(k,v) { try { localStorage.setItem(PREFIX + k, v); } catch {} },
    remove(k) { try { localStorage.removeItem(PREFIX + k); } catch {} }
  };
  function toast(msg) {
    const el = $('toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }
  function setActiveStage(stage) {
    document.querySelectorAll('[data-stage-link]').forEach(a => {
      const isActive = a.dataset.stageLink === stage;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
    });
  }
  function progress() {
    const complete = allTasks.filter(input => input.checked).length;
    const max = allTasks.length;
    const pct = Math.round((complete / max) * 100);
    $('progress-small').textContent = `${complete} / ${max}`;
    $('mini-progress').style.width = pct + '%';
    $('sidebar-pct').textContent = pct + '%';
    $('sidebar-bar').style.width = pct + '%';
    stages.forEach(stage => {
      const stageTasks = allTasks.filter(t => t.dataset.task.startsWith(stage));
      const n = stageTasks.filter(t=>t.checked).length;
      document.querySelector(`[data-completion="${stage}"]`).textContent = `${n}/${stageTasks.length}`;
      document.querySelector(`[data-stage-dot="${stage}"]`).classList.toggle('done', n === stageTasks.length);
    });
  }
  allTasks.forEach(input => {
    input.checked = store.get('task:' + input.dataset.task) === 'true';
    input.addEventListener('change', () => {store.set('task:' + input.dataset.task, input.checked ? 'true' : 'false'); progress();});
  });
  progress();
  [...notes, ...extraFields].forEach(input => {
    const key = input.dataset.note || input.dataset.noteField;
    input.value = store.get('note:' + key) || '';
    input.addEventListener('input', () => store.set('note:' + key, input.value));
  });

  function showStage(stage) {
    const node = $('stage-' + stage);
    if (!node) return;
    node.open = true;
    setActiveStage(stage);
    node.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    $('side-nav').classList.remove('show'); $('menu-toggle').setAttribute('aria-expanded','false');
  }
  document.querySelectorAll('[data-stage-link]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); const id = a.dataset.stageLink; showStage(id); history.replaceState(null,'','#stage-' + id); });
  });
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => showStage(button.dataset.next)));
  $('start-button').addEventListener('click', () => showStage('ready'));
  $('readout-next').addEventListener('click', () => $('readout').scrollIntoView({behavior:'smooth'}));
  $('expand-all').addEventListener('click', () => document.querySelectorAll('details.stage').forEach(d=>d.open=true));
  $('collapse-all').addEventListener('click', () => document.querySelectorAll('details.stage').forEach(d=>d.open=false));
  document.querySelectorAll('details.stage').forEach(d => d.addEventListener('toggle', () => { if(d.open) setActiveStage(d.dataset.stage); }));
  if (location.hash.startsWith('#stage-')) { const stage = location.hash.replace('#stage-',''); if(stages.includes(stage)) {setTimeout(() => showStage(stage), 10);} }
  $('menu-toggle').addEventListener('click', () => {const side=$('side-nav');const open=side.classList.toggle('show');$('menu-toggle').setAttribute('aria-expanded',String(open));});
  document.addEventListener('keydown',e => {if(e.key==='Escape' && $('side-nav').classList.contains('show')) { $('side-nav').classList.remove('show'); $('menu-toggle').setAttribute('aria-expanded','false');}});
  document.addEventListener('click', e => {const side=$('side-nav');if(side.classList.contains('show') && !side.contains(e.target) && !$('menu-toggle').contains(e.target)) {side.classList.remove('show');$('menu-toggle').setAttribute('aria-expanded','false');}});

  const themes=['light','dark'];
  function applyTheme(mode) {
    document.documentElement.dataset.theme=mode;
    $('theme-toggle').setAttribute('aria-label',mode==='dark'?'Switch to light mode':'Switch to dark mode');
    $('theme-toggle').querySelector('svg').innerHTML = mode === 'dark'
      ? '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
      : '<path d="M20 14a8 8 0 0 1-10-10 8.3 8.3 0 1 0 10 10Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
  }
  applyTheme(store.get('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  $('theme-toggle').addEventListener('click',()=>{const next=themes.find(t=>t!==document.documentElement.dataset.theme)||'light';applyTheme(next);store.set('theme',next);});

  const patterns = {
    reuse:{title:'Reuse an existing capability',desc:'A supported Salesforce or enterprise capability already satisfies the job. Avoid duplicate AI workflows.',good:'Standard record summarization, research, or an existing action.',caution:'Missing domain-specific rules or authorization boundaries.',example:'Use an existing summary capability instead of creating another agent.',kicker:'PATTERN 01 · START HERE'},
    automation:{title:'Use deterministic automation',desc:'The requirement is a known rule with repeatable behavior. Flow, Apex, or an integration can enforce it reliably.',good:'When a specific condition is met, always update the same field according to a fixed rule.',caution:'Do not introduce model reasoning when the logic should be deterministic.',example:'Set a priority field automatically when exact case conditions are met.',kicker:'PATTERN 02 · PREDICTABLE RULE'},
    action:{title:'Add an action to an existing agent',desc:'The existing agent understands the task but needs a bounded tool to read, calculate, or write.',good:'Call a Flow, Apex method, approved API, or prompt template with clear inputs and outputs.',caution:'Ambiguous tool descriptions, unchecked inputs, or insufficient user permissions.',example:'Add an action for retrieving order status from an approved service.',kicker:'PATTERN 03 · EXTEND CAPABILITY'},
    subagent:{title:'Create an internal subagent',desc:'A distinct, coherent job belongs within the same agent and its existing user/ownership boundary.',good:'Opportunity management and meeting follow-up jobs within a Sales specialist agent.',caution:'Avoid a new subagent for every field or one-step action.',example:'Give a Sales agent a focused meeting follow-up subagent.',kicker:'PATTERN 04 · SAME AGENT'},
    connected:{title:'Connect a specialist agent',desc:'An independent domain or team needs its own agent lifecycle, behavior, tools, or boundaries.',good:'Coworker delegates Sales work to a Sales agent and Service work to a Service agent.',caution:'Overlapping responsibility, router ambiguity, control handoff, and latency.',example:'Connect the Service specialist so Coworker remains the employee entry point.',kicker:'PATTERN 05 · MULTI-AGENT'},
    standalone:{title:'Design a standalone agent',desc:'A distinct audience, channel, or lifecycle genuinely benefits from a separately deployed experience.',good:'A separate partner-facing or customer-facing experience with its own access boundary.',caution:'New operations, governance, security, and duplicated capabilities.',example:'An external partner agent with separate channels and permissions.',kicker:'PATTERN 06 · DISTINCT EXPERIENCE'}
  };
  const patternTabs = Array.from(document.querySelectorAll('[data-pattern]'));
  function setPattern(key, focus=false) {
    const p=patterns[key]; if(!p) return;
    patternTabs.forEach(t=>{const active=t.dataset.pattern===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;if(active && focus)t.focus();});
    $('arch-panel').setAttribute('aria-labelledby','arch-tab-'+key);
    $('pattern-title').textContent=p.title; $('pattern-desc').textContent=p.desc;
    $('pattern-good').textContent=p.good; $('pattern-caution').textContent=p.caution; $('pattern-example').textContent=p.example;
    $('arch-panel').querySelector('.panel-kicker').textContent=p.kicker;
  }
  patternTabs.forEach((button,index) => {
    button.addEventListener('click',()=>setPattern(button.dataset.pattern));
    button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%patternTabs.length;if(e.key==='ArrowLeft')next=(index-1+patternTabs.length)%patternTabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=patternTabs.length-1;if(next!==undefined){e.preventDefault();setPattern(patternTabs[next].dataset.pattern,true);}});
  });

  async function copyText(str) {
    if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(str);return;}
    const ta=document.createElement('textarea');ta.value=str;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw new Error('Clipboard unavailable');
  }
  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
    const el=$(btn.dataset.copy);if(!el)return;
    try {await copyText(el.innerText.replace(/\u00a0/g,' '));const old=btn.textContent;btn.textContent='Copied ✓';toast('Copied to clipboard');setTimeout(()=>btn.textContent=old,1600);}
    catch{toast('Clipboard blocked — select and copy the snippet manually');}
  }));

  function exportMarkdown() {
    const when=new Date().toLocaleString();
    const lines=[
      '# Avery Dennison · Agentforce Field Lab',
      '',`Exported: ${when}`,'','## My team',
      extraFields.find(e=>e.dataset.noteField==='team')?.value.trim() || '_Not specified_',
      '','## Checkpoint progress',
    ];
    stages.forEach((stage,i) => {
      const title=document.querySelector(`[data-stage="${stage}"] .stage-title-wrap>strong`)?.textContent || stage;
      lines.push('',`### ${String(i+1).padStart(2,'0')}. ${title}`);
      allTasks.filter(t=>t.dataset.task.startsWith(stage)).forEach(t=>{
        const label=t.closest('label')?.innerText.trim() || t.dataset.task;
        lines.push(`- [${t.checked?'x':' '}] ${label}`);
      });
      const note=notes.find(n=>n.dataset.note===stage)?.value.trim();
      if(note)lines.push('','**Notes**','',note);
    });
    lines.push('','---','Exported from a static page. Review notes before sharing; do not include confidential data.');
    const blob=new Blob([lines.join('\n')+'\n'],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='avery-agentforce-workshop-notes.md';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Workshop notes exported');
  }
  $('export-notes').addEventListener('click',exportMarkdown);
  $('export-main').addEventListener('click',exportMarkdown);
  $('reset-progress').addEventListener('click',()=>$('reset-dialog').showModal());
  $('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
  $('confirm-reset').addEventListener('click',()=>{
    allTasks.forEach(t=>{t.checked=false;store.remove('task:'+t.dataset.task);});
    [...notes,...extraFields].forEach(t=>{t.value='';store.remove('note:'+(t.dataset.note||t.dataset.noteField));});
    progress();$('reset-dialog').close();toast('Local progress and notes cleared');
  });
})();
