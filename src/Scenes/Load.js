class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load shared tileset image
        this.load.image("background_tiles", "tilemap-backgrounds_packed.png");
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.image("large_background_tiles", "spritesheet-backgrounds-double.png");
        this.load.image("stone_tiles", "stone_packed.png");
        this.load.image("extra_tlies", "EXTRA_tilemap_packed.png");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap
        this.load.tilemapTiledJSON("FinalMap", "FinalMap.tmj");
        this.load.tilemapTiledJSON("NextMap", "NextMap.tmj");

        this.load.audio('sfx_walk', 'footstep_grass_001.ogg');
        this.load.audio('sfx_powerup', 'impactPlate_light_004.ogg');
        this.load.audio('sfx_diamond', 'impactPunch_heavy_000.ogg');
        this.load.audio('sfx_key', 'impactPunch_medium_004.ogg');
        this.load.audio('sfx_coin', 'impactTin_medium_001.ogg');
        this.load.audio('sfx_jump', 'impactBell_heavy_004.ogg');
        this.load.audio('background_music', 'BGM1.mp3')

        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("background_sheet", "tilemap-backgrounds_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("large_background_tiles", "spritesheet-backgrounds-double.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("stone_tiles", "stone_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("extra_tlies", "EXTRA_tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.scene.start("gameStartScene");
    }

    update() {}
}