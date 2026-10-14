# GeezOwlbear v1.2 — live Firebase HP

Upload the **contents** of this folder to the root of your `GeezOwlbear` GitHub Pages repository, replacing existing files.

Your Owlbear extension URL stays: `https://geezjonny.github.io/GeezOwlbear/manifest.json`.

After GitHub Pages finishes deploying, reload Owlbear (remove/re-add the extension if the background script is cached). Open a character token's GeezSheets HP context-menu entry. Select the character by name and press **Link to this token**. The popup displays live HP from Firebase at `characters/pcs/{id}/combat` and updates when the sheet changes. Existing links from the previous versions remain supported.

**Note:** v1.2 shows HP in the token's GeezSheets popup, **not as an overlay permanently painted on the token**. It reads Firebase, it does not change HP. The ability to read characters depends on your Firebase Database Rules; if reads are denied, the popup shows an error. Protect character data with appropriate Firebase Authentication and rules before exposing it to players. The Firebase web API key is public app configuration, not an admin secret.
