/* =========================
   KDC — Game Logic (clean build)
   ========================= */

/* ===== Config ===== */
const CFG = {
  BOSS_HP_SCALE_STEP: 0.255,
  NG_PLUS_MULT: 0.30,
  POTION_MIN_PCT: 25,
  POTION_MAX_PCT: 50,
  CHROME_CRIT_REDUCE: 0.65,
  DRAGON_BREATH_BONUS_MAG: 6,
  LOW_HP_THRESHOLD: 0.25,
  HOLY_BURN_TURNS: 3,       // Paladin burn duration
  IMBUE_TURNS: 5,           // Paladin imbue duration
  SHIELD_FAITH_TURNS: 2,    // Priest shield duration
  GHOST_DODGE_PCT: 25       // Rogue dodge buff from Ghost Strike
};

/* ===== SFX + BGM ===== */
function loadSfx(map){
  const out={};
  for (const [k,src] of Object.entries(map)){
    try{
      const a=new Audio();
      a.preload='auto';
      a.src=src;
      out[k]=a;
    }catch{ out[k]=null; }
  }
  return out;
}
const SFX = loadSfx({
  hit:'assets/sfx/Player-Attack-Sound.wav',
  crit:'assets/sfx/Player-Attack-Sound.wav',
  hurt:'assets/sfx/Boss-Attacks.wav',
  potion:'assets/sfx/Any_Boss_Special_move.mp3',
  ability:'assets/sfx/Any_Boss_Special_move.mp3',
  fire:'assets/sfx/Any_Boss_Special_move.mp3',
  holy:'assets/sfx/Any_Boss_Special_move.mp3',
  smite:'assets/sfx/Any_Boss_Special_move.mp3',
  backstab:'assets/sfx/Player-Attack-Sound.wav',
  breath:'assets/sfx/Any_Boss_Special_move.mp3',
  perk:'assets/sfx/Any_Boss_Special_move.mp3',
  victory:'assets/sfx/Victory-Theme.wav',
  ui:'assets/sfx/Any_Boss_Special_move.mp3',
  appearBigfoot:'assets/sfx/Bigfoot-Appears.wav',
  appearBloodKnight:'assets/sfx/BloodyKnight-Appears.wav'
});
function play(k,vol=1){
  const a=SFX[k]; if(!a) return;
  try{ const b=a.cloneNode(); b.volume=vol; b.play().catch(()=>{}); }catch{}
}

const BGM_CHOICES = {
  Warrior: ['assets/sfx/Warrior-Theme-Song.mp3','assets/sfx/Warror-Theme-Song.mp3'],
  Mage:    ['assets/sfx/Mage-Theme-Song.mp3'],
  Paladin: ['assets/sfx/Paladin-Theme-Song.mp3'],
  Priest:  ['assets/sfx/Priest-Theme-Song.mp3'],
  Rogue:   ['assets/sfx/Rogue-Theme-Song.mp3'],
  Victory: ['assets/sfx/Victory-Theme.wav']
};

// unlock audio on first user gesture
let audioUnlocked=false;
function unlockAudio(){
  if (audioUnlocked) return; audioUnlocked=true;
  try{
    const C = window.AudioContext || window.webkitAudioContext;
    if(C){
      const ac = new C(); ac.resume?.();
      const o=ac.createOscillator(), g=ac.createGain();
      g.gain.value=0.0001; o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime+0.01);
    }
  }catch{}
}
window.addEventListener('pointerdown', unlockAudio, { once:true });

/* --- BGM with overlap protection --- */
let bgm=null, bgmToken=0;
function stopBgmAll(){
  document.querySelectorAll('audio.__bgm').forEach(a=>{ try{ a.pause(); a.src=''; }catch{} });
  bgm=null;
}
function playBgm(name){
  const list=BGM_CHOICES[name]; if(!list) return;
  stopBgmAll();
  const myToken=++bgmToken; let i=0;
  const tryNext=()=>{
    if(myToken!==bgmToken) return;
    if(i>=list.length) return;
    const src=list[i++]; const a=new Audio(src);
    a.classList.add('__bgm'); a.loop=(name!=='Victory');
    a.volume=(name!=='Victory')?0.35:0.8;
    a.addEventListener('error', tryNext, { once:true });
    a.play().then(()=>{
      if(myToken!==bgmToken){ try{a.pause();}catch{}; return; }
      bgm=a;
    }).catch(tryNext);
  };
  tryNext();
}
function resumeHeroBgm(){ if(hero) playBgm(hero.className); }

/* ===== Data ===== */
const CLASSES = {
  Warrior:{ hp:120, mp:20, atk:14, mag:4,  def:8,  spd:6,  crit:15, ability:'Power Strike' },
  Mage:   { hp:80,  mp:60, atk:6,  mag:16, def:4,  spd:7,  crit:18, ability:'Fireball' },
  Paladin:{ hp:110, mp:35, atk:12, mag:6,  def:10, spd:5,  crit:14, ability:'Divine Smite' },
  Priest: { hp:90,  mp:70, atk:5,  mag:14, def:6,  spd:6,  crit:16, ability:'Divine Burst' },
  Rogue:  { hp:85,  mp:30, atk:11, mag:5,  def:5,  spd:12, crit:26, ability:'Backstab' }
};
const HERO_ICONS = {
  Warrior:'Hero_IMG/Warrior.jpg',
  Mage:'Hero_IMG/Mage.webp',
  Paladin:'Hero_IMG/Paladin.webp',
  Priest:'Hero_IMG/Priest.jpg',
  Rogue:'Hero_IMG/Rogue.avif'
};
const ABILITY_ICONS = {
  'Power Strike':'Ability_Icons/Power-Strike.jpg',
  'Bulwark Shell':'Ability_Icons/Shield.webp',
  'Fireball':'Ability_Icons/Fire-ball.jpg',
  'Frost Bolt':'Ability_Icons/Frost-Bolt.webp',
  'Divine Burst':'Ability_Icons/Divine_Burst.webp',
  'Heal':'Ability_Icons/Heal.jpg',
  'Shield of Faith':'Ability_Icons/Divine_Sheild.webp',
  'Divine Smite':'Ability_Icons/Smite.webp',
  'Holy Imbue':'Ability_Icons/Holy-Imbue.webp',
  'Backstab':'Ability_Icons/Back-Stab.jpg',
  'Ghost Strike':'Ability_Icons/Ghost-Strike.webp'
};

