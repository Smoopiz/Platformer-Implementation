var my = {
    deathCount: 0
};

class SecondLevel extends Phaser.Scene {
    constructor() {
        super("secondLevelScene")
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
        // Create Map
        this.map = this.add.tilemap("NextMap", 18, 18);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // sfxWalk has errors after getting restarted
        if (this.sfxWalk && this.sfxWalk.isDestroyed === false) {
            this.sfxWalk.destroy();
        };

        // Load Audio
        this.sfxWalk = this.sound.add('sfx_walk');
        this.sfxPowerUp = this.sound.add('sfx_powerup');
        this.sfxDiamond = this.sound.add('sfx_diamond');
        this.sfxKey = this.sound.add('sfx_key');
        this.sfxCoin = this.sound.add('sfx_coin');
        this.sfxJump = this.sound.add('sfx_jump');

        // Set ups
        this.lastWalkTime = 0;
        this.canDoubleJump = false;

        // Init Layers
        const background = this.map.addTilesetImage("Background", "large_background_tiles");
        const animatedBlocks = this.map.addTilesetImage("Animated Blocks", "tilemap_tiles");
        const extraDecorBlocks = this.map.addTilesetImage("Extra Blocks", "extra_tlies");
        const extraStone = this.map.addTilesetImage("Extra Stone", "stone_tiles");

        // Create Layers
        this.backgroundLayer = this.map.createLayer("Background", background, 0, 0);
        this.walkableLayer = this.map.createLayer("Walkable Blocks", animatedBlocks, 0, 0);
        this.walkableLayer.setCollisionByProperty({collides: true});
        this.walkableLayer.setCollisionByProperty({doubleJump: true});
        this.decorLayer = this.map.createLayer("Decor", animatedBlocks, extraDecorBlocks, extraStone, 0, 0);
        // In charge of the "death" layer, water and spikes are both in this layer, changing the name breaks the code.
        this.waterLayer = this.map.createLayer("Water Layer", animatedBlocks, 0, 0);
        this.waterLayer.setCollisionByExclusion([-1]);
        this.secondLayer = this.map.createLayer("Second Layer", animatedBlocks, 0, 0);
        this.secondLayer.setCollisionByProperty({ collides: true });

        this.enemyOneGroup = this.physics.add.group();
        this.enemyTwoGroup = this.physics.add.group();

        // Start of loading objects

        // Diamond
        const diamonds = this.map.createFromObjects("Secret", {
            name: "Diamond",
            key: "tilemap_tiles",
            frame: 27
        }) ;
        this.physics.world.enable(diamonds, Phaser.Physics.Arcade.STATIC_BODY);
        this.diamondGroup = this.add.group(diamonds);

        // Door (Was a "Door" block before change)
        const doors = this.map.createFromObjects("Game End", {
            name: "Door",
            key: "tilemap_sheet",
            frame: 148
        });
        this.physics.world.enable(doors, Phaser.Physics.Arcade.STATIC_BODY);
        this.doorGroup = this.add.group(doors);
        if (!this.anims.exists('ending')) {
            this.anims.create({
                key: "ending",
                frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 148, end: 149 }),
                frameRate: 4,
                repeat: -1
            });
        }

        // Power Ups
        const powerUps = this.map.createFromObjects("Power Up", {
            name: "Power Up",
            key: "tilemap_sheet",
            frame: 128
        });
        this.physics.world.enable(powerUps, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.powerUpGroup = this.add.group(powerUps);
        if (!this.anims.exists('powerPulse')) {
            this.anims.create({
                key: "powerPulse",
                frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 128, end: 129 }),
                frameRate: 4,
                repeat: -1
            });
        }

        // Shrink Power Up
        const getSmall = this.map.createFromObjects("Special Power Up", {
            name: "Get Small",
            key: "tilemap_sheet",
            frame: 7
        });
        this.physics.world.enable(getSmall, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.getSmallGroup = this.add.group(getSmall);
        if (!this.anims.exists("shrinker")) {
            this.anims.create({
                key: "shrinker",
                frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 7, end: 8 }),
                frameRate: 4,
                repeat: -1
            });
        }

        // Coins
        const coins = this.map.createFromObjects("Coin Layer", {
            name: "Coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.physics.world.enable(coins, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.coinGroup = this.add.group(coins);
        if (!this.anims.exists("coinSpin")) {
            this.anims.create({
                key: "coinSpin",
                frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 151, end: 152 }),
                frameRate: 6,
                repeat: -1
            });
        }

        // Spawn Point
        const spawns = this.map.createFromObjects("Spawn", {
            name: "Spawn",
            key: "tilemap_sheet",
            frame: 111
        });
        this.physics.world.enable(spawns, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.spawnGroup = this.add.group(spawns);
        if (!this.anims.exists("spawnIdle")) {
            this.anims.create({
                key: "spawnIdle",
                frames: this.anims.generateFrameNumbers("tilemap_sheet", { start: 111, end: 112 }),
                frameRate: 2,
                repeat: -1
            });
        }
        
        // Enemy one spawn
        if (!this.anims.exists("enemyOneWalk")) {
            this.anims.create({
                key: 'enemyOneWalk',
                frames: this.anims.generateFrameNumbers("platformer_characters", { 
                    frames: ["tile_0018.png", "tile_0020.png"]
                }),
                frameRate: 6,
                repeat: -1
            });
        }
        const enemyOneLayer = this.map.getObjectLayer("Enemy One");
        enemyOneLayer.objects.forEach(obj => {
            if (obj.name === "Spawn Enemy") {
                const enemy = this.enemyOneGroup.create(obj.x, obj.y, 'platformer_characters', 'tile_0018.png');
                enemy.anims.play('enemyOneWalk');
                enemy.setOrigin(0, 1);

                enemy.body.setCollideWorldBounds(true);
                enemy.direction = 1;
                enemy.setVelocityX(50);            
            }
        });
        this.physics.world.enable(enemyOneLayer, Phaser.Physics.Arcade.DYNAMIC_BODY);

        // Enemy two spawn
        if (!this.anims.exists("enemyTwoWalk")) {
            this.anims.create({
                key: 'enemyTwoWalk',
                frames: this.anims.generateFrameNumbers("platformer_characters", { 
                    frames: ["tile_0024.png", "tile_0025.png", "tile_0026.png"]
                }),
                frameRate: 6,
                repeat: -1
            });
        }
        const enemyTwoLayer = this.map.getObjectLayer("Enemy Two");
        enemyTwoLayer.objects.forEach(obj => {
            if (obj.name === "Spawn Enemy") {
                const enemy = this.enemyTwoGroup.create(obj.x, obj.y, 'platformer_characters', 'tile_0024.png');
                enemy.setOrigin(0, 1);
                enemy.body.allowGravity = false;
                enemy.body.immovable = true;
                enemy.setVelocityY(0);
                enemy.anims.play("enemyTwoWalk")
                enemy.activated = false;

                enemy.body.setCollideWorldBounds(true);
                enemy.direction = 1;
                enemy.setVelocityX(50);  

                enemy.floatTween = this.tweens.add({
                    targets: enemy,
                    y: enemy.y - 5,
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });                
            }
        });
        this.physics.world.enable(enemyTwoLayer, Phaser.Physics.Arcade.DYNAMIC_BODY);

        // Player Creation 
        const spawnPoint = this.map.findObject("Spawn", obj => obj.name === "Spawn");

        if (!spawnPoint) {
            console.error("ERROR: Spawn point not found in 'Spawn' object layer!");
            return;
        }

        this.player = this.physics.add.sprite(spawnPoint.x + 20, spawnPoint.y - 11, "platformer_characters", "tile_0000.png");
        this.player.setCollideWorldBounds(true);

        // Horizontal movement particles
        this.walkParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "muzzle_05.png",
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

        // Jump Particles
        this.jumpParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: "smoke_02",
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
        this.jumpParticles.stop();

        // Coin pick up particles
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

        // Key pick up particles
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

        // Diamond pick up particles
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

        // Power up pick up particles
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

        // Player collison layers
        this.physics.add.collider(this.player, this.walkableLayer);
        this.physics.add.collider(this.player, this.secondLayer);
        this.physics.add.collider(this.player, this.waterLayer);
        this.physics.add.collider(this.player, this.spawnGroup);
        this.physics.add.collider(this.player, this.enemyOneGroup, this.handleEnemyCollision, null, this);
        this.physics.add.collider(this.player, this.enemyTwoGroup, this.handleEnemyCollision, null, this);


        // Death handler
        this.waterLayer.setTileIndexCallback(
            this.waterLayer.layer.data.flat().filter(t => t.index !== -1).map(t => t.index),
            () => {this.handleDeath();},
            this
        );

        // Player object collison 
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

        // Objects collison layer
        this.physics.add.collider(this.coinGroup, this.walkableLayer);
        this.physics.add.collider(this.coinGroup, this.secondLayer);
        this.physics.add.collider(this.coinGroup, this.coinGroup);
        this.physics.add.collider(this.diamondGroup, this.secondLayer);
        this.physics.add.collider(this.powerUpGroup, this.walkableLayer);
        this.physics.add.collider(this.powerUpGroup, this.secondLayer);
        this.physics.add.collider(this.spawnGroup, this.walkableLayer);
        this.physics.add.collider(this.getSmallGroup, this.secondLayer);
        this.physics.add.collider(this.enemyOneGroup, this.walkableLayer)
        this.physics.add.collider(this.enemyTwoGroup, this.walkableLayer)
        this.physics.add.collider(this.enemyOneGroup, this.secondLayer)
        this.physics.add.collider(this.enemyTwoGroup, this.secondLayer)


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

 //           if (this.sfxWalk.isPlaying) {
 //               this.sfxWalk.stop();
 //           }            
            this.walkCooldown = false;

            this.time.delayedCall(250, () => {
                this.scene.restart();
            });
        };

        // Player Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        // Animated Tiles
        this.animatedTiles.init(this.map);

        // Camera Setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setScroll(0, 0);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
        this.cameras.main.setZoom(1.75);

        // Object Animation
        this.coinGroup.getChildren().forEach(coin => {
            coin.anims.play("coinSpin");
            coin.body.allowGravity = false;

            this.tweens.add({
                targets: coin,
                y: coin.y - 5,
                duration: 800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        });
        this.powerUpGroup.getChildren().forEach(obj => obj.anims.play("powerPulse"));
        this.spawnGroup.getChildren().forEach(obj => obj.anims.play("spawnIdle"));
        this.getSmallGroup.getChildren().forEach(obj => obj.anims.play("shrinker"));
        this.doorGroup.getChildren().forEach(obj => obj.anims.play("ending"));

        // UI Elements
        this.coinCount = 0;
        this.diamondCount = 0;

        // HUD
        this.updateHUD = () => {
            document.getElementById("coin-counter").textContent = `🪙 Coins: ${this.coinCount}`;
            document.getElementById("diamond-counter").textContent = `💎 Diamonds: ${this.diamondCount}`;
            document.getElementById("death-counter").textContent = `💀 Deaths: ${this.deathCount}`;
        };
    }

    updateEnemyOne() {
        this.enemyOneGroup.getChildren().forEach(enemy => {
            enemy.body.setCollideWorldBounds(true);

            const direction = enemy.direction;
            const nextX = enemy.x + direction * enemy.width / 2;
            const nextY = enemy.y + enemy.height / 2 + 1;
            const tileAhead = this.walkableLayer.getTileAtWorldXY(nextX, nextY);

            if (!tileAhead || enemy.body.blocked.left || enemy.body.blocked.right) {
                enemy.direction *= -1;
                enemy.setVelocityX(50*enemy.direction);
                enemy.setFlipX(enemy.direction > 0)
            }
        });
    }

    updateEnemyTwo() {
        this.enemyTwoGroup.getChildren().forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    
            if (distance < 150 && !enemy.activated) {
                enemy.activated = true;
    
                if (enemy.floatTween) {
                    enemy.floatTween.stop();
                }
            }
    
            if (enemy.activated) {
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                const speed = 60;
    
                enemy.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        });
    }
    

    handleEnemyCollision(player, enemy) {
        const playerBottom = player.body.y + player.body.height;
        const enemyTop = enemy.body.y;
    
        if (player.body.velocity.y > 0 && playerBottom <= enemyTop + 10) {
            enemy.destroy();
            player.setVelocityY(this.JUMP_VELOCITY / 1.5);
            this.sfxEnemyHit?.play();
        } else {
            this.handleDeath();
        }
    }

    update() {
        const onGround = this.player.body.blocked.down;

        const tileLeft = this.walkableLayer.getTileAtWorldXY(
            this.player.x - this.player.width / 2 - 1,
            this.player.y,
            true
        );
        const tileRight = this.walkableLayer.getTileAtWorldXY(
            this.player.x + this.player.width / 2 + 1,
            this.player.y,
            true
        );
        if ((tileLeft && tileLeft.properties.doubleJump) || (tileRight && tileRight.properties.doubleJump)) {
            this.canDoubleJump = true;
        }             
    
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.resetFlip();
            if (onGround) this.player.anims.play("walk", true);
    
            if (onGround && !this.walkCooldown) {
                this.sfxWalk.play();
                this.walkCooldown = true;
                this.time.delayedCall(300, () => {
                    this.walkCooldown = false;
                });
            }
    
            if (onGround) this.walkParticles.start();
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlipX(true);
            if (onGround) this.player.anims.play("walk", true);
    
            if (onGround && !this.walkCooldown) {
                this.sfxWalk.play();
                this.walkCooldown = true;
                this.time.delayedCall(300, () => {
                    this.walkCooldown = false;
                });
            }
    
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
            this.jumpParticles.start();
            this.sfxJump.play();
            this.player.setVelocityY(this.JUMP_VELOCITY);
            this.time.delayedCall(400, () => {
                this.jumpParticles.stop();
            });
        } else if (!onGround && Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.canDoubleJump) {
            this.jumpParticles.start();
            this.sfxJump.play();
            this.player.setVelocityY(this.JUMP_VELOCITY);
            this.canDoubleJump = false;
            this.time.delayedCall(400, () => {
                this.jumpParticles.stop();
            });
        }        
    
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        this.updateEnemyOne();
        this.updateEnemyTwo();
    }
}