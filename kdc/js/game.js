/* ===== Config (slightly easier) ===== */
const CFG = {
  BOSS_HP_SCALE_STEP: 0.255, // ~15% easier than 0.30
  NG_PLUS_MULT: 0.30,
  POTION_MIN_PCT: 25,
  POTION_MAX_PCT: 50,
  CHROME_CRIT_REDUCE: 0.65,
  DRAGON_BREATH_BONUS_MAG: 6,
  LOW_HP_THRESHOLD: 0.25
};

/* ===== SFX + BGM ===== */
function loadSfx(map){ const out={}; for (const [k,src] of Object.entries(map)){ const a=new Audio(); a.preload='auto'; a.src=src; out[k]=a; } return out; }
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
function play(k,vol=1){ const a=SFX[k]; if(!a) return; const b=a.cloneNode(); b.volume=vol; b.play().catch(()=>{}); }

const BGM_CHOICES = {
  Warrior: ['assets/sfx/Warrior-Theme-Song.mp3','assets/sfx/Waror-Theme-Song.mp3'],
  Mage:    ['assets/sfx/Mage-Theme-Song.mp3'],
  Paladin: ['assets/sfx/Paladin-Theme-Song.mp3'],
  Priest:  ['assets/sfx/Priest-Theme-Song.mp3'],
  Rogue:   ['assets/sfx/Rogue-Theme-Song.mp3'],
  Victory: ['assets/sfx/Victory-Theme.wav']
};
let bgm=null;
function stopBgm(){ if(bgm){ bgm.pause(); bgm=null; } }
function playBgm(name){
  const list=BGM_CHOICES[name]; if(!list) return; stopBgm(); let i=0;
  const tryNext=()=>{ if(i>=list.length) return; const src=list[i++]; bgm=new Audio(src); bgm.loop=(name!=='Victory'); bgm.volume=(name!=='Victory')?0.35:0.8; bgm.addEventListener('error',tryNext,{once:true}); bgm.play().catch(tryNext); };
  tryNext();
}
function resumeHeroBgm(){ if(hero) playBgm(hero.className); }
/* unlock audio */
let audioUnlocked=false;
function unlockAudio(){ if(audioUnlocked) return; audioUnlocked=true; try{ const C=window.AudioContext||window.webkitAudioContext; if(C){ const ac=new C(); ac.resume?.(); const o=ac.createOscillator(), g=ac.createGain(); g.gain.value=0.0001; o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime+0.01);} }catch{} }

/* ===== Data ===== */
const CLASSES = {
  Warrior:{ hp:120, mp:20, atk:14, mag:4,  def:8,  spd:6,  crit:15, ability:'Power Strike' },
  Mage:   { hp:80,  mp:60, atk:6,  mag:16, def:4,  spd:7,  crit:18, ability:'Fireball' },
  Paladin:{ hp:110, mp:35, atk:12, mag:6,  def:10, spd:5,  crit:14, ability:'Divine Guard' },
  Priest: { hp:90,  mp:70, atk:5,  mag:14, def:6,  spd:6,  crit:16, ability:'Heal' },
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
  'Fireball':'Ability_Icons/Fire-ball.jpg',
  'Divine Guard':'Ability_Icons/Divine_Sheild.webp',
  'Heal':'Ability_Icons/Heal.jpg',
  'Divine Smite':'Ability_Icons/Heal.jpg',
  'Backstab':'Ability_Icons/Back-Stab.jpg'
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

/* ===== State ===== */
let hero=null, bossIndex=0, boss=null, abilityCooldown=0;
let heroStunned=0, bossTurnCount=0, allyBloodKnight=false;
let level=1, sanctuaryTurns=0, extraTurns=0, skipBossTurns=0;
let heroVulnerableTurns=0, mageDoubleCastAvailable=false, priestSmiteAvailable=false, priestHolyStrike=true;
let classLocked=false, ngPlus=0;

/* ===== DOM + FX ===== */
const $=id=>document.getElementById(id);
const log=m=>{ const p=document.createElement('p'); p.textContent=m; $('log').appendChild(p); $('log').scrollTop=$('log').scrollHeight; };
const updateLevelTag=()=>{const e=$('levelTag'); if(e) e.textContent=String(level);};
const updateNGPTag=()=>{const e=$('ngpTag'); if(e) e.textContent=`NG+: ${ngPlus}`;};
const setHeroTitle=name=>{ $('heroName').innerHTML=`<span class="hero-icon big-hero" style="background-image:url('${HERO_ICONS[name]||''}')"></span> ${name} (Lv.${level})`; };

function setAbilityButton(label,tip){ const p=ABILITY_ICONS[label]||''; $('btnAbility').innerHTML=(p?`<span class="btn-icon" style="background-image:url('${p}')"></span>`:'')+`✨ ${label}`; $('btnAbility').title=tip||'Class ability'; }
function updateAbilityLabel(){
  if(!hero) return;
  let label=CLASSES[hero.className].ability, tip='';
  switch(hero.className){
    case 'Warrior': tip='Power Strike (double swing; you take +10% on next enemy hit)'; break;
    case 'Mage': tip= mageDoubleCastAvailable ? 'Fireball (your next cast fires twice)' : 'Fireball (magic)'; break;
    case 'Paladin': tip='Divine Guard (holy spear + small self-heal)'; break;
    case 'Priest':
      label = priestSmiteAvailable ? 'Divine Smite' : 'Heal';
      tip = priestSmiteAvailable ? 'One-time heavy holy blast' : 'Restore a large chunk of HP';
      break;
    case 'Rogue': tip='Backstab (dual strike with high crit scaling)'; break;
  }
  setAbilityButton(label, tip);
  $('btnAttack').title=(hero.className==='Priest')?'Basic attack (+7 holy damage on hit).':'Basic physical hit that can crit.';
}
function shake(id){ const el=$(id); if(!el) return; el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),200); }
function pulse(id){ const el=$(id); if(!el) return; el.classList.add('pulse'); setTimeout(()=>el.classList.remove('pulse'),200); }
function flash(){ const f=$('hitFlash'); if(!f) return; f.classList.remove('show'); void f.offsetWidth; f.classList.add('show'); }

