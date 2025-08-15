# Kasper's Dungeon Crawler (KDC)

A fast, single-file HTML/JS/CSS boss-dueling RPG built in one night by Ryan + ChatGPT.  
Features flashy combat, perks between bosses, boss passives, NG+ that scales enemies +30% while keeping your progress, music/SFX, and click-to-set boss backgrounds.

## Play
Open `kdc/index.html` locally or via GitHub Pages:
https://<your-username>.github.io/<your-repo>/kdc/

## Controls & Tips
- **Buttons:** Attack / Ability / Guard / Potion / Haste / Slow Bomb.
- **Potions:** Heal 25–50% **HP & MP**. Start with 6; +1 after each boss.
- **Perks:** Choose a boon after each boss (ATK/MAG/DEF/SPD/CRIT/HP/MP/Potions/Haste/Slow).
- **NG+:** After the final boss, continue to New Game Plus (bosses +30% stats) while keeping perks and drops.
- **Class Lock:** After starting a run, you can’t switch class until you reset (prevents mid-fight heals).

## Folder layout
kdc/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  └─ game.js
├─ Ability_Icons/            (Power-Strike.jpg, Fire-ball.jpg, Divine_Sheild.webp, Heal.jpg, Back-Stab.jpg)
├─ Hero_IMG/                 (Warrior.jpg, Mage.webp, Paladin.webp, Priest.jpg, Rogue.avif)
├─ Boss_IMG/                 (Zerker-Viking.jpg, Samurai_General.webp, BigFoot-Forest-Dweller.jpg, Blood-Stained-Knight.jpg, Chrome_Polished_Knight.jpg, Dragon-Blade.jpg)
└─ assets/
   └─ sfx/                   (theme + sfx files you downloaded)

> All paths in `game.js` and `index.html` are **relative** to `/kdc/`.

## Add KDC to your site navbar
Add this link anywhere you render your nav:
```html
<li><a href="kdc/index.html">Play KDC</a></li>
