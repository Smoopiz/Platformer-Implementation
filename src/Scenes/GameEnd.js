class GameEnd extends Phaser.Scene {
    constructor() {
        super("gameEndScene");
    }

    init(data) {
        this.coins = data.coins || 0;
        this.diamonds = data.diamonds || 0;
        this.timeTaken = data.time || 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("end_bg", "end_bg.png");
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "end_bg")
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.text(400, 200, "🏁 You Win!", {
            fontSize: "32px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(400, 280, `🪙 Coins Collected: ${this.coins}`, {
            fontSize: "24px",
            fill: "#ffff99"
        }).setOrigin(0.5);

        this.add.text(400, 320, `💎 Diamonds Collected: ${this.diamonds}`, {
            fontSize: "24px",
            fill: "#99ffff"
        }).setOrigin(0.5);

        const elapsed = GameTimer.getElapsed();
        this.add.text(400, 360, `🕒 Time Taken: ${elapsed.toFixed(2)} seconds`, {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);       
        this.add.text(400, 400, "Press [R] to Restart", {
            fontSize: "20px",
            fill: "#cccccc"
        }).setOrigin(0.5);
        this.add.text(400, 440, "Press [C] to See Credits", {
            fontSize: "20px",
            fill: "#cccccc"
        }).setOrigin(0.5);

        this.rKey = this.input.keyboard.addKey('R');
        this.cKey = this.input.keyboard.addKey('C');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start("gameStartScene");
        }
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            this.scene.start("creditsScene");
        }
    }
}