const percent=(c,m)=>Math.max(0,Math.min(100,Math.round(c/m*100)));
const roll=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const critChance=b=>Math.min(60,b);
const tryCrit=b=>Math.random()*100<critChance(b);
const tryDodge=(as,ds)=>{const d=ds-as; const ch=Math.max(0,Math.min(35,5+d*2)); return Math.random()*100<ch;};
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
    <div style="grid-column:1/-1; color:#aab1da">${s.flavor||''}</div>
    <div style="grid-column:1/-1; color:#ffd">Passive: <b>${s.passive||'—'}</b></div>`;
}
function enableControls(on){
  ['btnAttack','btnAbility','btnGuard','btnPotion','btnHaste','btnSlow'].forEach(id=>$(id).disabled=!on);
  const need=abilityCost(hero.className);
  $('btnAbility').disabled=!on||abilityCooldown>0||hero.mp<need;
  if(on){ $('btnHaste').disabled=hero.hastePotions<=0; $('btnSlow').disabled=hero.slowBombs<=0; }
  updateAbilityLabel();
}

/* Background switching */
function setBossBackground(img){
  const body=document.body;
  if(img) body.style.background=`linear-gradient(180deg, rgba(5,8,20,.86), rgba(5,8,20,.92)), url("${img}") center / cover fixed no-repeat`;
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
function abilityCost(n){
  // 10% cheaper than before: 10→9, 15→14, 12→11, 10→9, 8→7
  switch(n){
    case 'Warrior': return 9;
    case 'Mage':    return 14;
    case 'Paladin': return 11;
    case 'Priest':  return 9;
    case 'Rogue':   return 7;
    default: return 10;
  }
}
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

/* Class select */
function drawClassCards(){
  const list=$('classList'); list.innerHTML='';
  Object.entries(CLASSES).forEach(([name,s])=>{
    const div=document.createElement('div'); div.className='class-card'; div.tabIndex=0; div.title=`Select ${name}`;
    // show doubled MP in the picker (since we double in-game)
    div.innerHTML=`
      <div class="class-title"><span class="hero-icon" style="background-image:url('${HERO_ICONS[name]||''}')"></span>${name}</div>
      <div class="stats">
        <div>HP: <b>${s.hp}</b></div><div>MP: <b>${s.mp*2}</b></div>
        <div>ATK: <b>${s.atk}</b></div><div>MAG: <b>${s.mag}</b></div>
        <div>DEF: <b>${s.def}</b></div><div>SPD: <b>${s.spd}</b></div>
        <div>CRIT: <b>${s.crit}%</b></div><div>Ability: <b>${s.ability}</b></div>
      </div>`;
    const choose=()=>{ if(selectClass(name,div)!==false){ unlockAudio(); play('ui',.2); playBgm(name); } };
    div.addEventListener('click', choose);
    div.addEventListener('keypress', e=>{ if(e.key==='Enter') choose(); });
    list.appendChild(div);
  });
}
function selectClass(name, elem){
  if(classLocked&&hero){ log('🔒 Class selection is locked for this run. Reset to change class.'); $('classList')?.classList.add('shake'); setTimeout(()=>$('classList')?.classList.remove('shake'),200); return false; }
  document.querySelectorAll('.class-card').forEach(c=>c.classList.remove('selected'));
  elem?.classList.add('selected');
  const base=CLASSES[name];
  hero={
    className:name, stats:{...base},
    maxHp:base.hp,
    maxMp:base.mp*2,   // doubled MP pool
    hp:base.hp,
    mp:base.mp*2,      // doubled MP pool
    potions:6, hastePotions:1, slowBombs:1, guard:false
  };
  level=1; updateLevelTag(); updateNGPTag(); setHeroTitle(name);
  abilityCooldown=0; sanctuaryTurns=0; heroVulnerableTurns=0;
  mageDoubleCastAvailable=(name==='Mage'); priestSmiteAvailable=(name==='Priest'); priestHolyStrike=(name==='Priest');

  const hArt=$('heroArt'), heroImg=HERO_ICONS[name];
  if(heroImg){ hArt.removeAttribute('hidden'); hArt.style.backgroundImage=`url('${heroImg}')`; } else { hArt.setAttribute('hidden',''); hArt.style.backgroundImage=''; }

  updateAbilityLabel(); renderHeroStats(); setBars();
}

function startAdventure(){
  if(!hero){ alert('Choose a class first!'); return; }
  unlockAudio(); resumeHeroBgm();
  classLocked=true; $('classList')?.classList.add('locked');
  $('startBtn')?.setAttribute('disabled','');
  bossIndex=0; allyBloodKnight=false; level=1; ngPlus=0; updateLevelTag(); updateNGPTag();
  nextBoss();
}
window.addEventListener('pointerdown', function initOnce(){ unlockAudio(); resumeHeroBgm(); window.removeEventListener('pointerdown', initOnce); }, {once:true});

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
  bossTurnCount=0; heroVulnerableTurns=0; mageDoubleCastAvailable=(hero.className==='Mage'); priestSmiteAvailable=(hero.className==='Priest'); updateAbilityLabel();

  $('bossName').textContent=boss.name;
  $('encounter').textContent=`${bossIndex+1} / ${BOSSES.length}`;
  $('difficulty').textContent=ngPlus>0? `${['Story','Normal','Challenging','Hard','Very Hard','Boss'][bossIndex]||'Epic'} • NG+${ngPlus}` : (['Story','Normal','Challenging','Hard','Very Hard','Boss'][bossIndex]||'Epic');
  $('log').innerHTML=''; log(`A wild ${boss.name} appears! ${boss.flavor||''}`);
  if(b.name==='Bigfoot, Forest Dweller') play('appearBigfoot',.9);
  if(b.name==='The Blood-Stained Knight') play('appearBloodKnight',.9);

  const art=$('bossArt'); if(boss.img){ art.removeAttribute('hidden'); art.style.backgroundImage=`url('${boss.img}')`; } else { art.setAttribute('hidden',''); art.style.backgroundImage=''; }
  renderBossStats(); setBars(); applyBackground(); enableControls(true); renderRoster(); updateRoster();
}
function grantBossDrop(n){ const d=BOSS_DROPS[n]; if(!d) return; d.apply(hero); renderHeroStats(); setBars(); log(`🎁 Drop acquired: ${d.name} (${d.msg}).`); }

function showVictoryOverlay(){
  $('ngNext').textContent=String(ngPlus+1);
  $('runSummary').textContent=`${hero.className} • Level ${level} • NG+${ngPlus} — drops & perks carry forward.`;
  const cf=$('confetti'); cf.innerHTML=''; for(let i=0;i<60;i++){ const e=document.createElement('i'); e.style.left=Math.random()*100+'%'; e.style.animationDelay=(Math.random()*1.8)+'s'; e.style.setProperty('--h',Math.floor(Math.random()*360)); cf.appendChild(e); }
  $('victoryOverlay').hidden=false; play('victory',.9); playBgm('Victory'); enableControls(false);
}
function continueToNGPlus(){ $('victoryOverlay').hidden=true; ngPlus+=1; updateNGPTag(); bossIndex=0; hero.hp=hero.maxHp; hero.mp=hero.maxMp; log(`🌟 New Game Plus ${ngPlus} begins! Bosses are ${Math.round(CFG.NG_PLUS_MULT*100)}% stronger.`); resumeHeroBgm(); nextBoss(); }

/* Turn flow */
function endTurn(){
  if(boss.hp>0){
    if(extraTurns>0){ extraTurns--; enableControls(true); tickCooldown(); return; }
    if(skipBossTurns>0){ skipBossTurns--; log('🧊 The enemy loses their turn!'); enableControls(true); tickCooldown(); return; }
    setTimeout(bossAct,350);
  } else {
    log(`✅ ${boss.name} is defeated!`); enableControls(false);
    grantBossDrop(boss.name);
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
  if(allyBloodKnight && bossIndex>=4 && boss.hp>0){
    const assist=roll(8,14); boss.hp=Math.max(0,boss.hp-assist);
    log(`🛡️ The Blood-Stained Knight assists for ${assist} damage!`);
    setBars(); if(boss.hp<=0){ endTurn(); return; }
  }
  if(boss.name==='Dragon Blade' && bossTurnCount%3===2) log('🔥 The dragon gathers flames…');

  const dragon=(boss.name==='Dragon Blade') && (bossTurnCount%3===0);
  const berserk=(boss.name==='Zerker Viking') && (boss.hp<=boss.maxHp/2) && (Math.random()<0.5);

  bossSwing(dragon);
  if(berserk && hero.hp>0){ log('Berserk fury! The Viking swings again!'); bossSwing(false); }
  if(hero.hp<=0){ defeat(); } else { enableControls(true); tickCooldown(); }
}
function bossSwing(isBreath){
  if(tryDodge(boss.spd,hero.stats.spd) && !isBreath){ log(`${hero.className} dodges the attack!`); return; }
  let dmg;
  if(isBreath){ dmg=magicDamage({mag:boss.atk+CFG.DRAGON_BREATH_BONUS_MAG},hero.stats)+roll(6,10); log('🔥 Dragon’s Breath erupts!'); play('breath',.9); }
  else{ dmg=physDamage(boss,hero.stats); if(Math.random()*100<boss.crit){ dmg=Math.floor(dmg*1.6); log('The boss lands a CRITICAL hit!'); play('crit',.9); } if(hero.guard) dmg=Math.floor(dmg*0.5); play('hurt',.8); }
  if(sanctuaryTurns>0){ dmg=Math.floor(dmg*0.8); sanctuaryTurns--; }
  if(heroVulnerableTurns>0){ dmg=Math.floor(dmg*1.10); heroVulnerableTurns=0; log('🩸 Reeling from Power Strike: +10% damage taken.'); }
  hero.hp=Math.max(0,hero.hp-dmg); log(`${boss.name} hits you for ${dmg} damage.`); hero.guard=false; shake('heroCard'); flash(); setBars();
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
    if(hero.className==='Priest'&&priestHolyStrike){ dmg+=7; note+=' + Holy 7'; play('holy',.7); }
    boss.hp=Math.max(0,boss.hp-dmg); log(`${note} ⇒ ${dmg} dmg.`); pulse('bossCard'); flash(); play(crit?'crit':'hit',.9);
    if(crit&&boss.name==='Samurai General'&&boss.hp>0){ const c=Math.max(1,Math.floor(physDamage(boss,hero.stats)*0.60)); hero.hp=Math.max(0,hero.hp-c); log(`Iaido Counter! Samurai General cuts you for ${c}.`); shake('heroCard'); flash(); play('hurt',.8); setBars(); if(hero.hp<=0){ defeat(); return; } }
  }
  setBars(); endTurn();
}
function doGuard(){ if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; } enableControls(false); hero.guard=true; log('You raise your guard, reducing next damage by 50%.'); play('ability',.5); endTurn(); }
function doPotion(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  if(hero.potions<=0){ log('No potions left!'); return; }
  enableControls(false); hero.potions--;
  const pct=roll(CFG.POTION_MIN_PCT,CFG.POTION_MAX_PCT), healHp=Math.max(1,Math.floor(hero.maxHp*pct/100)), healMp=Math.max(1,Math.floor(hero.maxMp*pct/100));
  hero.hp=Math.min(hero.maxHp,hero.hp+healHp); hero.mp=Math.min(hero.maxMp,hero.mp+healMp);
  renderHeroStats(); setBars(); log(`🧪 Potion heals ${healHp} HP and ${healMp} MP (${pct}% of max).`); play('potion',.8); endTurn();
}
function doHaste(){ if(hero.hastePotions<=0){ log('No haste potions left!'); return; } enableControls(false); hero.hastePotions--; extraTurns+=2; if(abilityCooldown>0) abilityCooldown--; renderHeroStats(); log('⚡ You chug a haste potion! You act twice more instantly.'); play('ability',.6); enableControls(true); tickCooldown(); }
function doSlow(){ if(hero.slowBombs<=0){ log('No slow bombs left!'); return; } enableControls(false); hero.slowBombs--; skipBossTurns=Math.max(skipBossTurns,1); if(boss&&boss.name==='Dragon Blade'){ bossTurnCount=0; } renderHeroStats(); log('🧊 You hurl a slow bomb! The enemy’s next turn is cancelled and buildups are disrupted.'); play('ability',.6); endTurn(); }
function doAbility(){
  if(heroStunned>0){ heroStunned=0; log('🌀 You are stunned and lose your turn!'); endTurn(); return; }
  const need=abilityCost(hero.className); if(hero.mp<need||abilityCooldown>0) return; enableControls(false); hero.mp-=need;
  switch(hero.className){
    case 'Warrior':{
      const d1=physRollDetails(hero.stats,boss); let h1=d1.inter; let n1=`Power Strike #1: (ATK ${d1.atk}+d4 ${d1.rand}) − DEF×0.6 ${d1.defRed} = ${h1}`; if(boss.name==='Bigfoot, Forest Dweller'){ h1=Math.max(1,h1-3); n1+=' − Fur 3'; } if(tryCrit(hero.stats.crit)){ h1=Math.floor(h1*1.8); n1+=' → CRIT ×1.8'; if(boss.name==='Chrome-Polished Knight'){ h1=Math.ceil(h1*CFG.CHROME_CRIT_REDUCE); n1+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; } } boss.hp=Math.max(0,boss.hp-h1); log(`${n1} ⇒ ${h1} dmg.`); pulse('bossCard'); flash(); play('hit',.9);
      if(boss.hp>0){ const d2=physRollDetails(hero.stats,boss); let h2=d2.inter; let n2=`Power Strike #2: (ATK ${d2.atk}+d4 ${d2.rand}) − DEF×0.6 ${d2.defRed} = ${h2}`; if(boss.name==='Bigfoot, Forest Dweller'){ h2=Math.max(1,h2-3); n2+=' − Fur 3'; } if(tryCrit(hero.stats.crit)){ h2=Math.floor(h2*1.8); n2+=' → CRIT ×1.8'; if(boss.name==='Chrome-Polished Knight'){ h2=Math.ceil(h2*CFG.CHROME_CRIT_REDUCE); n2+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; } } boss.hp=Math.max(0,boss.hp-h2); log(`${n2} ⇒ ${h2} dmg.`); pulse('bossCard'); flash(); play('hit',.9); }
      heroVulnerableTurns=1; log('🩸 Drawback: you will take +10% damage on the next enemy hit.'); abilityCooldown=2; break; }
    case 'Mage':{
      const cast=()=>{ const d=magicRollDetails(hero.stats,boss), k=roll(6,10); let total=d.inter+k; let note=`Fireball: (MAG ${d.mag}+d2-6 ${d.rand}) − DEF×0.3 ${d.defRed} = ${d.inter}; + d6-10 ${k} = ${total}`; boss.hp=Math.max(0,boss.hp-total); log(`${note} dmg.`); pulse('bossCard'); flash(); play('fire',.9); };
      cast(); if(mageDoubleCastAvailable&&boss.hp>0){ mageDoubleCastAvailable=false; updateAbilityLabel(); log('🔁 Double Cast triggers!'); cast(); } abilityCooldown=2; break; }
    case 'Paladin':{
      const d=magicRollDetails({mag:hero.stats.mag+6},boss), extra=roll(4,8); let dmg=d.inter+extra; let note=`Divine Guard: (MAG ${hero.stats.mag}+6 + d2-6 ${d.rand}) − DEF×0.3 ${d.defRed} = ${d.inter}; + d4-8 ${extra} = ${dmg}`; boss.hp=Math.max(0,boss.hp-dmg); log(`${note} dmg.`); pulse('bossCard'); flash(); play('holy',.9); const heal=12; hero.hp=Math.min(hero.maxHp,hero.hp+heal); log(`You are bathed in light and heal ${heal} HP.`); abilityCooldown=3; break; }
    case 'Priest':{
      if(priestSmiteAvailable){ priestSmiteAvailable=false; updateAbilityLabel(); const d=magicRollDetails({mag:hero.stats.mag+4},boss), ex=roll(8,12); let dmg=d.inter+ex; let note=`Divine Smite: (MAG ${hero.stats.mag}+4 + d2-6 ${d.rand}) − DEF×0.3 ${d.defRed} = ${d.inter}; + d8-12 ${ex} = ${dmg}`; boss.hp=Math.max(0,boss.hp-dmg); log(`${note} dmg.`); pulse('bossCard'); flash(); play('smite',.9); } else { const heal=24+Math.floor(hero.stats.mag*0.8)+roll(0,6)+5; hero.hp=Math.min(hero.maxHp,hero.hp+heal); log(`Heal restores ${heal} HP.`); play('holy',.7); } abilityCooldown=2; break; }
    case 'Rogue':{
      const d=physRollDetails(hero.stats,boss), r=roll(4,8); let base=d.inter+r; let note=`Backstab: (ATK ${d.atk}+d4 ${d.rand}) − DEF×0.6 ${d.defRed} = ${d.inter}; + d4-8 ${r} = ${base}`; const faster=hero.stats.spd>boss.spd; if(faster){ base=Math.floor(base*1.6); note+=' → Faster ×1.6'; } let crit=false; if(Math.random()<0.40){ base=Math.floor(base*1.8); crit=true; note+=' → CRIT ×1.8'; } if(boss.name==='Bigfoot, Forest Dweller'){ base=Math.max(1,base-3); note+=' − Fur 3'; } if(crit&&boss.name==='Chrome-Polished Knight'){ base=Math.ceil(base*CFG.CHROME_CRIT_REDUCE); note+=` → Chrome ×${CFG.CHROME_CRIT_REDUCE}`; } base*=2; note+=' ⇒ Dual Strike ×2'; boss.hp=Math.max(0,boss.hp-base); log(`${note} ⇒ ${base} dmg.`); pulse('bossCard'); flash(); play('backstab',.95); if(crit&&boss.name==='Samurai General'&&boss.hp>0){ const c=Math.max(1,Math.floor(physDamage(boss,hero.stats)*0.60)); hero.hp=Math.max(0,hero.hp-c); log(`Iaido Counter! Samurai General cuts you for ${c}.`); shake('heroCard'); flash(); play('hurt',.8); setBars(); if(hero.hp<=0){ defeat(); return; } } abilityCooldown=2; break; }
  }
  setBars(); endTurn();
}
function tickCooldown(){ if(abilityCooldown>0) abilityCooldown--; const need=abilityCost(hero.className); $('btnAbility').disabled=abilityCooldown>0||hero.mp<need; updateAbilityLabel(); }
function defeat(){ enableControls(false); log('💀 You have fallen... Click Reset to change class or Start to retry.'); }

/* Wire-up */
$('btnAttack').addEventListener('click',doAttack);
$('btnGuard').addEventListener('click',doGuard);
$('btnPotion').addEventListener('click',doPotion);
$('btnAbility').addEventListener('click',doAbility);
$('btnHaste').addEventListener('click',doHaste);
$('btnSlow').addEventListener('click',doSlow);
$('startBtn').addEventListener('click',()=>{ play('ui',.2); startAdventure(); });
$('resetBtn').addEventListener('click',()=>{ play('ui',.2); location.reload(); });
document.addEventListener('click',e=>{ if(e.target.tagName==='BUTTON' && !e.target.closest('#victoryOverlay')) play('ui',.15); });
$('btnContinueNG')?.addEventListener('click',()=>{ play('ui',.25); continueToNGPlus(); });
$('btnRestart')?.addEventListener('click',()=>{ play('ui',.25); location.reload(); });

drawClassCards();
(function autoPickDefault(){ const first=document.querySelector('.class-card'); if(first){ const name=Object.keys(CLASSES)[0]; selectClass(name,first); }})();
renderRoster();
