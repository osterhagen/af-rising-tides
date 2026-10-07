# Avery Dennison — Agentforce Field Lab

A self-contained, interactive workshop guide for a full-day Agentforce Coworker / Sales / Service developer hackathon.

## Publish with GitHub Pages

1. Copy `index.html` and the `assets/` folder into the **root** of your workshop GitHub repository. Keep the paths unchanged.
2. Commit and push the changes.
3. In the GitHub repository, open **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder, then **Save**.
5. Open the URL GitHub provides, usually `https://<owner>.github.io/<repo>/`.

You can also open `index.html` locally; it requires no server, build step, JavaScript framework, external CSS library, fonts, API keys, or external network access for its core UI. Official documentation links need internet access.

**Important:** GitHub Pages access and visibility depend on your organization/plan. Do not publish confidential Avery Dennison data, sandbox addresses, credentials, customer records, or proprietary implementation details in a public site. The guide's examples use generic placeholders.

## Interactive elements

- Expand/collapse all seven workshop stages.
- Sticky navigation with stage completion indicators.
- Persistent local checklist progress (`localStorage`).
- Save workshop notes locally and export a `.md` summary. No backend or cloud sync.
- Six-tab architecture pattern chooser, with keyboard-accessible tabs.
- Copyable CLI commands and Gemini prompts.
- Light/dark mode and a responsive mobile navigation panel.

## Workshop content

- 09:00–10:15: Discover / Decide
- 10:15–12:00: Understand / Develop
- 12:00–13:00: Lunch
- 13:00–14:45: Build Sprint
- 14:45–15:00: Break
- 15:00–16:00: Break, Test, Observe
- 16:00–16:30: Team Readouts

Stage reading/reference time: approximately 5–10 minutes each, separate from the exercise time.

## Operational assumptions

The repository that hosts this page should also provide a maintained `INSTALL.md`, `GEMINI.md`, `scripts/preflight.sh`, and a Salesforce DX project. Those files are referenced but are **not created by this website package**. The site does not run or validate any Salesforce command; it is an instructional aid.

Each team must be assigned a unique authoring bundle and isolated test records in the approved Salesforce sandbox. Validate permissions and org-specific availability of Testing Center and Observability before the event.

## Review before the workshop

- Confirm exact sandbox alias and names of the team's authoring bundles.
- Verify examples with the versions of Salesforce CLI and Gemini installed on Avery laptops.
- Use Salesforce's current Agent Script documentation and ensure local skill/docs are up to date.
- Test MCP from a managed laptop and configure approved Gemini enterprise auth.
- Make sure test cases can be run without affecting other teams.
- Confirm GitHub Pages visibility and company policy.

## Files

```
index.html
assets/styles.css
assets/app.js
README.md
.nojekyll
```

No trackers, analytics, cookies, CDN dependencies, or third-party JavaScript are included.
