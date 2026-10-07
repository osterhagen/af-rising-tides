from playwright.sync_api import sync_playwright
from pathlib import Path
base = Path('/mnt/data/avery-agentforce-workshop-site')
html = (base/'index.html').read_text()
css = (base/'assets/styles.css').read_text()
js = (base/'assets/app.js').read_text()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    for name, viewport in [('desktop', {'width': 1440, 'height': 1000}), ('mobile', {'width': 390, 'height': 844})]:
        page=browser.new_page(viewport=viewport, device_scale_factor=1, accept_downloads=True)
        errors=[]
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.set_content(html.replace('<link rel="stylesheet" href="assets/styles.css">','').replace('<script src="assets/app.js" defer></script>',''))
        page.add_style_tag(content=css)
        page.add_script_tag(content=js)
        page.wait_for_timeout(200)
        print(name, 'title', page.title(), 'tasks', page.locator('[data-task]').count(), 'horizontal overflow?', page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), 'errors', errors)
        page.screenshot(path=f'/mnt/data/avery-agentforce-workshop-site/{name}.png', full_page=False)
        if name=='desktop':
            page.locator('[data-task="ready1"]').check()
            assert '1 / 21' in page.locator('#progress-small').inner_text()
            # localStorage is unavailable in about:blank context; persistence is covered by storage assertions in production browser
            page.locator('[data-stage-link="decide"]').click()
            assert page.locator('#stage-decide').get_attribute('open') is not None
            page.locator('[data-pattern="connected"]').click()
            assert 'specialist agent' in page.locator('#pattern-title').inner_text().lower()
            page.locator('#notes-decide').fill('Architecture decision test note')
            page.locator('#export-main').click()
            with page.expect_download() as dl:
                page.locator('#export-main').click()
            download=dl.value
            assert download.suggested_filename.endswith('.md')
            page.locator('#reset-progress').click(); page.locator('#confirm-reset').click()
            assert page.locator('[data-task="ready1"]').is_checked() == False
            print('desktop interactions PASS; download', download.suggested_filename)
            page.locator('#stage-decide').scroll_into_view_if_needed();page.screenshot(path='/mnt/data/avery-agentforce-workshop-site/desktop-stage.png', full_page=False)
        else:
            page.locator('#menu-toggle').click()
            assert 'show' in page.locator('#side-nav').get_attribute('class')
            page.locator('[data-stage-link="understand"]').click()
            assert page.locator('#stage-understand').get_attribute('open') is not None
            print('mobile nav PASS')
            page.wait_for_timeout(250)
            page.screenshot(path='/mnt/data/avery-agentforce-workshop-site/mobile-stage.png', full_page=False)
        page.close()
    browser.close()