const BOSSES = [
  { name:'Zerker Viking', hp:150, atk:22, def:6,  spd:7,  crit:12,
    flavor:'War-cries echo over the gale; the axe falls before you blink.',
    passive:'Berserk: below 50% HP, 50% chance to swing twice.',
    img:'Boss_IMG/Zerker-Viking.jpg' },
  { name:'Samurai General', hp:160, atk:17, def:8,  spd:12, crit:12,
    flavor:'Steel, discipline, and a killing calm amid autumn leaves.',
    passive:'Iaido Counter: if you crit, he immediately counters.',
    img:'Boss_IMG/Samurai_General.webp' },
  { name:'Bigfoot, Forest Dweller', hp:210, atk:17, def:10, spd:5,  crit:6,
    flavor:'A towering guardian of the deep woods. Its roar shakes the branches.',
    passive:'Stomp: 20% chance to stun you for your next turn.',
    img:'Boss_IMG/BigFoot-Forest-Dweller.jpg' },
  { name:'The Blood-Stained Knight', hp:180, atk:18, def:12, spd:7,  crit:10,
    flavor:'A crimson bulwark whose armor drinks the light.',
    passive:'Honorbound: 65% chance to join you for the final two bosses.',
    img:'Boss_IMG/Blood-Stained-Knight.jpg' },
  { name:'Chrome-Polished Knight', hp:190, atk:16, def:16, spd:5,  crit:7,
    flavor:'Immaculate armor that barely dents—every blow tests your resolve.',
    passive:'Gleaming Bulwark: takes 35% less damage from your crits.',
    img:'Boss_IMG/Chrome_Polished_Knight.jpg' },
  { name:'Dragon Blade', hp:250, atk:23, def:12, spd:10, crit:12,
    flavor:'Where the blade swings, dragons answer with fire and thunder.',
    passive:'Dragon’s Breath: every 3 turns, heavy magic attack (ignores Guard).',
    img:'Boss_IMG/Dragon-Blade.jpg' }
];

const BOSS_DROPS = {
  'Zerker Viking':           { name:'Berserker Talisman',      apply:h=>{h.stats.atk+=3;}, msg:'+3 ATK' },
  'Samurai General':         { name:'Higo Crest',              apply:h=>{h.stats.spd+=2;}, msg:'+2 SPD' },
  'Bigfoot, Forest Dweller': { name:'Forest Charm',            apply:h=>{h.stats.def+=3;}, msg:'+3 DEF' },
  'The Blood-Stained Knight':{ name:'Knight’s Helm',           apply:h=>{h.maxHp+=25;h.stats.def+=2;h.hp=h.maxHp;}, msg:'+25 Max HP, +2 DEF' },
  'Chrome-Polished Knight':  { name:'Chrome Plating',          apply:h=>{h.stats.def+=2;h.stats.crit=Math.min(60,h.stats.crit+3);}, msg:'+2 DEF, +3% CRIT' },
  'Dragon Blade':            { name:'Dragon Scale',            apply:h=>{h.stats.mag+=6;}, msg:'+6 MAG' }
};

/* Special Boons — 10% chance per boss kill */
const SPECIAL_BOONS = {
  'Zerker Viking':      { id:'berserkEcho',     apply:h=>h.boons.berserkEcho=true,     desc:'Berserk Echo: 20% chance your basic Attack swings twice.' },
  'Samurai General':    { id:'iaidoLesson',     apply:h=>h.boons.iaidoLesson=true,     desc:'Iaido Lesson: when the boss crits you, counter for 60% of a basic hit.' },
  'Bigfoot, Forest Dweller': { id:'forestStomp',apply:h=>h.boons.forestStomp=true,     desc:'Forest Stomp: 10% chance your hit stuns the boss for 1 turn.' },
  'The Blood-Stained Knight':{ id:'oathboundAid',apply:h=>h.boons.oathboundAid=true,   desc:'Oathbound Aid: the Knight may assist before the final bosses.' },
  'Chrome-Polished Knight':  { id:'gleamingGuard',apply:h=>h.boons.gleamingGuard=true, desc:'Gleaming Guard: incoming crits deal 35% less damage.' },
  'Dragon Blade':       { id:'wyrmBreath',      apply:h=>h.boons.wyrmBreath=true,      desc:'Wyrm Breath: every 3 of YOUR turns, deal bonus magic damage.' }
};

/* ===== State ===== */
let hero=null, bossIndex=0, boss=null;
let abilityCooldown1=0, abilityCooldown2=0;
let heroStunned=0, bossTurnCount=0, allyBloodKnight=false;
let level=1, sanctuaryTurns=0, extraTurns=0, skipBossTurns=0;
let heroVulnerableTurns=0, classLocked=false, ngPlus=0;
// buff/boon states
let bulwarkReflectPct=0, priestBurstCharges=0, priestBurstBonus=0;
let shieldFaithTurns=0, paladinImbueTurns=0, holyBurnTurns=0;
let ghostStrikeCharges=0, dodgeBuffTurns=0;
let freezeTurns=0;

/* ===== DOM + FX ===== */
const $=id=>document.getElementById(id);
const log=m=>{ const p=document.createElement('p'); p.textContent=m; $('log').appendChild(p); $('log').scrollTop=$('log').scrollHeight; };
const updateLevelTag=()=>{const e=$('levelTag'); if(e) e.textContent=String(level);};
const updateNGPTag=()=>{const e=$('ngpTag'); if(e) e.textContent=`NG+: ${ngPlus}`;};
const setHeroTitle=name=>{ $('heroName').innerHTML=`<span class="hero-icon big-hero" style="background-image:url('${HERO_ICONS[name]||''}')"></span> ${name} (Lv.${level})`; };

function setAbilityButtons(){
  if(!hero) return;
  const A = abilityLabels[hero.className];
  const b1=$('btnAbility1'), b2=$('btnAbility2');
  b1.innerHTML=(ABILITY_ICONS[A[0].label]?`<span class="btn-icon" style="background-image:url('${ABILITY_ICONS[A[0].label]}')"></span>`:'')+`✨ ${A[0].label} (${A[0].mp})`;
  b1.title=A[0].tip;
  b2.innerHTML=(ABILITY_ICONS[A[1].label]?`<span class="btn-icon" style="background-image:url('${ABILITY_ICONS[A[1].label]}')"></span>`:'')+`✨ ${A[1].label} (${A[1].mp})`;
  b2.title=A[1].tip;
}
function shake(id){ const el=$(id); if(!el) return; el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),200); }
function pulse(id){ const el=$(id); if(!el) return; el.classList.add('pulse'); setTimeout(()=>el.classList.remove('pulse'),200); }
function flash(){ const f=$('hitFlash'); if(!f) return; f.classList.remove('show'); void f.offsetWidth; f.classList.add('show'); }

