var my = {
    deathCount: 0
};

class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 100;
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -400;
    }

    preload(){
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        this.map = this.add.tilemap("FinalMap", 18, 18);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.hasPowerUp = false;

        // Load Audio
        this.sfxWalk = this.sound.add('sfx_walk');
        this.sfxPowerUp = this.sound.add('sfx_powerup');
        this.sfxDiamond = this.sound.add('sfx_diamond');
        this.sfxKey = this.sound.add('sfx_key');
        this.sfxCoin = this.sound.add('sfx_coin');
        this.lastWalkTime = 0;

        const background = this.map.addTilesetImage("Background", "background_tiles")
        const animatedBlocks = this.map.addTilesetImage("Animated Blocks", "tilemap_tiles");
        this.backgroundLayer = this.map.createLayer("Background", background, 0, 0);
        this.walkableLayer = this.map.createLayer("Walkable Blocks", animatedBlocks, 0, 0);
        this.walkableLayer.setCollisionByProperty({ collides: true });
        this.decorLayer = this.map.createLayer("Decor", animatedBlocks, 0, 0);
        // In charge of all "death" related actions, renaming it breaks the code
        this.waterLayer = this.map.createLayer("Water Layer", animatedBlocks, 0, 0);
        this.waterLayer.setCollisionByExclusion([-1]);
        this.secondLayer = this.map.createLayer("Second Layer", animatedBlocks, 0, 0);
        this.secondLayer.setCollisionByProperty({ collides: true });

        // Diamond
        const diamonds = this.map.createFromObjects("Secret", {
            name: "Diamond",
            key: "tilemap_sheet",
            frame: 67
        });
        this.physics.world.enable(diamonds, Phaser.Physics.Arcade.STATIC_BODY);
        this.diamondGroup = this.add.group(diamonds);

        // Keys
        const keys = this.map.createFromObjects("Key", {
            name: "Key",
            key: "tilemap_sheet",
            frame: 27
        });
        this.physics.world.enable(keys, Phaser.Physics.Arcade.STATIC_BODY);
        this.keyGroup = this.add.group(keys);

        // Block
        const block = this.map.createFromObjects("Block", {
            name: "Block",
            key: "tilemap_sheet",
            frame: 28
        });
        this.physics.world.enable(block, Phaser.Physics.Arcade.STATIC_BODY);
        this.blockGroup = this.add.group(block);

        // Door
        const doors = this.map.createFromObjects("Game End", {
            name: "Door",
            key: "tilemap_sheet",
            frame: 148
        });
        this.physics.world.enable(doors, Phaser.Physics.Arcade.STATIC_BODY);
        this.doorGroup = this.add.group(doors);
        this.anims.create({
            key: "ending",
            frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 148, end: 149 }),
            frameRate: 4,
            repeat: -1
        });

        // Power Ups
        const powerUps = this.map.createFromObjects("Power Up", {
            name: "Power Up",
            key: "tilemap_sheet",
            frame: 128
        });
        this.physics.world.enable(powerUps, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.powerUpGroup = this.add.group(powerUps);
        this.anims.create({
            key: "powerPulse",
            frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 128, end: 129 }),
            frameRate: 4,
            repeat: -1
        });

        // Shirnk Power Up
        const getSmall = this.map.createFromObjects("Special Power Up", {
            name: "Get Small",
            key: "tilemap_sheet",
            frame: 7
        });
        this.physics.world.enable(getSmall, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.getSmallGroup = this.add.group(getSmall);
        this.anims.create({
            key: "shirnker",
            frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 7, end: 8 }),
            frameRate: 4,
            repeat: -1
        });

        // Coins
        const coins = this.map.createFromObjects("Coin Layer", {
            name: "Coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.physics.world.enable(coins, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.coinGroup = this.add.group(coins);
        this.anims.create({
            key: "coinSpin",
            frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 151, end: 152 }),
            frameRate: 6,
            repeat: -1
        });

        // Spawn Point
        const spawns = this.map.createFromObjects("Spawn", {
            name: "Spawn",
            key: "tilemap_sheet",
            frame: 111
        });
        this.physics.world.enable(spawns, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.spawnGroup = this.add.group(spawns);
        this.anims.create({
            key: "spawnIdle",
            frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 111, end: 112 }),
            frameRate: 2,
            repeat: -1
        });

        // Player Setup
        const spawnPoint = this.map.findObject("Spawn", obj => obj.name === "Spawn");
        this.player = this.physics.add.sprite(spawnPoint.x + 20, spawnPoint.y - 11, "platformer_characters", "tile_0000.png");
        this.player.setCollideWorldBounds(true);

        // Horizontal movement particles
        this.walkParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_05.png'],
            scale: { start: 0.1, end: 0 },
            lifespan: 300,
            speedX: { min: -20, max: 20 },
            speedY: { min: -10, max: 10 },
            alpha: { start: 0.8, end: 0 },
            follow: this.player,
            followOffset: { x: 0, y: 10 },
            quantity: 1,
            frequency: 50
        });
        this.walkParticles.stop();

        // Coin pick up Particles
        this.coinPickupParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "star_04.png",
            scale: { start: 0.2, end: 0 },
            lifespan: 300,
            speed: { min: 30, max: 60 },
            quantity: 5,
            gravityY: -100,
            alpha: { start: 1, end: 0 },
        });
        this.coinPickupParticles.stop();    
        
        // Key pick up Particles
        this.keyPickupParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "trace_03.png",
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            speed: { min: 20, max: 60 },
            quantity: 4,
            angle: { min: 0, max: 360 },
            alpha: { start: 1, end: 0 },
        });
        this.keyPickupParticles.stop();
        
        // Diamond pick up Particles
        this.diamondPickupParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "star_08.png",
            scale: { start: 0.25, end: 0 },
            lifespan: 350,
            speed: { min: 50, max: 80 },
            quantity: 6,
            gravityY: -50,
            alpha: { start: 1, end: 0 },
        });
        this.diamondPickupParticles.stop();

        // Power up pick up Particles
        this.powerUpParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "smoke_06.png",
            scale: { start: 0.3, end: 0 },
            lifespan: 400,
            speed: { min: 20, max: 40 },
            quantity: 5,
            gravityY: -80,
            alpha: { start: 0.8, end: 0 },
        });
        this.powerUpParticles.stop();        

        // Special Power up pick up Particles
        this.specialPowerUpParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "smoke_06.png",
            scale: { start: 0.3, end: 0 },
            lifespan: 400,
            speed: { min: 20, max: 40 },
            quantity: 5,
            gravityY: -80,
            alpha: { start: 0.8, end: 0 },
        });
        this.specialPowerUpParticles.stop();  

        // Player + collision layers
        this.physics.add.collider(this.player, this.walkableLayer);
        this.physics.add.collider(this.player, this.secondLayer);

        // Kills the player
        this.waterLayer.setTileIndexCallback(
            this.waterLayer.layer.data.flat().filter(t => t.index !== -1).map(t => t.index),
            () => {this.handleDeath();},
            this
        );
        this.physics.add.collider(this.player, this.waterLayer);
        
        // Player vs object collisions
        this.physics.add.overlap(this.player, this.coinGroup, (player, coin) => {
            this.coinPickupParticles.emitParticleAt(coin.x, coin.y);
            this.sfxCoin.play();

            coin.destroy();
            this.coinCount++;
            this.updateHUD();
        });
        this.physics.add.overlap(this.player, this.diamondGroup, (player, diamond) => {
            this.diamondPickupParticles.emitParticleAt(diamond.x, diamond.y);
            this.sfxDiamond.play();

            diamond.destroy();
            this.diamondCount++;
            this.updateHUD();
        });        
        this.physics.add.overlap(this.player, this.keyGroup, (player, key) => {
            this.keyPickupParticles.emitParticleAt(key.x, key.y);
            this.sfxKey.play();

            key.destroy();

            this.blockGroup.getChildren().forEach(block => {this.blockGroup.clear(true, true);});            
        });
        this.physics.add.overlap(this.player, this.doorGroup, () => {
            this.scene.start("gameEndScene", {
                coins: this.coinCount,
                diamonds: this.diamondCount
            });
        });
        this.physics.add.overlap(this.player, this.powerUpGroup, (player, powerUp) => {
            this.powerUpParticles.emitParticleAt(powerUp.x, powerUp.y);
            this.sfxPowerUp.play();

            powerUp.destroy();
        
            if (!this.hasPowerUp) {
                this.hasPowerUp = true;
        
                this.ACCELERATION *= 1.5;
                this.JUMP_VELOCITY *= 1.5;
        
                this.time.delayedCall(5000, () => {
                    this.ACCELERATION /= 1.5;
                    this.JUMP_VELOCITY /= 1.5;
                    this.hasPowerUp = false;
                });
            }
        });
        this.physics.add.overlap(this.player, this.getSmallGroup, (player, getSmall) => {
            this.specialPowerUpParticles.emitParticleAt(getSmall.x, getSmall.y);
            this.sfxPowerUp.play();
        
            getSmall.destroy();
        
            player.setScale(0.5);
            
            player.body.setSize(player.width, player.height, true);
        
        });

        this.physics.add.collider(this.player, this.spawnGroup);
        this.physics.add.collider(this.player, this.blockGroup);

        // Objects + collision layers
        this.physics.add.collider(this.coinGroup, this.walkableLayer);
        this.physics.add.collider(this.coinGroup, this.secondLayer);
        this.physics.add.collider(this.coinGroup, this.coinGroup);
        this.physics.add.collider(this.keyGroup, this.walkableLayer);
        this.physics.add.collider(this.diamondGroup, this.secondLayer);
        this.physics.add.collider(this.powerUpGroup, this.walkableLayer);
        this.physics.add.collider(this.powerUpGroup, this.secondLayer);
        this.physics.add.collider(this.spawnGroup, this.walkableLayer);
        this.physics.add.collider(this.getSmallGroup, this.secondLayer);

        // Death Counter
        this.deathCount = my.deathCount || 0;
        this.isDead = false;

        this.handleDeath = () => {
            if (this.isDead) return;
            this.isDead = true;
            
            my.deathCount = (my.deathCount || 0) + 1;
            this.deathCount = my.deathCount;
            this.updateHUD();

            this.player.body.enable = false;

            this.time.delayedCall(100, () => {
                this.scene.restart();
            });
        };

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // Animated tiles
        this.animatedTiles.init(this.map);

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setScroll(0, 0);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
        this.cameras.main.setZoom(1.75);

        // Object animations
        this.coinGroup.getChildren().forEach(obj => obj.anims.play("coinSpin"));
        this.powerUpGroup.getChildren().forEach(obj => obj.anims.play("powerPulse"));
        this.spawnGroup.getChildren().forEach(obj => obj.anims.play("spawnIdle"));
        this.getSmallGroup.getChildren().forEach(obj => obj.anims.play("shrinker"));
        this.doorGroup.getChildren().forEach(obj => obj.anims.play("ending"));

        // UI Elements
        this.coinCount = 0;
        this.diamondCount = 0;
    
        // HUD
        this.updateHUD = () => {
            document.getElementById("coin-counter").textContent = `🪙 Coins: ${this.coinCount} / 38`;
            document.getElementById("diamond-counter").textContent = `💎 Diamonds: ${this.diamondCount} / 2`;
            document.getElementById("death-counter").textContent = `💀 Deaths: ${this.deathCount}`;
        };
    }

    update() {
        const onGround = this.player.body.blocked.down;
    
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.resetFlip();
            if (onGround) this.player.anims.play("walk", true);
    
            if (onGround && !this.walkCooldown) {
                this.sfxWalk.play();
                this.walkCooldown = true;
                this.time.delayedCall(250, () => {
                    this.walkCooldown = false;
                });
            }
    
            this.walkParticles.followOffset.x = 10;
            if (onGround) this.walkParticles.start();
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlipX(true);
            if (onGround) this.player.anims.play("walk", true);
    
            if (onGround && !this.walkCooldown) {
                this.sfxWalk.play();
                this.walkCooldown = true;
                this.time.delayedCall(250, () => {
                    this.walkCooldown = false;
                });
            }
    
            this.walkParticles.followOffset.x = -10;
            if (onGround) this.walkParticles.start();
        } else {
            this.player.setAccelerationX(0);
            this.player.setDragX(this.DRAG);
            if (onGround) this.player.anims.play("idle");
            this.walkParticles.stop();
        }
    
        if (!onGround) {
            this.player.anims.play("jump");
        }
    
        if (onGround && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
    

}