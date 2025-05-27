class GameEnd extends Phaser.Scene {
    constructor() {
        super("gameEndScene");
    }

    init(data) {
        this.coins = data.coins || 0;
        this.diamonds = data.diamonds || 0;
    }

    create() {
        this.add.text(400, 200, "🏁 LEVEL COMPLETE!", {
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

        this.add.text(400, 400, "Press [R] to Restart", {
            fontSize: "20px",
            fill: "#cccccc"
        }).setOrigin(0.5);

        this.rKey = this.input.keyboard.addKey('R');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start("gameStartScene");
        }
    }
}
