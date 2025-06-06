window.GameState = {
    coins: 0,
    diamonds: 0,

    levelStartCoins: 0,
    levelStartDiamonds: 0,

    setCoins(userCoin) {
        this.coins = userCoin;
    },

    setDiamond(userDiamond) {
        this.diamonds = userDiamond;
    },

    saveCheckpoint() {
        this.levelStartCoins = this.coins;
        this.levelStartDiamonds = this.diamonds;
    },

    resetToCheckpoint() {
        this.coins = this.levelStartCoins;
        this.diamonds = this.levelStartDiamonds;
    }
};
