# Visual spec — Agent Ledger

Everything in `assets/` is generated from SVG by `scripts/render-assets.ps1`.
Edit the SVG, re-run, get the PNG. No Canva, no image generator, no fonts to
install — it renders with Segoe UI, which ships with Windows.

---

## Files

| File | Size | Used for |
|---|---|---|
| `avatar.png` | 400×400 | profile picture |
| `banner.png` | 1500×500 | profile header |
| `card-octoverse.svg/.png` | 1600×900 | post image, post #3, thread 01 |
| `card-cursor.svg/.png` | 1600×900 | post image, post #2 |
| `card-763b.svg/.png` | 1600×900 | post image, post #13, thread 3 |
| `card-webgpu.svg/.png` | 1600×900 | post image, post #18 |

X's limits: avatar ≤2 MB, banner ≤5 MB, both PNG/JPG. All well under.

---

## Palette

```
#0B0D10   base (near-black)
#F2F4F7   primary text
#8A94A6   secondary text
#5C6577   tertiary / metadata
#4ADE80   accent — the only saturated colour in the system
```

One accent, used sparingly. Measured on the PNGs: 9.55% of the avatar's pixels
at 400×400, 7.91% after downscaling to 32×32 (that is the number that matters —
the avatar is only ever seen small), 0.88% of the banner, and on a card never
more than one element. This is deliberate: the timeline
is loud, so the account reads as calm.

## Type

`Segoe UI` at 700 for the wordmark and big numbers, 400 for everything else.
Letter-spacing 6–8px on caps labels, 0.3px on sentences. Nothing else.

---

## Rules that came out of testing

These aren't aesthetic preferences — each one was a defect I hit and fixed.

**1. Keep the bottom-left 230×210 clear on the banner.**
X draws the profile avatar over the banner's bottom-left corner. The first
draft put the wordmark at x=120 and it would have been hidden. Verified: 0 ink
pixels in that zone.

**2. Right margin ≈ left margin.**
First banner had a 410px empty right edge and looked broken. Fixed by extending
the rule to x=1250 and right-aligning `EN / 中文` + `EST. 2026` on it.
Current margins: L352 / R250.

**3. The avatar has to survive 32px.**
A wordmark avatar is unreadable in a reply thread. The mark is four shapes:
three bars of increasing height plus a chevron. Downscaled to 32×32 the accent
still occupies 7.91% of the frame — the threshold where a shape stays
recognisable. (At 400×400 it is 9.55%; the 32px number is the one that matters.)

**4. Never let two text columns touch.**
Measured on the rendered PNGs (any pixel brighter than #3C3C3C, y=60–700):
`card-octoverse` left column ends x=871, right starts x=981 → 110px gap.
`card-763b` 598 → 982, `card-cursor` 650 → 982. Verified: 0 ink inside the
x=940–978 band on all three cards. Right column always starts at x=980+.

---

## Adding a new card

Copy `card-octoverse.svg`, change the numbers and the source line, keep:

- 120px outer margin on all sides
- one 72×6 accent bar top-left
- source + date bottom-right, `AGENT LEDGER` bottom-left
- the 1600×900 canvas

Then:

```powershell
.\scripts\render-assets.ps1
```



