# GeezOwlbear — first working prototype

A tiny Owlbear Rodeo extension that links a CHARACTER-layer token to a GeezSheets character ID.

## Install

1. Create a public GitHub repository named `GeezOwlbear` under `geezjonny`.
2. Upload `index.html`, `manifest.json`, and `icon.svg` to the repository root.
3. In GitHub Settings → Pages, deploy from the `main` branch, root folder.
4. Check `https://geezjonny.github.io/GeezOwlbear/manifest.json` in a browser.
5. Add that manifest URL as a custom extension in Owlbear Rodeo (Extensions → Add / Install custom extension).
6. In a scene, select ONE token on the CHARACTER layer; click GeezSheets; click Refresh selection.
7. Paste the character ID used in `sheet.html?char=ID`, then click Link character to token.
8. Click Open character sheet. The sheet opens in a new browser tab and retains its existing Firebase implementation.

## Scope

This first version does **not** directly read Firebase or display HP inside Owlbear. It persists a character ID in the selected token's Owlbear metadata and opens the existing Firebase-backed sheet.

Security note: the character ID is a locator, not an authorization mechanism. Do not place secrets in token metadata or the public repo.
