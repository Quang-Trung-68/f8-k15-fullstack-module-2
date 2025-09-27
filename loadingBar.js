// loadingBar.js
export const LoadingBar = {
  el: document.getElementById("loading-bar"),

  start() {
    if (!this.el) return;
    this.el.style.opacity = "1";
    this.el.style.width = "30%"; // bắt đầu tăng
    this.timer = setInterval(() => {
      let current = parseFloat(this.el.style.width);
      if (current < 90) {
        this.el.style.width = current + Math.random() * 10 + "%";
      }
    }, 400);
  },

  finish() {
    if (!this.el) return;
    clearInterval(this.timer);
    this.el.style.width = "100%";
    setTimeout(() => {
      this.el.style.opacity = "0";
      this.el.style.width = "0";
    }, 500);
  },
};
