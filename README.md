# GeezOwlbear v1.5 — native token HP caption

**Fix:** Stop drawing separate, screen-sized HP labels. Instead, append HP to the **existing native Owlbear token name caption** (`Thorin · 32/45 HP`). This uses Owlbear's own label font and zoom behavior automatically.

## Install

Upload all **seven source files** to the root of `geezjonny/GeezOwlbear` on GitHub, replacing any existing copies. Commit to `main`, wait for Pages to deploy, then refresh the Owlbear room as GM.

## Behavior

- Updates every linked IMAGE token's native name caption when Firebase HP changes.
- Preserves its original name, font-size, style, and other formatting.
- Removes GeezOwlbear's old standalone HP labels automatically.
- Restores the original caption if a token is unlinked.
- Existing character links continue working; Firebase structure is unchanged.
- Non-IMAGE scene objects do not get native captions.

**Note:** Because HP shares the token's native name caption, it appears on the *same line* as the name, not on a separate line. This is intentional: both will now have identical sizing behavior. If other extensions edit that caption at the same time, they could conflict.

**Testing:** Files were checked locally for syntax and archive integrity. Owlbear live-room behavior still needs testing.