const percent=(c,m)=>Math.max(0,Math.min(100,Math.round(c/m*100)));
const roll=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const critChance=b=>Math.min(60,b);
function tryCrit(b){ return Math.random()*100<critChance(b); }
function tryDodge(attSpd,defSpd){
  let ch=Math.max(0,Math.min(35,5+(defSpd-attSpd)*2));
  if(dodgeBuffTurns>0) ch=Math.min(60,ch+CFG.GHOST_DODGE_PCT);
  return Math.random()*100<ch;
}
const physDamage=(a,d)=>Math.max(1,(a.atk+roll(0,4))-Math.floor(d.def*0.6));
const magicDamage=(a,d)=>Math.max(2,(a.mag+roll(2,6))-Math.floor(d.def*0.3));
function physRollDetails(a,d){ const r=roll(0,4), red=Math.floor(d.def*0.6); return {atk:a.atk, rand:r, defRed:red, inter:Math.max(1,a.atk+r-red)}; }
function magicRollDetails(a,d){ const r=roll(2,6), red=Math.floor(d.def*0.3); return {mag:a.mag, rand:r, defRed:red, inter:Math.max(2,a.mag+r-red)}; }

function setBars(){
  $('heroHpBar').style.width=percent(hero.hp,hero.maxHp)+'%';
  $('heroMpBar').style.width=percent(hero.mp,hero.maxMp)+'%';
  $('bossHpBar').style.width=percent(boss.hp,boss.maxHp)+'%';
  $('heroStatus').textContent=`${hero.hp}/${hero.maxHp} HP, ${hero.mp}/${hero.maxMp} MP`;
  $('bossStatus').textContent=`${boss.hp}/${boss.maxHp} HP`;
  updateLowHpGlow();
}
function updateLowHpGlow(){
  $('heroCard')?.classList.toggle('low-hp', hero && hero.hp/hero.maxHp<=CFG.LOW_HP_THRESHOLD);
  $('bossCard')?.classList.toggle('low-hp', boss && boss.hp/boss.maxHp<=CFG.LOW_HP_THRESHOLD);
}
function renderHeroStats(){
  const s=hero.stats;
  $('heroStats').innerHTML=`
    <div>ATK: <b>${s.atk}</b></div><div>MAG: <b>${s.mag}</b></div>
    <div>DEF: <b>${s.def}</b></div><div>SPD: <b>${s.spd}</b></div>
    <div>CRIT: <b>${s.crit}%</b></div>
    <div>Potions: <b>${hero.potions}</b> | Haste: <b>${hero.hastePotions}</b> | Slow: <b>${hero.slowBombs}</b></div>`;
}
function renderBossStats(){
  const s=boss;
  $('bossStats').innerHTML=`
    <div>ATK: <b>${s.atk}</b></div><div>DEF: <b>${s.def}</b></div>
    <div>SPD: <b>${s.spd}</b></div><div>CRIT: <b>${s.crit}%</b></div>
    <div style="grid-column:1/-1; color:#dacfb6">${s.flavor||''}</div>
    <div style="grid-column:1/-1; color:#ffd">Passive: <b>${s.passive||'—'}</b></div>`;
}
function enableControls(on){
  ['btnAttack','btnAbility1','btnAbility2','btnGuard','btnPotion','btnHaste','btnSlow'].forEach(id=>$(id).disabled=!on);
  const costs=currentCosts();
  $('btnAbility1').disabled=!on||abilityCooldown1>0||hero.mp<costs.a1;
  $('btnAbility2').disabled=!on||abilityCooldown2>0||hero.mp<costs.a2;
  if(on){ $('btnHaste').disabled=hero.hastePotions<=0; $('btnSlow').disabled=hero.slowBombs<=0; }
  setAbilityButtons();
}

/* Background switching */
function setBossBackground(img){
  const body=document.body;
  if(img) body.style.background=`linear-gradient(180deg, rgba(5,6,11,.88), rgba(5,6,11,.94)), url("${img}") center / cover fixed no-repeat`;
  else body.style.background='';
}
function applyBackground(){ setBossBackground(boss?.img||null); }

/* Roster */
function renderRoster(){
  const ul=$('bossRoster'); if(!ul) return; ul.innerHTML='';
  BOSSES.forEach((b,i)=>{
    const li=document.createElement('li'); li.dataset.i=i; li.title='Click to set this as the page background';
    const th=document.createElement('span'); th.className='thumb'; if(b.img) th.style.backgroundImage=`url('${b.img}')`;
    li.innerHTML=`<span class="num">${i+1}</span><span class="name">${b.name}</span>`;
    li.prepend(th);
    if(i===bossIndex) li.classList.add('active');
    if(boss && i<bossIndex) li.classList.add('defeated');
    ul.appendChild(li);
  });
}
function updateRoster(){ const ul=$('bossRoster'); if(!ul) return; [...ul.children].forEach((li,i)=>{ li.classList.toggle('active',i===bossIndex); li.classList.toggle('defeated',i<bossIndex); }); }
$('bossRoster')?.addEventListener('click', e=>{
  const li=e.target.closest('li'); if(!li) return;
  const b=BOSSES[parseInt(li.dataset.i,10)];
  if(b?.img){ setBossBackground(b.img); log(`Background set to ${b.name}.`); play('ui',.25); }
});

