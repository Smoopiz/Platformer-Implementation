class MusicManager extends Phaser.Scene {
    constructor() {
        super({ key: 'MusicManager', active: true });
    }

    preload() {
    }

    create() {
        this.time.delayedCall (1000, () => {
            this.backgroundMusic = this.sound.add('background_music');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.1;
            this.backgroundMusic.play();
        });
    }
}
