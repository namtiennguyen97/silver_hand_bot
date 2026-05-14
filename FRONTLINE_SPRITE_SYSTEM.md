# 🐈 Frontline Sprite System: High-Res Pipeline

*This document notes the professional workflow for handling Frontline's high-fidelity sprite assets.*

## 1. Source Data Structure
Custom high-quality sprites are stored in `assets/sprite/frontline/`.
Each action has its own directory containing:
- `sprite-max-px-frames-36-rows-6-cols-6.png`: A high-res sprite sheet (usually 3660x2580px).
- `sprite-max-px-frames-36-rows-6-cols-6.json`: Atlas metadata for individual frames (usually 610x430px).

**Available Actions:**
- `idle`, `running`, `jumping`, `holding_aim`, `shooting_in_the_air`.

## 2. Assembly Pipeline (`assemble_master.js`)
To integrate these into the game, we use an assembly script that:
1.  **Reads metadata**: Parses the `.json` to get exact frame coordinates.
2.  **Smart Frame Selection**: Since source files have 36 frames, we pick **8 frames** evenly (indices: `0, 5, 10, 15, 20, 25, 30, 35`) to match the game engine's 8-column standard.
3.  **Transparency & Background Removal**:
    - Removes solid black background (`avg < 30`).
    - Removes pure white tiles (`avg > 230` with neutrality check to preserve silver hair/white suit).
4.  **Standardization**: Resizes and centers each character into a **256x256px** high-res grid cell.
5.  **Output**: Generates `assets/img/defender/frontline_master.png`.

## 3. Game Integration (`frontline.html`)
The game engine uses the following `CONFIG` and `STATES` for this system:

```javascript
sprite: {
    path: 'assets/img/defender/frontline_master.png',
    cellW: 256,
    cellH: 256,
    cols: 8
}

const STATES = {
    RUN:        { row: 0, frames: 8 },
    IDLE:       { row: 1, frames: 8 },
    IDLE_SHOOT: { row: 2, frames: 8 },
    RUN_SHOOT:  { row: 2, frames: 8 },
    JUMP_SHOOT: { row: 3, frames: 8 },
    JUMP:       { row: 4, frames: 8 }
};
```

## 4. Maintenance
- **Adding new actions**: Create a folder in `assets/sprite/frontline/`, update the `actions` array in `assemble_master.js`, and update `STATES` in the game.
- **Improving Quality**: If 8 frames is not enough, increase `cols` in `CONFIG` and adjust the frame selection indices in `assemble_master.js`.

---
*Last updated: 14/05/2026 - Optimized for High-Res Custom Assets.*
