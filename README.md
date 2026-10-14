# GeezOwlbear v1.3 — live HP labels on the map

Replace **all the files** in the root of your `GeezOwlbear` GitHub Pages repository with these files.

Existing extension URL: `https://geezjonny.github.io/GeezOwlbear/manifest.json`

In Owlbear, select a character token and use its **GeezSheets HP** context menu. Choose a character and click **Link to this token** if not already linked. The GM's extension background page listens for Firebase changes under `characters/pcs/{characterId}/combat`. An `XX / YY HP` label is added to the map as an **attachment** to the token, and updates as HP changes in GeezSheets. Everyone in the scene can see the label. You do not need to leave the menu open after linking.

### Notes
- A **GM must have this extension installed and be in the scene** to create/update shared HP labels. This avoids several players racing to write the same labels.
- If you just updated GitHub Pages, fully reload Owlbear. You may need to remove and re-add the extension if Owlbear cached the background page.
- Existing character links remain usable. Unlinking/clearing token metadata removes the corresponding HP label when the GM's extension observes the change.
- Firebase reads require appropriate Firebase Database Rules. Protect private character data using Authentication and rules, not the fact that a web API key is public.
- The first live test should confirm the label's placement relative to your token size. It is offset by about 0.65 grid squares beneath the token center.
- This version has not been tested inside a live Owlbear room; it follows the documented SDK APIs.
