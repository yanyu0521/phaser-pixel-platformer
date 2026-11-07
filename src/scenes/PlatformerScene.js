import Phaser from 'phaser';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const TILE_SIZE = 36;
const WORLD_WIDTH = 2232;
const FLOOR_Y = 450;
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;

export default class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJumpRequested = false;
    this.collected = 0;
    this.hasWon = false;
  }

  preload() {
    this.load.spritesheet(
      'player',
      assetUrl('assets/kenney/pixel-platformer/Tilemap/tilemap-characters_packed.png'),
      { frameWidth: 24, frameHeight: 24 },
    );

    this.load.image('grass-left', assetUrl('assets/kenney/pixel-platformer/Tiles/tile_0021.png'));
    this.load.image('grass-middle', assetUrl('assets/kenney/pixel-platformer/Tiles/tile_0022.png'));
    this.load.image('grass-right', assetUrl('assets/kenney/pixel-platformer/Tiles/tile_0023.png'));
    this.load.image('dirt', assetUrl('assets/kenney/pixel-platformer/Tiles/tile_0122.png'));

    this.load.image(
      'stone-block',
      assetUrl('assets/kenney/pixel-platformer-blocks/Tiles/Stone/tile_0018.png'),
    );
    this.load.image(
      'treat',
      assetUrl('assets/kenney/pixel-platformer-food-expansion/Tiles/tile_0040.png'),
    );
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT + 300);

    this.platforms = this.physics.add.staticGroup();
    this.foodItems = this.physics.add.group({ allowGravity: false, immovable: true });

    this.createBackground();
    this.createLevel();
    this.createFoodItems();
    this.createFinishMarker();

    this.player = this.physics.add.sprite(90, FLOOR_Y - 70, 'player', 0);
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(14, 20);
    this.player.body.setOffset(5, 3);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.foodItems, this.collectFood, undefined, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D,W');

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.1);

    this.createHud();
    this.createTouchControls();
  }

  createBackground() {
    this.add
      .rectangle(WORLD_WIDTH / 2, GAME_HEIGHT / 2, WORLD_WIDTH, GAME_HEIGHT, 0xc7f0ee)
      .setDepth(-20);

    for (let x = 120; x < WORLD_WIDTH; x += 390) {
      const cloud = this.add.container(x, 145 + ((x / 390) % 2) * 54);
      cloud.setDepth(-10).setAlpha(0.72);
      cloud.add([
        this.add.circle(0, 10, 19, 0xffffff),
        this.add.circle(20, 0, 24, 0xffffff),
        this.add.circle(44, 11, 18, 0xffffff),
        this.add.rectangle(21, 18, 52, 20, 0xffffff),
      ]);
    }
  }

  createLevel() {
    this.addGrassSegment(0, FLOOR_Y, 14);
    this.addGrassSegment(612, FLOOR_Y, 11);
    this.addGrassSegment(1116, FLOOR_Y, 31);

    this.addGrassSegment(468, 360, 4, 0);
    this.addGrassSegment(900, 360, 4, 0);
    this.addGrassSegment(1008, 324, 3, 0);

    // A raised stone ledge uses the separate Pixel Platformer Blocks pack.
    for (let i = 0; i < 4; i += 1) {
      this.addSolidTile(1260 + i * TILE_SIZE, 360, 'stone-block');
    }
  }

  addGrassSegment(startX, topY, tileCount, fillRows = 3) {
    for (let column = 0; column < tileCount; column += 1) {
      let topKey = 'grass-middle';
      if (column === 0) topKey = 'grass-left';
      if (column === tileCount - 1) topKey = 'grass-right';

      const x = startX + column * TILE_SIZE;
      this.addSolidTile(x, topY, topKey);

      for (let row = 1; row <= fillRows; row += 1) {
        this.addSolidTile(x, topY + row * TILE_SIZE, 'dirt');
      }
    }
  }

  addSolidTile(x, y, texture) {
    const tile = this.platforms.create(x + TILE_SIZE / 2, y + TILE_SIZE / 2, texture);
    tile.setScale(2).setDepth(1);
    tile.refreshBody();
    return tile;
  }

  createFoodItems() {
    const positions = [
      [220, 390],
      [500, 305],
      [690, 390],
      [930, 305],
      [1060, 270],
      [1300, 305],
      [1580, 390],
      [1840, 390],
    ];

    positions.forEach(([x, y]) => {
      const item = this.foodItems.create(x, y, 'treat');
      item.setScale(2).setDepth(3);
      item.body.setAllowGravity(false);
      item.body.setImmovable(true);
    });

    this.totalFood = positions.length;
  }

  createFinishMarker() {
    this.finishX = WORLD_WIDTH - 108;
    this.add.rectangle(this.finishX, FLOOR_Y - 60, 6, 120, 0x34434a).setOrigin(0.5, 0).setDepth(2);
    this.add
      .triangle(this.finishX + 22, FLOOR_Y - 50, 0, 0, 44, 14, 0, 28, 0xf06d60)
      .setOrigin(0, 0)
      .setDepth(2);
    this.add
      .text(this.finishX - 42, FLOOR_Y - 92, 'FINISH', {
        color: '#263b40',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
      })
      .setDepth(2);
  }

  createHud() {
    this.hud = this.add
      .text(24, 18, '', {
        color: '#17343d',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(255,255,255,0.72)',
        padding: { left: 10, right: 10, top: 7, bottom: 7 },
      })
      .setScrollFactor(0)
      .setDepth(20);

    this.helpText = this.add
      .text(24, 64, 'A / D or ← → move   •   Space / ↑ jump', {
        color: '#17343d',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        backgroundColor: 'rgba(255,255,255,0.62)',
        padding: { left: 9, right: 9, top: 5, bottom: 5 },
      })
      .setScrollFactor(0)
      .setDepth(20);

    this.updateHud();
  }

  createTouchControls() {
    const y = GAME_HEIGHT - 48;
    this.addTouchButton(58, y, '◀', () => { this.touchLeft = true; }, () => { this.touchLeft = false; });
    this.addTouchButton(132, y, '▶', () => { this.touchRight = true; }, () => { this.touchRight = false; });
    this.addTouchButton(GAME_WIDTH - 78, y, 'JUMP', () => { this.touchJumpRequested = true; }, () => {});
  }

  addTouchButton(x, y, label, onPress, onRelease) {
    const button = this.add
      .text(x, y, label, {
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: label === 'JUMP' ? '16px' : '25px',
        fontStyle: 'bold',
        backgroundColor: 'rgba(20, 39, 48, 0.72)',
        padding: { left: 14, right: 14, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21)
      .setInteractive();

    button.on('pointerdown', (pointer, localX, localY, event) => {
      event.stopPropagation();
      onPress();
    });
    button.on('pointerup', onRelease);
    button.on('pointerupoutside', onRelease);
    return button;
  }

  collectFood(player, item) {
    if (!item.active) return;

    item.body.enable = false;
    this.collected += 1;
    this.updateHud();

    this.tweens.add({
      targets: item,
      y: item.y - 16,
      alpha: 0,
      scale: 0,
      duration: 180,
      onComplete: () => item.destroy(),
    });
  }

  updateHud() {
    if (this.hud) {
      this.hud.setText(`SWEETS  ${this.collected} / ${this.totalFood ?? 0}`);
    }
  }

  update() {
    if (this.hasWon || !this.player?.active) return;

    const left = this.cursors.left.isDown || this.keys.A.isDown || this.touchLeft;
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.touchRight;
    const speed = 250;

    if (left && !right) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (right && !left) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W) ||
      this.touchJumpRequested;
    this.touchJumpRequested = false;

    if (jumpPressed && (this.player.body.blocked.down || this.player.body.touching.down)) {
      this.player.setVelocityY(-520);
    }

    if (this.player.y > GAME_HEIGHT + 220) {
      this.scene.restart();
      return;
    }

    if (this.player.x >= this.finishX - 34) {
      this.winLevel();
    }
  }

  winLevel() {
    this.hasWon = true;
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 440, 190, 0x18333c, 0.94)
      .setScrollFactor(0)
      .setDepth(30);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 38, 'LEVEL COMPLETE!', {
        color: '#fff7cf',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(31);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16, `Treats collected: ${this.collected} / ${this.totalFood}`, {
        color: '#e0f5f3',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(31);

    const restart = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 66, 'PLAY AGAIN', {
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        backgroundColor: '#358f77',
        padding: { left: 16, right: 16, top: 9, bottom: 9 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(31)
      .setInteractive({ useHandCursor: true });

    restart.on('pointerdown', () => this.scene.restart());
  }
}
