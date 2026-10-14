# GeezOwlbear v1.4 — compact HP labels

Upload all five files to the root of your existing GitHub Pages `GeezOwlbear` repository and wait for Pages to redeploy. Refresh Owlbear with the GM account in the scene.

Changes:
- HP displays as `38/39` with **12px screen-space** text and 2px padding, rather than a giant label proportional to the map's DPI.
- Labels appear below a standard one-cell token rather than overlapping its portrait.
- **Existing** v1.3 HP labels are restyled and repositioned automatically on the next Firebase callback / scene startup; no relinking needed.
- Firebase synchronization and token menu still work as before.

Note: labels remain a constant on-screen size when zooming (that's Owlbear's native label behavior). Very small zoom levels can still make them seem comparatively large. This version has not been tested inside your live Owlbear scene.
