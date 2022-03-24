kaboom({
	global: true,
	fullscreen: true,
    scale: 2,
    debug: true,
	clearColor: [0, 0, 0,1] 
});

let MOVE_SPEED = 120;
let JUMP_FORCE = 360;
let BIG_JUMP_FORCE = 550;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
let FALL_DEATH = 400;
let ENEMY_SPEED = 20;
let isJumping = true;

loadRoot('https://i.imgur.com/');
loadSprite('coin', 'wbKxhcd.png');
loadSprite('evil-shroom', 'KPO3fR9.png');
loadSprite('brick', 'pogC9x5.png');
loadSprite('block', 'M6rwarW.png');
loadSprite('mario', 'Wb1qfhK.png');
loadSprite('mushroom', '0wMd92p.png');
loadSprite('surprise', 'gesQ1KP.png');
loadSprite('unboxed', 'bdrLpi6.png');
loadSprite('pipe-top-left', 'ReTPiWY.png');
loadSprite('pipe-top-right', 'hj2GK4n.png');
loadSprite('pipe-bottom-left', 'c1cYSbt.png');
loadSprite('pipe-bottom-right', 'nqQ79eI.png');

loadSprite('blue-block', 'fVscIbn.png');
loadSprite('blue-brick', '3e5YRQd.png');

scene("game", ({ level, score }) => {
  layers(['bg', 'obj', 'ui'], 'obj')
  
  let maps = [
    [
      '                                                                                                                                    ',
	  '                                                                                                                                    ',
	  '                                                                                                                                    ',
	  '                                                                                                                                    ',
 /**/ '                      %                                                         ========   ===%              *           ===    =$$=',
	  '                                                                                                                                    ',
	  '                                                                                                                                    ',
      '                                                                                                                                    ',
      '                %   =*=%=                     -+         -+                  =*=              =     ==    %  %  %     =          == ',
	  '                                      -+      ()         ()                                                                         ',
      '                            -+        ()      ()         ()                                                                         ',
      '                      ^     ()        ()^     ()   ^ ^   ()                                      ^ ^              ^ ^       ^ ^ ^ ^ ',
      '=====================================================================  ===============   ===========================================',
	  '=====================================================================  ===============   ===========================================',
	 //123456789111111111122222222223333333333444444444455555555556666666666777777777788888888889999999999111111111111111111111111111111111
	 //000000000012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789000000000011111111112222222222333
	 //000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012345678901234567890123456789012
	 
	 //1234567890
	 //==========
    ],
    [
      '£   £££££££    £',
      '£              £',
      '£    $$$$$     £',
      '£   $$$$$$$    £',
      '£   $$$$$$$    £',
      '£   £££££££    £',
      '£   £££££££  -+£',
      '£   £££££££  ()£',
      '!!!!!!!!!!!!!!!!',
	  '!!!!!!!!!!!!!!!!',
    ]
  ];
  
    let levelSymbol = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)]
  };


 let RoomLevel = addLevel(maps[level], levelSymbol);
 
 let scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: score,
    }
  ]);
  
  add([
    text('level ' + parseInt(level + 1) ), 
    pos(40, 6)
  ]);
  
   function big() {
    let timer = 0;
    let isBig = false;
    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer -= dt()
          if (timer <= 0){
            this.smallify();
		  }
        }
      },
	  
      isBig() {
        return isBig
	  },
	  
      smallify() {
        this.scale = vec2(1);
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        timer = 0;
        isBig = false;
      },
	  
      biggify(time) {
        this.scale = vec2(2);
        timer = time;
        isBig = true;  
      }
    }
  };
  
const mario = add([
    sprite('mario'), solid(),
    pos(30,1),
    body(),
    big(),
	origin('bot')
]);

  action('mushroom', (m) => {
    m.move(20, 0)
  });
  
  mario.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
      RoomLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      RoomLevel.spawn('}', obj.gridPos.sub(0,0))
    }
	
    if (obj.is('mushroom-surprise')) {
      RoomLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      RoomLevel.spawn('}', obj.gridPos.sub(0,0))
    }
  });

  mario.collides('mushroom', (m) => {
    destroy(m);
    mario.biggify(6);
  });

  mario.collides('coin', (c) => {
    destroy(c);
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value;
  });

  action('dangerous', (d) => {
    d.move(-ENEMY_SPEED, 0);
  });

  mario.collides('dangerous', (d) => {
    isJumping ? destroy(d) : go('lose', { score: scoreLabel.value });
  });

  mario.action(() => {
    camPos(mario.pos);
    if (mario.pos.y >= FALL_DEATH)
      go('lose', { 
		score: scoreLabel.value
	  });
  });

  mario.collides('pipe', () => {
    keyPress('down', () => {
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value
      });
    });
  });
  
  keyDown('left', () => {
    mario.move(-MOVE_SPEED, 0);
  });

  keyDown('right', () => {
    mario.move(MOVE_SPEED, 0);
  });

  mario.action( () => {
    if(mario.grounded())
      isJumping = false
  });

  keyPress('space', () => {
    if (mario.grounded()) {
      isJumping = true;
      mario.jump(CURRENT_JUMP_FORCE);
    }
  });

});


scene('lose', ({ score }) => {
  add([
	text(score, 32),
	origin('center'), 
	pos(width()/2, height()/ 2)
	])
});

start("game", { 
	level: 0, 
	score: 0
});