/* Perks */
const PERKS=[
  {id:'atk4',label:'+4 ATK',apply:()=>hero.stats.atk+=4},
  {id:'mag6',label:'+6 MAG',apply:()=>hero.stats.mag+=6},
  {id:'def3',label:'+3 DEF',apply:()=>hero.stats.def+=3},
  {id:'spd2',label:'+2 SPD',apply:()=>hero.stats.spd+=2},
  {id:'crit5',label:'+5% Crit',apply:()=>hero.stats.crit=Math.min(60,hero.stats.crit+5)},
  {id:'hp30',label:'+30 Max HP',apply:()=>{hero.maxHp+=30;hero.hp=hero.maxHp;}},
  {id:'mp15',label:'+15 Max MP',apply:()=>{hero.maxMp+=15;hero.mp=hero.maxMp;}},
  {id:'pot1',label:'+1 Potion',apply:()=>hero.potions=Math.min(9,hero.potions+1)},
  {id:'haste1',label:'+1 Haste',apply:()=>hero.hastePotions=Math.min(3,hero.hastePotions+1)},
  {id:'slow1',label:'+1 Slow Bomb',apply:()=>hero.slowBombs=Math.min(3,hero.slowBombs+1)}
];
function offerPerks(done){
  const panel=$('perkPanel'), box=$('perkChoices'); panel.hidden=false; box.innerHTML='';
  const pool=PERKS.slice(); const picks=[];
  while(picks.length<3&&pool.length){ picks.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
  picks.forEach(p=>{
    const btn=document.createElement('button'); btn.className='perk-btn'; btn.textContent=p.label; btn.title='Click to gain this boon.';
    btn.onclick=()=>{ p.apply(); play('perk',.6); panel.hidden=true; renderHeroStats(); setBars(); done?.(); };
    box.appendChild(btn);
  });
  if(!picks.length){ panel.hidden=true; done?.(); }
}

/* Two-ability labels and MP costs */
const abilityLabels = {
  Warrior: [
    { label:'Power Strike', mp:10, tip:'Hit twice; you take +10% dmg on the next boss hit.' },
    { label:'Bulwark Shell', mp:14, tip:'Gain DEF this round + reflect 50% of the next boss hit.' }
  ],
  Mage: [
    { label:'Fireball', mp:14, tip:'Big damage (magic).' },
    { label:'Frost Bolt', mp:12, tip:'Smaller damage; 25% freeze for 2 boss turns.' }
  ],
  Priest: [
    { label:'Divine Burst', mp:10, tip:'3 charges per boss; each use +5% stronger. After charges: becomes Heal.' },
    { label:'Shield of Faith', mp:8,  tip:'Take 50% less damage for 2 turns.' }
  ],
  Paladin: [
    { label:'Divine Smite', mp:12, tip:'Heavy holy dmg; 50% Holy Burn (DoT).' },
    { label:'Holy Imbue',  mp:12, tip:'For 5 turns, attacks deal +25% holy and heal on hit.' }
  ],
  Rogue: [
    { label:'Backstab',    mp:10, tip:'High base with big crit chance.' },
    { label:'Ghost Strike',mp:12, tip:'3 charges; strike + +25% dodge for 2 turns.' }
  ]
};
function currentCosts(){ const A=abilityLabels[hero.className]; return { a1:A[0].mp, a2:A[1].mp }; }

/* Class select */
function drawClassCards(){
  const list=$('classList'); list.innerHTML='';
  Object.entries(CLASSES).forEach(([name,s])=>{
    const div=document.createElement('div'); div.className='class-card'; div.tabIndex=0; div.title=`Select ${name}`;
    div.innerHTML=`
      <div class="class-title"><span class="hero-icon" style="background-image:url('${HERO_ICONS[name]||''}')"></span>${name}</div>
      <div class="stats">
        <div>HP: <b>${s.hp}</b></div><div>MP: <b>${s.mp}</b></div>
        <div>ATK: <b>${s.atk}</b></div><div>MAG: <b>${s.mag}</b></div>
        <div>DEF: <b>${s.def}</b></div><div>SPD: <b>${s.spd}</b></div>
        <div>CRIT: <b>${s.crit}%</b></div>
        <div>Ability: <b>${s.ability}</b></div>
      </div>`;
    const choose=()=>{ if(selectClass(name,div)!==false){ unlockAudio(); play('ui',.2); playBgm(name); } };
    div.addEventListener('click', choose);
    div.addEventListener('keypress', e=>{ if(e.key==='Enter') choose(); });
    list.appendChild(div);
  });
}
function selectClass(name, elem){
  if (classLocked && hero) {
    log('🔒 Class selection is locked for this run. Reset to change class.');
    $('classList')?.classList.add('shake');
    setTimeout(() => $('classList')?.classList.remove('shake'), 200);
    return false;
  }
  stopBgmAll(); // kill any previous theme

  // UI highlight
  document.querySelectorAll('.class-card').forEach(c=>c.classList.remove('selected'));
  elem?.classList.add('selected');

  // build hero
  const base=CLASSES[name];
  hero = {
    className:name,
    stats:{...base},
    maxHp:base.hp,
    maxMp:base.mp,
    hp:base.hp,
    mp:base.mp,
    potions:5,
    hastePotions:1,
    slowBombs:1,
    guard:false,
    boons:{}
  };

  // portrait
  const hArt=$('heroArt'), heroImg=HERO_ICONS[name];
  if(heroImg){ hArt.hidden=false; hArt.style.backgroundImage=`url('${heroImg}')`; }
  else { hArt.hidden=true; hArt.style.backgroundImage=''; }

  unlockAudio();
  playBgm(name);

  // reset state
  level=1; updateLevelTag(); updateNGPTag(); setHeroTitle(name);
  abilityCooldown1=0; abilityCooldown2=0;
  sanctuaryTurns=0; heroVulnerableTurns=0;
  priestBurstCharges=3; priestBurstBonus=0;
  shieldFaithTurns=0; paladinImbueTurns=0;
  ghostStrikeCharges=3; dodgeBuffTurns=0;
  freezeTurns=0; holyBurnTurns=0; bulwarkReflectPct=0;

  setAbilityButtons(); renderHeroStats(); setBars(); enableControls(false);
}

function startAdventure(){
  if(!hero){ alert('Choose a class first!'); return; }
  unlockAudio(); resumeHeroBgm();
  classLocked=true; $('classList')?.classList.add('locked');
  $('startBtn')?.setAttribute('disabled','');
  bossIndex=0; allyBloodKnight=false; level=1; ngPlus=0; updateLevelTag(); updateNGPTag();
  nextBoss();               // <-- spawns boss
  enableControls(true);
}

/* Boss setup */
function computeBossStats(b){
  const enc=1+CFG.BOSS_HP_SCALE_STEP*bossIndex, ng=1+CFG.NG_PLUS_MULT*ngPlus;
  let s={ name:b.name,img:b.img,flavor:b.flavor,passive:b.passive,
          hp:Math.round(b.hp*enc*ng), atk:Math.round(b.atk*ng), def:Math.round(b.def*ng), spd:b.spd, crit:b.crit };
  switch(b.name){
    case 'Zerker Viking': s.hp=Math.round(s.hp*0.95); s.atk=Math.round(s.atk*0.90); s.crit+=3; break;
    case 'Samurai General': s.spd=Math.round(s.spd*1.25); s.atk=Math.round(s.atk*1.05); break;
    case 'Bigfoot, Forest Dweller': s.hp=Math.round(s.hp*1.25); s.def=Math.round(s.def*1.10); break;
    case 'The Blood-Stained Knight': s.def=Math.round(s.def*1.20); break;
    case 'Chrome-Polished Knight': s.def=Math.round(s.def*1.25); break;
    case 'Dragon Blade': s.hp=Math.round(s.hp*1.15); s.atk=Math.round(s.atk*1.15); s.spd=Math.round(s.spd*1.10); break;
  }
  s.maxHp=s.hp; return s;
}
function nextBoss(){
  const b=BOSSES[bossIndex]; boss=computeBossStats(b);
  bossTurnCount=0; heroVulnerableTurns=0; freezeTurns=0; holyBurnTurns=0; shieldFaithTurns=0; bulwarkReflectPct=0;
  priestBurstCharges=3; priestBurstBonus=0; ghostStrikeCharges=3; dodgeBuffTurns=0; paladinImbueTurns=0;

  $('bossName').textContent=boss.name;
  $('encounter').textContent=`${bossIndex+1} / ${BOSSES.length}`;
  $('difficulty').textContent=ngPlus>0? `${['Story','Normal','Challenging','Hard','Very Hard','Boss'][bossIndex]||'Epic'} • NG+${ngPlus}` : (['Story','Normal','Challenging','Hard','Very Hard','Boss'][bossIndex]||'Epic');
  $('log').innerHTML=''; log(`A wild ${boss.name} appears! ${boss.flavor||''}`);
  if(b.name==='Bigfoot, Forest Dweller') play('appearBigfoot',.9);
  if(b.name==='The Blood-Stained Knight') play('appearBloodKnight',.9);

  const art=$('bossArt');
  if(boss.img){ art.hidden=false; art.style.backgroundImage=`url('${boss.img}')`; }
  else { art.hidden=true; art.style.backgroundImage=''; }

  renderBossStats(); setBars(); applyBackground(); enableControls(true); renderRoster(); updateRoster();
}
function grantBossDrop(n){ const d=BOSS_DROPS[n]; if(!d) return; d.apply(hero); renderHeroStats(); setBars(); log(`🎁 Drop acquired: ${d.name} (${d.msg}).`); }
function tryGrantSpecialBoon(n){ const boon=SPECIAL_BOONS[n]; if(Math.random()<0.10 && boon){ boon.apply(hero); log(`✨ Special Boon gained: ${boon.desc}`); } }

function showVictoryOverlay(){
  $('ngNext').textContent=String(ngPlus+1);
  $('runSummary').textContent=`${hero.className} • Level ${level} • NG+${ngPlus} — drops & perks carry forward.`;
  const cf=$('confetti'); cf.innerHTML='';
  for(let i=0;i<60;i++){ const e=document.createElement('i'); e.style.left=Math.random()*100+'%'; e.style.animationDelay=(Math.random()*1.8)+'s'; e.style.setProperty('--h',Math.floor(Math.random()*360)); cf.appendChild(e); }
  $('victoryOverlay').hidden=false; play('victory',.9); playBgm('Victory'); enableControls(false);
}
function continueToNGPlus(){ $('victoryOverlay').hidden=true; ngPlus+=1; updateNGPTag(); bossIndex=0; hero.hp=hero.maxHp; hero.mp=hero.maxMp; log(`🌟 New Game Plus ${ngPlus} begins! Bosses are ${Math.round(CFG.NG_PLUS_MULT*100)}% stronger.`); resumeHeroBgm(); nextBoss(); }

/* Turn flow */
let playerTurnCounter=0;
function afterPlayerTurnEffects(){
  // Paladin Holy Burn DoT
  if(holyBurnTurns>0 && boss.hp>0){
    const burn=Math.max(1,Math.floor(boss.maxHp*0.03)); // ~3% max HP per tick
    boss.hp=Math.max(0,boss.hp-burn);
    log(`🔥 Holy Burn deals ${burn} damage.`);
    holyBurnTurns--;
    setBars();
  }
  // Player-side Wyrm Breath boon
  playerTurnCounter++;
  if(hero?.boons?.wyrmBreath && playerTurnCounter%3===0 && boss.hp>0){
    const dmg=magicDamage({mag:hero.stats.mag+CFG.DRAGON_BREATH_BONUS_MAG},boss)+roll(4,8);
    boss.hp=Math.max(0,boss.hp-dmg);
    log(`🐉 Wyrm Breath triggers for ${dmg} bonus damage!`);
    setBars();
  }
}
function endTurn(){
  if(boss.hp>0){
    if(extraTurns>0){ extraTurns--; enableControls(true); tickCooldowns(); return; }
    if(skipBossTurns>0){ skipBossTurns--; log('🧊 The enemy loses their turn!'); enableControls(true); tickCooldowns(); return; }
    setTimeout(bossAct,350);
  } else {
    log(`✅ ${boss.name} is defeated!`); enableControls(false);
    grantBossDrop(boss.name);
    tryGrantSpecialBoon(boss.name);
    if(boss.name==='The Blood-Stained Knight'){
      const join=Math.random()<0.65; allyBloodKnight=join;
      log(join ? '⚔️ The Blood-Stained Knight nods and joins you for the final battles!' : '…The Blood-Stained Knight walks away into the distance. “Things may have been different.”');
    }
    hero.potions=Math.min(9,hero.potions+1); log('🧪 You gained +1 potion.');
    bossIndex++; updateRoster();
    if(bossIndex>=BOSSES.length){
      level++; updateLevelTag(); setHeroTitle(hero.className);
      hero.maxHp+=15; hero.maxMp+=5; hero.hp=hero.maxHp; hero.mp=hero.maxMp;
      log('🛌 You slept well and are ready for war! Fully restored.');
      renderHeroStats(); setBars(); showVictoryOverlay(); return;
    }
    level++; updateLevelTag(); setHeroTitle(hero.className);
    hero.maxHp+=15; hero.maxMp+=5; hero.hp=hero.maxHp; hero.mp=hero.maxMp;
    if(Math.random()<0.34 && hero.hastePotions<2){ hero.hastePotions++; log('⚡ You found a haste potion.'); }
    else if(hero.slowBombs<2){ hero.slowBombs++; log('🧊 You found a slow bomb.'); }
    log('🛌 You slept well and are ready for war! Fully restored.');
    renderHeroStats(); setBars(); offerPerks(()=>nextBoss());
  }
}

/* Boss AI */
function bossAct(){
  bossTurnCount++;

  // Ally knight assist or oathbound boon
  if((allyBloodKnight && bossIndex>=4) || hero?.boons?.oathboundAid){
    const assist=roll(8,14); boss.hp=Math.max(0,boss.hp-assist);
    log(`🛡️ The Blood-Stained Knight assists for ${assist} damage!`);
    setBars(); if(boss.hp<=0){ endTurn(); return; }
  }
  if(boss.name==='Dragon Blade' && bossTurnCount%3===2) log('🔥 The dragon gathers flames…');

  // Bigfoot flee rule: <25% HP → 5% chance to flee (no rewards)
  if(boss.name==='Bigfoot, Forest Dweller' && boss.hp>0 && boss.hp<=Math.floor(boss.maxHp*0.25)){
    if(Math.random()<0.05){
      log('🦶 Bigfoot fled!');
      bossIndex++; updateRoster();
      if(bossIndex>=BOSSES.length){ showVictoryOverlay(); return; }
      hero.hp=hero.maxHp; hero.mp=hero.maxMp; log('You catch your breath and press on. (No rewards)');
      renderHeroStats(); setBars(); nextBoss(); return;
    }
  }

  const dragon=(boss.name==='Dragon Blade') && (bossTurnCount%3===0);
  const berserk=(boss.name==='Zerker Viking') && (boss.hp<=boss.maxHp/2) && (Math.random()<0.5);

  bossSwing(dragon);
  if(berserk && hero.hp>0){ log('Berserk fury! The Viking swings again!'); bossSwing(false); }
  if(hero.hp<=0){ defeat(); } else { enableControls(true); tickCooldowns(); }
}
function bossSwing(isBreath){
  if(tryDodge(boss.spd,hero.stats.spd) && !isBreath){ log(`${hero.className} dodges the attack!`); return; }
  let dmg, crit=false;
  if(isBreath){ dmg=magicDamage({mag:boss.atk+CFG.DRAGON_BREATH_BONUS_MAG},hero.stats)+roll(6,10); log('🔥 Dragon’s Breath erupts!'); play('breath',.9); }
  else{ dmg=physDamage(boss,hero.stats); if(Math.random()*100<boss.crit){ dmg=Math.floor(dmg*1.6); crit=true; log('The boss lands a CRITICAL hit!'); play('crit',.9); } if(hero.guard) dmg=Math.floor(dmg*0.5); play('hurt',.8); }

  // Priest Shield of Faith
  if(shieldFaithTurns>0){ dmg=Math.floor(dmg*0.5); shieldFaithTurns--; }

  if(heroVulnerableTurns>0){ dmg=Math.floor(dmg*1.10); heroVulnerableTurns=0; log('🩸 Reeling from Power Strike: +10% damage taken.'); }

  // Chrome boon reduces incoming crits
  if(crit && hero?.boons?.gleamingGuard){ dmg=Math.ceil(dmg*CFG.CHROME_CRIT_REDUCE); log('✨ Gleaming Guard reduces the critical damage!'); }

  hero.hp=Math.max(0,hero.hp-dmg); log(`${boss.name} hits you for ${dmg} damage.`); hero.guard=false; shake('heroCard'); flash(); setBars();

  // Samurai boon: counter on boss crit
  if(crit && hero.hp>0 && hero?.boons?.iaidoLesson){
    const c=Math.max(1,Math.floor(physDamage(hero.stats,boss)*0.60));
    boss.hp=Math.max(0,boss.hp-c); log(`Iaido Lesson! You counter for ${c}.`); setBars(); if(boss.hp<=0){ endTurn(); return; }
  }

  // Bulwark reflect
  if(bulwarkReflectPct>0){
    const ref=Math.max(1,Math.floor(dmg*bulwarkReflectPct));
    boss.hp=Math.max(0,boss.hp-ref); log(`🛡️ Bulwark reflects ${ref} damage back!`);
    bulwarkReflectPct=0; pulse('bossCard'); setBars(); if(boss.hp<=0){ endTurn(); return; }
  }

  // Bigfoot stun
  if(boss.name==='Bigfoot, Forest Dweller' && Math.random()<0.20 && hero.hp>0){ heroStunned=1; log('🌀 Bigfoot stomps the ground! You are stunned and will lose your next turn.'); }
}

/* Player actions */
function doAttack(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  enableControls(false);
  if(tryDodge(hero.stats.spd,boss.spd)){ log('Boss evades your attack!'); }
  else{
    const d=physRollDetails(hero.stats,boss); let dmg=d.inter; let note=`Roll: (ATK ${d.atk} + d4 ${d.rand}) − DEF×0.6 ${d.defRed} = ${d.inter}`;
    if(boss.name==='Bigfoot, Forest Dweller'){ dmg=Math.max(1,dmg-3); note+=' − Fur 3'; }
    let crit=false; if(tryCrit(hero.stats.crit)){ crit=true; dmg=Math.floor(dmg*1.8); note+=' → CRIT ×1.8'; }
    if(crit&&boss.name==='Chrome-Polished Knight'){ dmg=Math.ceil(dmg*CFG.CHROME_CRIT_REDUCE); note+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; }
    // Paladin Imbue
    if(paladinImbueTurns>0){ const holy=Math.floor(dmg*0.25); dmg+=holy; const heal=Math.max(1,Math.floor(dmg*0.20)); hero.hp=Math.min(hero.maxHp,hero.hp+heal); note+=` + Holy ${holy}, heal ${heal}`; play('holy',.7); }

    boss.hp=Math.max(0,boss.hp-dmg); log(`${note} ⇒ ${dmg} dmg.`); pulse('bossCard'); flash(); play(crit?'crit':'hit',.9);
    if(crit&&boss.name==='Samurai General'&&boss.hp>0){
      const c=Math.max(1,Math.floor(physDamage(boss,hero.stats)*0.60));
      hero.hp=Math.max(0,hero.hp-c); log(`Iaido Counter! Samurai General cuts you for ${c}.`);
      shake('heroCard'); flash(); play('hurt',.8); setBars(); if(hero.hp<=0){ defeat(); return; }
    }

    // Berserk Echo boon: extra swing
    if(hero?.boons?.berserkEcho && boss.hp>0 && Math.random()<0.20){
      const d2=physRollDetails(hero.stats,boss); let dm2=d2.inter;
      if(tryCrit(hero.stats.crit)) dm2=Math.floor(dm2*1.8);
      boss.hp=Math.max(0,boss.hp-dm2); log(`Berserk Echo! Bonus swing for ${dm2} dmg.`); setBars();
    }
    // Forest Stomp boon: stun boss
    if(hero?.boons?.forestStomp && boss.hp>0 && Math.random()<0.10){
      skipBossTurns=Math.max(skipBossTurns,1); log('🌲 Forest Stomp! The boss is stunned for 1 turn.');
    }
  }
  setBars(); afterPlayerTurnEffects(); endTurn();
}
function doGuard(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  enableControls(false); hero.guard=true;
  log('You raise your guard, reducing next damage by 50%.'); play('ability',.5); endTurn();
}
function doPotion(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  if(hero.potions<=0){ log('No potions left!'); return; }
  enableControls(false); hero.potions--;
  const pct=roll(CFG.POTION_MIN_PCT,CFG.POTION_MAX_PCT), healHp=Math.max(1,Math.floor(hero.maxHp*pct/100)), healMp=Math.max(1,Math.floor(hero.maxMp*pct/100));
  hero.hp=Math.min(hero.maxHp,hero.hp+healHp); hero.mp=Math.min(hero.maxMp,hero.mp+healMp);
  renderHeroStats(); setBars(); log(`🧪 Potion heals ${healHp} HP and ${healMp} MP (${pct}% of max).`); play('potion',.8); endTurn();
}
function doHaste(){ if(hero.hastePotions<=0){ log('No haste potions left!'); return; } enableControls(false); hero.hastePotions--; extraTurns+=2; if(abilityCooldown1>0) abilityCooldown1--; if(abilityCooldown2>0) abilityCooldown2--; renderHeroStats(); log('⚡ You chug a haste potion! You act twice more instantly.'); play('ability',.6); enableControls(true); tickCooldowns(); }
function doSlow(){ if(hero.slowBombs<=0){ log('No slow bombs left!'); return; } enableControls(false); hero.slowBombs--; skipBossTurns=Math.max(skipBossTurns,1); if(boss&&boss.name==='Dragon Blade'){ bossTurnCount=0; } renderHeroStats(); log('🧊 You hurl a slow bomb! The enemy’s next turn is cancelled and buildups are disrupted.'); play('ability',.6); endTurn(); }

/* Two abilities */
function doAbility1(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  const need=currentCosts().a1; if(hero.mp<need||abilityCooldown1>0) return;
  enableControls(false); hero.mp-=need;
  const c=hero.className;
  if(c==='Warrior') ability_Warrior_PowerStrike();
  else if(c==='Mage') ability_Mage_Fireball();
  else if(c==='Priest') ability_Priest_DivineBurst();
  else if(c==='Paladin') ability_Paladin_DivineSmite();
  else if(c==='Rogue') ability_Rogue_Backstab();
  setBars(); afterPlayerTurnEffects(); endTurn();
}
function doAbility2(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  const need=currentCosts().a2; if(hero.mp<need||abilityCooldown2>0) return;
  enableControls(false); hero.mp-=need;
  const c=hero.className;
  if(c==='Warrior') ability_Warrior_Bulwark();
  else if(c==='Mage') ability_Mage_FrostBolt();
  else if(c==='Priest') ability_Priest_ShieldOfFaith();
  else if(c==='Paladin') ability_Paladin_HolyImbue();
  else if(c==='Rogue') ability_Rogue_GhostStrike();
  setBars(); afterPlayerTurnEffects(); endTurn();
}

/* === Ability impls === */
// Warrior
function ability_Warrior_PowerStrike(){
  const d1=physRollDetails(hero.stats,boss); let h1=d1.inter; let n1=`Power Strike #1: (ATK ${d1.atk}+d4 ${d1.rand}) − DEF×0.6 ${d1.defRed} = ${h1}`;
  if(boss.name==='Bigfoot, Forest Dweller'){ h1=Math.max(1,h1-3); n1+=' − Fur 3'; }
  if(tryCrit(hero.stats.crit)){ h1=Math.floor(h1*1.8); n1+=' → CRIT ×1.8'; if(boss.name==='Chrome-Polished Knight'){ h1=Math.ceil(h1*CFG.CHROME_CRIT_REDUCE); n1+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; } }
  boss.hp=Math.max(0,boss.hp-h1); log(`${n1} ⇒ ${h1} dmg.`); pulse('bossCard'); flash(); play('hit',.9);

  if(boss.hp>0){
    const d2=physRollDetails(hero.stats,boss); let h2=d2.inter; let n2=`Power Strike #2: (ATK ${d2.atk}+d4 ${d2.rand}) − DEF×0.6 ${d2.defRed} = ${h2}`;
    if(boss.name==='Bigfoot, Forest Dweller'){ h2=Math.max(1,h2-3); n2+=' − Fur 3'; }
    if(tryCrit(hero.stats.crit)){ h2=Math.floor(h2*1.8); n2+=' → CRIT ×1.8'; if(boss.name==='Chrome-Polished Knight'){ h2=Math.ceil(h2*CFG.CHROME_CRIT_REDUCE); n2+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; } }
    boss.hp=Math.max(0,boss.hp-h2); log(`${n2} ⇒ ${h2} dmg.`); pulse('bossCard'); flash(); play('hit',.9);
  }
  heroVulnerableTurns=1; log('🩸 Drawback: you will take +10% damage on the next enemy hit.');
  abilityCooldown1=2;
}
function ability_Warrior_Bulwark(){ hero.guard=true; bulwarkReflectPct=0.50; log('🛡️ Bulwark Shell: Next hit is halved and 50% is reflected.'); play('ability',.6); abilityCooldown2=3; }

// Mage
function ability_Mage_Fireball(){ const d=magicRollDetails(hero.stats,boss), k=roll(6,10); let total=d.inter+k; let note=`Fireball: (MAG ${d.mag}+d2-6 ${d.rand}) − DEF×0.3 ${d.defRed} = ${d.inter}; + d6-10 ${k} = ${total}`; boss.hp=Math.max(0,boss.hp-total); log(`${note} dmg.`); pulse('bossCard'); flash(); play('fire',.9); abilityCooldown1=2; }
function ability_Mage_FrostBolt(){ const d=magicRollDetails(hero.stats,boss), k=roll(2,6); let total=d.inter+k; let note=`Frost Bolt: (MAG ${d.mag}+d2-6 ${d.rand}) − DEF×0.3 ${d.defRed} = ${d.inter}; + d2-6 ${k} = ${total}`; boss.hp=Math.max(0,boss.hp-total); log(`${note} dmg.`); pulse('bossCard'); flash(); play('ability',.8); if(Math.random()<0.25){ freezeTurns=2; skipBossTurns=Math.max(skipBossTurns,2); log('❄️ Freeze! The boss will miss its next 2 turns.'); } abilityCooldown2=2; }

// Priest
function ability_Priest_DivineBurst(){
  if(priestBurstCharges>0){
    const scale=1+priestBurstBonus;
    const d=magicRollDetails({mag:hero.stats.mag},boss), ex=roll(6,10);
    let dmg=Math.floor((d.inter+ex)*scale);
    log(`Divine Burst (${Math.round(scale*100)}%): ${d.inter}+${ex} ⇒ ${dmg} dmg.`);
    boss.hp=Math.max(0,boss.hp-dmg); pulse('bossCard'); flash(); play('holy',.9);
    priestBurstCharges--; priestBurstBonus+=0.05;
    if(priestBurstCharges===0) log('Divine Burst charges spent — the button becomes Heal.');
  } else {
    const heal=24+Math.floor(hero.stats.mag*0.8)+roll(0,6)+5;
    hero.hp=Math.min(hero.maxHp,hero.hp+heal);
    log(`Heal restores ${heal} HP.`); play('holy',.7);
  }
  abilityCooldown1=2;
}
function ability_Priest_ShieldOfFaith(){ shieldFaithTurns=CFG.SHIELD_FAITH_TURNS; log('🛡️ Shield of Faith: You will take 50% less damage for 2 turns.'); play('holy',.8); abilityCooldown2=3; }

// Paladin
function ability_Paladin_DivineSmite(){ const d=magicRollDetails({mag:hero.stats.mag+4},boss), ex=roll(8,12); let dmg=d.inter+ex; boss.hp=Math.max(0,boss.hp-dmg); log(`Divine Smite: ${d.inter}+${ex} ⇒ ${dmg} dmg.`); pulse('bossCard'); flash(); play('smite',.9); if(Math.random()<0.50){ holyBurnTurns=CFG.HOLY_BURN_TURNS; log('🔥 Holy Burn! The foe will take damage over time.'); } abilityCooldown1=2; }
function ability_Paladin_HolyImbue(){ paladinImbueTurns=CFG.IMBUE_TURNS; log('✨ Holy Imbue: For 5 turns, your attacks deal +25% holy and heal you on hit.'); play('holy',.8); abilityCooldown2=4; }

// Rogue
function ability_Rogue_Backstab(){ const d=physRollDetails(hero.stats,boss), r=roll(4,8); let base=d.inter+r; let note=`Backstab: (ATK ${d.atk}+d4 ${d.rand}) − DEF×0.6 ${d.defRed} = ${d.inter}; + d4-8 ${r} = ${base}`; const faster=hero.stats.spd>boss.spd; if(faster){ base=Math.floor(base*1.4); note+=' → Faster ×1.4'; } let crit=false; if(Math.random()<0.40){ base=Math.floor(base*1.9); crit=true; note+=' → CRIT ×1.9'; } if(boss.name==='Bigfoot, Forest Dweller'){ base=Math.max(1,base-3); note+=' − Fur 3'; } if(crit&&boss.name==='Chrome-Polished Knight'){ base=Math.ceil(base*CFG.CHROME_CRIT_REDUCE); note+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; } boss.hp=Math.max(0,boss.hp-base); log(`${note} ⇒ ${base} dmg.`); pulse('bossCard'); flash(); play('backstab',.95); if(crit&&boss.name==='Samurai General'&&boss.hp>0){ const c=Math.max(1,Math.floor(physDamage(boss,hero.stats)*0.60)); hero.hp=Math.max(0,hero.hp-c); log(`Iaido Counter! Samurai General cuts you for ${c}.`); shake('heroCard'); flash(); play('hurt',.8); setBars(); if(hero.hp<=0){ defeat(); return; } } abilityCooldown1=2; }
function ability_Rogue_GhostStrike(){ const d=physRollDetails(hero.stats,boss); let dmg=d.inter; let note=`Ghost Strike: (ATK ${d.atk}+d4 ${d.rand}) − DEF×0.6 ${d.defRed} = ${d.inter}`; if(tryCrit(hero.stats.crit)){ dmg=Math.floor(dmg*1.7); note+=' → CRIT ×1.7'; } boss.hp=Math.max(0,boss.hp-dmg); log(`${note} ⇒ ${dmg} dmg. Dodge up!`); pulse('bossCard'); flash(); play('ability',.9); if(ghostStrikeCharges>0) ghostStrikeCharges--; dodgeBuffTurns=Math.max(dodgeBuffTurns,2); abilityCooldown2=2; }

function tickCooldowns(){
  if(abilityCooldown1>0) abilityCooldown1--;
  if(abilityCooldown2>0) abilityCooldown2--;
  if(paladinImbueTurns>0) paladinImbueTurns--;
  setAbilityButtons();
  const costs=currentCosts();
  $('btnAbility1').disabled=abilityCooldown1>0||hero.mp<costs.a1;
  $('btnAbility2').disabled=abilityCooldown2>0||hero.mp<costs.a2;
}
function defeat(){ enableControls(false); log('💀 You have fallen... Click Reset to change class or Start to retry.'); }

/* Wire-up */
$('btnAttack').addEventListener('click',doAttack);
$('btnGuard').addEventListener('click',doGuard);
$('btnPotion').addEventListener('click',doPotion);
$('btnAbility1').addEventListener('click',doAbility1);
$('btnAbility2').addEventListener('click',doAbility2);
$('btnHaste').addEventListener('click',doHaste);
$('btnSlow').addEventListener('click',doSlow);
$('startBtn').addEventListener('click',()=>{ play('ui',.2); startAdventure(); });
$('resetBtn').addEventListener('click',()=>{ play('ui',.2); location.reload(); });
document.addEventListener('click',e=>{ if(e.target.tagName==='BUTTON' && !e.target.closest('#victoryOverlay')) play('ui',.15); });
$('btnContinueNG')?.addEventListener('click',()=>{ play('ui',.25); continueToNGPlus(); });
$('btnRestart')?.addEventListener('click',()=>{ play('ui',.25); location.reload(); });

drawClassCards();
(function autoPickDefault(){
  const first=document.querySelector('.class-card');
  if(first){
    const name=Object.keys(CLASSES)[0];
    selectClass(name,first);    // show hero portrait immediately
    // Do NOT spawn boss until Start is pressed
    resumeHeroBgm();
  }
})();
renderRoster();
