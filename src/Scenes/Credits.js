class Credits extends Phaser.Scene {
    constructor() {
        super ("creditsScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("credits_bg", "credits_bg.png");
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "credits_bg")
        .setOrigin(0.5)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(750, 400, "Press [R] to Restart", {
            fontSize: "32px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        this.rKey = this.input.keyboard.addKey('R');

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start("gameStartScene");
        }
    }
}