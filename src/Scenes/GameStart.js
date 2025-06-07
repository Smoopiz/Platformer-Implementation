class GameStart extends Phaser.Scene {
    constructor() {
        super("gameStartScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("start_bg", "start_bg.png");
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "start_bg")
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, "Welcome to Ascension", {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#000000",
            align: "center"
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Press SPACE to Start", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#000000",
            align: "center"
        }).setOrigin(0.5);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("platformerScene");
        }
    }
}
