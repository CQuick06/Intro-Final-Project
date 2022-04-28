kaboom({
  scale: 1,
  background: [0,0,0],
});
loadSpriteAtlas("https://kaboomjs.com/sprites/dungeon.png", "atlas.json");
loadSprite("hearts", "heart.png")

const levelConfig = {
  width: 16,
  height: 16,
  pos: vec2(32, 32),
  w: () => ["wall", sprite("wall"), area(), solid()],
  b: () => ["barrier", sprite("wall"), area(), solid(), opacity(1)],
  o: () => [
    "enemy",
    sprite("ogre", {
      anim: "run",
    }),
    area({
      scale: 0.7,
    }),
    origin("center"),
    {
      xVel: 25,
    },
  ],
  D: () => [
    "door",
    sprite("closed_door"),
    area({
      scale: 0.6,
    }),
    solid(),
    origin("right"),
  ],
    s: () => [
    "sword",
    sprite("sword",{
      width:10,
      height:20
    }),
    area({
      scale: 0.6,
    }),
    solid(),
    origin("right"),
  ],
  c: () => [
    "chest",
    sprite("chest"),
    area({
      scale: 0.6,
    }),
    solid(),
    origin("top"),
  ],
   $: () => [
    "coin",
    sprite("coin",{
      anim: "spin",
    }),
    area({
      scale: 0.6,
    }),
    solid(),
    origin("top"),
  ],
};

const levels = [
  [
    "                D",
    "w       $   wwwww",
    "w      wwww w",
    "w           w",
    "w         s w",
    "wwwww   wwwww",
    "w           w",
    "b $$  o    cb ",
    "wwwwwwwwwwwww ",
  ],
  [ "                   $$           ",
    " $                www  $ $",
    "w   c      wwwwww     wwww $   D",
    "w  www      w              wwww",
    "w           w",
    "w   s  b $o$b",
    "wwwww  wwwwww",
    "w           w",
    "b  $$     o b ",
    "wwwwwwwbwwwww ",
  ],
];

let levelNum = 0;

scene("game", () => {

  let hp = 3;

  let score = 0;
  
  let hasKey = false;

  const level = addLevel(levels[levelNum], levelConfig);

  const hpLabel = add([
    text("HP:" + hp, {
      size: 25,
    }),
      pos(),
     fixed()
  ]);
  
  const scoreLabel = add([
    text("Score:"+score, {
      size: 25,
    }),
       pos(500,0),
    fixed(),
  ])

  const player = add([
    sprite("hero"),
    pos(level.getPos(2, 0)),
    area({ scale: 0.5 }),
    solid(),
    origin("bot"),
    body(),
    {
      speed: 150,
      jumpSpeed: 400,
    },
  ]);
  player.play("idle");

  onUpdate("enemy", (e) => {
    e.move(e.xVel, 0);
  });

  onCollide("enemy", "barrier", (e, b) => {
    e.xVel = -e.xVel;
    if (e.xVel < 0) {
      e.flipX(true);
    } else {
      e.flipX(false);
    }
  });

  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(player.jumpSpeed);
      player.play("hit");
    }
    player.onCollide("wall", () => {
      player.play("idle");
    });
  });
  onKeyPress("down", () => {
    player.jump(-player.jumpSpeed);
  });

  onKeyDown("right", () => {
    player.move(player.speed, 0);
    player.flipX(false);
  });

  onKeyDown("left", () => {
    player.move(-player.speed, 0);
    player.flipX(true);
  });

  onKeyPress(["right", "left"], () => {
    player.play("run");
  });
  onKeyRelease(["right", "left"], () => {
    player.play("idle");
  });

  player.onCollide("enemy", () => {
    addKaboom(player.pos);
    hp--;
    hpLabel.text = "HP:" + hp;
    if (hp == 0) {
      destroy(player);
      wait(0.5, () => {
        go("lose");
      });
    }
  });

  player.onCollide("chest", (c) => {
    c.play("open");
    hasKey = true;
  });

  player.onCollide("door", () => {
    if (hasKey) {
      if (levelNum == levels.length - 1) {
        go("win");
      } else {
        levelNum++;
        localStorage.setItem("level", levelNum);
        go("game");
      }
    }
  });
  
  player.onCollide("coin", ($)=>{
    destroy($);
    score+=10;
    scoreLabel.text = "Score:" + score;
  })
  
  add([
    rect(width(),15),
    "killbox",
    color(255,0,0),
    pos(0,height()-15),
    area(),
    solid()
  ])
  player.onCollide("killbox",()=>{
    destroy(player),
    go("lose")
  })

}); //CLOSE game

scene("menu", () => {
  add([text("Dragon World"), pos(width() / 2, height() / 2), origin("center")]);
  add([
    area(),
    "playButton",
    text("PLAY"),
    pos(width() / 2, height() / 2 + 75),
    origin("center"),
  ]);
  add([
    area(),
    "continue",
    text("Continue?"),
    pos(width() / 2, height() / 2 + 150),
    origin("center"),
  ]);
  onClick("playButton", () => {
    go("game");
  });
  onClick("continue", () => {
    levelNum = localStorage.getItem("level") || 0;
    go("game");
  });
});

scene("win", () => {
  add([text("You Win!"), pos(width() / 2, height() / 2), origin("center")]);
  add([
    area(),
    "restartButton",
    text("RESTART"),
    pos(width() / 2, height() / 2 + 75),
    origin("center"),
  ]);
  onClick("restartButton", () => {
    go("game");
  });
});

scene("lose", () => {
  add([text("You Lose!"), pos(width() / 2, height() / 2), origin("center")]);
  add([
    area(),
    "retryButton",
    text("RETRY"),
    pos(width() / 2, height() / 2 + 75),
    origin("center"),
  ]);
  onClick("retryButton", () => {
    go("game");
  });
});

go("menu");
