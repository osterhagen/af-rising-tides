from playwright.sync_api import sync_playwright
from pathlib import Path
base=Path('/mnt/data/avery-agentforce-workshop-site')
html=(base/'index.html').read_text().replace('<link rel="stylesheet" href="assets/styles.css">','').replace('<script src="assets/app.js" defer></script>','')
css=(base/'assets/styles.css').read_text(); js=(base/'assets/app.js').read_text()
with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for w,h in [(320,740),(390,844),(768,900),(1024,900),(1440,850)]:
    page=browser.new_page(viewport={'width':w,'height':h})
    errs=[];page.on('pageerror',lambda exc:errs.append(str(exc)))
    page.set_content(html);page.add_style_tag(content=css);page.add_script_tag(content=js)
    for stage in ['ready','discover','decide','understand','build','test','observe']:
      page.locator('#stage-'+stage).evaluate('(el)=>el.open=true')
    page.wait_for_timeout(50)
    overflow=page.evaluate('document.documentElement.scrollWidth - innerWidth')
    clip=page.evaluate('Array.from(document.querySelectorAll(".stage, .stage-content, .diagram-frame")).filter(el => el.getBoundingClientRect().width > innerWidth+8).map(el=>el.className).slice(0,4)')
    print('WIDTH',w,'overflow px',overflow,'errors',errs,'wide elements',clip)
    if w==1440:
      page.locator('#theme-toggle').click()
      page.screenshot(path=str(base/'dark-mode.png'))
    page.close()
  browser.close()
