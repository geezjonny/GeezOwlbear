# GeezOwlbear v1.5 — native token HP caption

**Fix:** Stop drawing separate, screen-sized HP labels. Instead, append HP to the **existing native Owlbear token name caption** (`Thorin · 32/45 HP`). This uses Owlbear's own label font and zoom behavior automatically.

## Install

Deploy `manifest.json`, `background.html`, `background.js`, `index.html`, `app.js`, `styles.css`, and `icon.svg` to GitHub Pages. Add the hosted manifest URL to Owlbear, then refresh the room as GM.

## Behavior

- Updates every linked IMAGE token's native name caption when Firebase HP changes.
- Preserves its original name, font-size, style, and other formatting.
- Removes GeezOwlbear's old standalone HP labels automatically.
- Restores the original caption if a token is unlinked.
- To unlink, press the separate **Unlink this token** button below Link. A connected GM client restores the caption.
- Caption edits made while linked are retained on subsequent HP updates and unlinking.
- Players and GMs can select a linked token, open **GeezSheets HP**, and press **Open sheet in Owlbear** to view its sheet in a 760 × 640 window. **Open in new tab** remains available. The linked character determines which sheet opens; player ownership is not inferred.
- Existing character links continue working; Firebase structure is unchanged.
- Non-IMAGE scene objects do not get native captions.

**Note:** Because HP shares the token's native name caption, it appears on the *same line* as the name, not on a separate line. This is intentional: both will now have identical sizing behavior. If other extensions edit that caption at the same time, they could conflict.

**Local checks:** Run `node --test tests/background.test.cjs`, `node --check app.js`, and `node --check background.js`. Regression tests cover caption edits and restoration, stale scene work, relinking guards, and v1.5 caption migration using mocked APIs.

**Live-room release checks (still required):**

- As GM, link a character token and change HP in GeezSheets; confirm the caption updates for both GM and player.
- Relink to another character; confirm changes to the former character no longer affect the token.
- Edit the caption while linked, update HP, then unlink; confirm the edited caption and its formatting survive.
- Switch scenes while HP updates arrive; confirm no captions or links leak between scenes.
- Delete a linked token, reload the room, and test missing combat data or denied Firebase reads.
- Confirm caption size and visibility at different zoom levels, and migration from old standalone HP labels.
- As a player, open a linked token's sheet inside Owlbear, check that GeezSheets loads and works when embedded, then close the window. Also check the new-tab option and smaller screens.

A connected GM client is required for shared caption synchronization. Test multiple GM clients if your room uses them. Firebase access rules and hosted deployment have not been validated by the local tests.
