# GeezOwlbear v1.1

Replaces the top toolbar UI with an Owlbear token context-menu item.

## Install/update
1. Upload `manifest.json`, `background.html`, `index.html`, and `icon.svg` to the root of the `GeezOwlbear` GitHub Pages repository, replacing files with the same name.
2. Keep the same extension URL: `https://geezjonny.github.io/GeezOwlbear/manifest.json`.
3. Reload Owlbear Rodeo after GitHub Pages deploys. If the menu doesn't appear, disable/re-enable or remove/re-add the extension to refresh its manifest.
4. Select **one character token** and find **GeezSheets Link** in the token's context menu. A small popover opens next to the token menu.
5. Enter the character ID once. Future clicks show an **Open character sheet** link. Existing links saved by v1 are retained because the metadata key is unchanged.

This version intentionally doesn't use Firebase directly: the existing GeezSheets page loads its own character data from Firebase. A true Firebase-backed character picker can be added once the existing app's character listing/auth flow is inspected.
