const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const totalEl = document.getElementById('total');
const timeEl = document.getElementById('time');
const livesEl = document.getElementById('lives');
const msg = document.getElementById('message');

const map = [
  '################',
  '#P....#.....T..#',
  '#.###.#.#####..#',
  '#...#.#.....#..#',
  '###.#.###.#.#.##',
  '#...#.....#.#..#',
  '#.#######.#.##.#',
  '#.....T...#....#',
  '#.###########.##',
  '#.....#.....#..#',
  '#####.#.###.#T.#',
  '#.....#...#....#',
  '#.#######.####.#',
  '#T......K......#',
  '#.############E#',
  '################'
];

const tile = 40;
let player, trash, key, exit, enemies, cleaned, hasKey, lives, startTime, won, gameOver;

function resetGame() {
  player = {x:1, y:1};
  trash = [];
  key = null;
  exit = null;
  enemies = [{x: 8, y: 7, dx: 1}, {x: 10, y: 11, dx: -1}];
  cleaned = 0;
  hasKey = false;
  lives = 3;
  won = false;
  gameOver = false;
  startTime = Date.now();
  for (let y=0; y<map.length; y++) {
    for (let x=0; x<map[y].length; x++) {
      const c = map[y][x];
      if (c === 'P') player = {x,y};
      if (c === 'T') trash.push({x,y, found:false});
      if (c === 'K') key = {x,y};
      if (c === 'E') exit = {x,y};
    }
  }
  totalEl.textContent = trash.length;
  msg.textContent = 'Clean all trash, find the key, then escape through the green exit!';
  updateHUD();
}

function isWall(x, y) { return map[y]?.[x] === '#'; }

function move(dx, dy) {
  if (won || gameOver) return;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!isWall(nx, ny)) {
    player.x = nx; player.y = ny;
    checkItems();
  }
  draw();
}

function checkItems() {
  trash.forEach(t => {
    if (!t.found && t.x === player.x && t.y === player.y) {
      t.found = true; cleaned++;
      msg.textContent = 'Nice! You cleaned one trash item.';
    }
  });
  if (key && !hasKey && cleaned === trash.length && key.x === player.x && key.y === player.y) {
    hasKey = true;
    msg.textContent = 'You got the key! Go to the green exit.';
  } else if (key && !hasKey && key.x === player.x && key.y === player.y) {
    msg.textContent = 'Clean all trash first, then pick up the key.';
  }
  if (exit.x === player.x && exit.y === player.y) {
    if (hasKey) {
      won = true;
      msg.textContent = '🎉 You escaped the maze and cleaned the ocean!';
    } else {
      msg.textContent = 'You need to clean all trash and collect the key first.';
    }
  }
  updateHUD();
}

function updateHUD() {
  scoreEl.textContent = cleaned;
  livesEl.textContent = lives;
  timeEl.textContent = Math.floor((Date.now() - startTime) / 1000);
}

function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*tile, y*tile, tile, tile);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y=0; y<map.length; y++) {
    for (let x=0; x<map[y].length; x++) {
      drawTile(x, y, map[y][x] === '#' ? '#075985' : '#dcfce7');
      ctx.strokeStyle = 'rgba(0,0,0,.08)';
      ctx.strokeRect(x*tile, y*tile, tile, tile);
    }
  }
  // exit
  drawTile(exit.x, exit.y, '#22c55e');
  ctx.fillStyle = 'white'; ctx.font = '24px Arial'; ctx.fillText('EXIT', exit.x*tile+3, exit.y*tile+27);
  // trash
  ctx.font = '26px Arial';
  trash.forEach(t => { if (!t.found) ctx.fillText('🗑️', t.x*tile+6, t.y*tile+30); });
  // key
  if (!hasKey && cleaned === trash.length) ctx.fillText('🔑', key.x*tile+6, key.y*tile+30);
  // enemies
  enemies.forEach(e => ctx.fillText('🐙', e.x*tile+6, e.y*tile+30));
  // player
  ctx.fillText('🤿', player.x*tile+6, player.y*tile+31);
  if (won || gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(70, 220, 500, 170);
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '30px Arial';
    ctx.fillText(won ? 'YOU WIN!' : 'GAME OVER', 320, 285);
    ctx.font = '20px Arial'; ctx.fillText(msg.textContent, 320, 325);
    ctx.textAlign = 'left';
  }
}

function enemyMove() {
  if (won || gameOver) return;
  enemies.forEach(e => {
    const nx = e.x + e.dx;
    if (isWall(nx, e.y)) e.dx *= -1; else e.x = nx;
    if (e.x === player.x && e.y === player.y) {
      lives--;
      player = {x:1, y:1};
      msg.textContent = 'Ouch! Octopus touched you. You lost 1 life.';
      if (lives <= 0) { gameOver = true; msg.textContent = 'Game over! Try again.'; }
      updateHUD();
    }
  });
  draw();
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') move(0,-1);
  if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') move(0,1);
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') move(-1,0);
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') move(1,0);
});
['up','down','left','right'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    if (id === 'up') move(0,-1);
    if (id === 'down') move(0,1);
    if (id === 'left') move(-1,0);
    if (id === 'right') move(1,0);
  });
});
document.getElementById('restart').addEventListener('click', resetGame);
setInterval(() => { updateHUD(); }, 1000);
setInterval(enemyMove, 700);
resetGame(); draw();
