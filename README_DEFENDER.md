# SAO-ĐÊM: Defender Mini-Game Development Guide

This document summarizes the architecture and implementation details for the "Defender" mini-game within the SAO-ĐÊM project. Use this as a reference for adding new heroes, balancing mechanics, or debugging.

## 🕹 Project Overview
- **File**: `defender.html` (Monolithic file containing HTML, CSS, and JS).
- **Engine**: Custom 2D Canvas engine (60 FPS).
- **Core Loop**: `gameLoop()` handles `update()` and `draw()` for all entities (Heroes, Enemies, Projectiles, SerumZones, etc.).

---

## 🦸 Hero Implementation Guide

To add a new hero, follow these steps:

### 1. Define the Recruit Card
In `BUFF_LIST`, add a recruitment entry. The `id` must start with `recruit_`.
```javascript
{ 
  id: 'recruit_newhero', 
  recruit: true, 
  name: 'Recruit: New Hero', 
  nameVn: 'Chiêu mộ: Hero Mới', 
  desc: 'Adds New Hero to the front line.', 
  descVn: 'Thêm Hero Mới vào đội hình.', 
  icon: 'fa-user-plus', 
  minLevel: 1, 
  action: (h) => spawnHero('NewHero') 
}
```

### 2. Configure Hero Stats & Logic
Inside the `Hero` class constructor, add a case for your hero's unique stats:
- **`fireRateDelay`**: Frames between shots (60 = 1s).
- **`bulletCount`**: Number of bullets per shot/burst.
- **`damageMult`**: Base damage multiplier.
- **`drawScale`**: Sprite size adjustment.
- **`yOffset`**: Visual alignment on the barrier.

### 3. Handle Firing Mechanics
Modify `Hero.fire()` and `Hero.update()`:
- **Shotgun style (Mit)**: Spawns multiple projectiles with `angleVar`.
- **Burst style (ThayBach)**: Uses `burstRemaining` and `burstTimer` to fire sequentially.
- **Shot Counting**: Use `this.shotCount` to track hits/shots for passive triggers.

### 4. Implement Passives (Shout Text)
Passives usually trigger in `Hero.update()`. Use `this.shoutTimer` and `this.shoutText` to display floating labels over the hero's head.
- **Mit**: Every 20 shots -> `Double Shoot!`.
- **ThayBach**: Every 10 bursts -> `OVERDRIVE!` (30+ bullets).
- **Silver Hand**: Every 20 shots -> `Serum!`.

### 5. Add Hero-Specific Buffs
Add cards to `BUFF_LIST` with `owner: 'HeroName'`. These will only appear if that hero is currently active.
```javascript
{ 
  id: 'newhero_buff', 
  owner: 'NewHero', 
  name: 'Power Up', 
  action: (h) => h.stats.damageMult += 0.5 
}
```

### 6. Update Hero Roster UI
Add a new `hero-card-info` div inside `#heroListPanel`.
- Use `data-en` and `data-vn` for all text to support bilingual switching.
- Add a portrait in `assets/img/defender/avatar_character/avatar/`.
- Register the hero colors in CSS.

---

## 🛠 Current Systems & Constraints

### 📏 Orientation Guard (Mobile)
- Game auto-pauses if `width > height` or `height < 500px` on mobile devices.
- Uses `env(safe-area-inset-bottom)` for UI positioning.

### 👥 Slot System
- **Max Heroes**: 3. 
- Once 3 heroes are active, `recruit_` cards are automatically filtered out of the buff pool.

### 🧪 Serum Mechanic (Silver Hand)
- Area-of-Effect (AoE) zone that slows (60%) and deals DoT.
- Damage scales: `baseDamage * (1 + (level-1) * 0.15)`.

### 💥 Knockback Physics
- Direct pixel-nudging: `this.y - knockback`.
- Bosses take 30% knockback; regular zombies take 100%.

---

## 📁 Key Asset Paths
- **Sprites**: `assets/img/defender/` (3xN grid format).
- **Avatars**: `assets/img/defender/avatar_character/avatar/`.
- **Audio**: `assets/audio/defender/`.
