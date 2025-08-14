# My Website — Week Improvements

## Peer Feedback I’m Responding To
1. **“Home page text and images need better alignment. Some images could be cropped/sized similarly.”**
2. **“Navbar should center earlier after it switches to vertical on smaller screens.”**
3. **“On the Pokémon page, Charizard’s card is shorter — make all three cards match.”**

> If any peers didn’t submit, I’m also applying Ch. 16 design principles (Alignment, Proximity, Repetition, Contrast).

---

## Change Log (filled as I go)
- - [x] **Navbar centers earlier on small screens**  
  _File:_ `styles.css` — line **323** (media query updated to center `.navbar` at ≤768px)  
  _Why:_ Matches peer feedback so the vertical nav is centered immediately after stacking.


- [x] **Homepage alignment & uniform image sizing**
  _File:_ `styles.css` — lines **371–386**
  _What:_ Standardized image boxes on the home page; switched to `object-fit: contain` to avoid cropping faces. Added subtle background for any letterboxing.
  _Why:_ Aligns images/text consistently per peer feedback without cutting off heads.


- [x] **Pokémon cards equalized (Charizard matches others)**  
  _File:_ `mod5.html` — lines **12–40**  
  _What:_ Set consistent min-height for `.pokemon-card` and fixed image/GIF sizes using `object-fit: contain` with a subtle background to avoid cropping.  
  _Why:_ Ensures all three cards are the same height and keeps full images in view, per peer feedback.

---

## Assignment Requirements Checklist
- [x] **Video/Audio embedded** — Chargers theme on sports page  
  _File:_ `sports.html` — lines **TBD**  
- [ ] **Google Font applied** — (will add next)  
  _File:_ all pages’ `<head>` + `styles.css`  
- [ ] **Font Awesome icon used** — (will add next)  
  _File:_ all pages’ `<head>` + any page content
- [x] **4+ pages have at least a viewport of content** — index/home, Pokémon, sports, plus family/about
- [ ] **EXTRA: Favicon added** — (optional, can add after core fixes)  
  _File:_ `favicon.ico` + `<head>` links
- [ ] **EXTRA: Table added** — (optional Pokémon comparison table)

---

## “Where is it located?” (final fill-in before submission)
- **Video/Audio:** `sports.html` lines **TBD** — _San Diego Super Chargers Theme Song_ embed  
- **Google Font application:** `index.html`/`sports.html`/`mod5.html` `<head>` lines **TBD**; `styles.css` lines **TBD**  
- **Font Awesome icon(s):** `<head>` include lines **TBD**; usage lines **TBD**  
- **Table (if added):** `mod5.html` lines **TBD**