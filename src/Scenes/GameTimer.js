window.GameTimer = {
    startTime: null,

    start() {
        this.startTime = Date.now();
    },

    getElapsed() {
        return this.startTime != null ? (Date.now() - this.startTime) / 1000 : 0;
    },

    reset() {
        this.startTime = null;
    }
};
