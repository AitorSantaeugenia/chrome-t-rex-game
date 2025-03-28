import { Game } from './game.js';

export class Background {
  constructor(ctx, w, h, game) {
    this.ctx = ctx;
    this.width = w;
    this.height = h;
    this.game = game;

    this.image = new Image();
    this.image.src = "./img/dino_t_rex_chrome_map.png";

    this.posX = 0;
    this.posY = window.innerHeight / 2 + 50;

    this.velX = 10;
  }

  draw() {
    // (this.height);
    if (this.game.checkTimeZone() === "night") {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.width, window.innerHeight);
      this.image.src = "./img/nightime/dino_t_rex_chrome_map.png";
    } else {
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.width, window.innerHeight);
      this.image.src = "./img/dino_t_rex_chrome_map.png";
    }

    this.ctx.drawImage(
      this.image,
      this.posX,
      this.posY,
      this.width,
      this.height
    );
    this.ctx.drawImage(
      this.image,
      this.posX + this.width,
      this.posY,
      this.width,
      this.height
    );

    if (this.game.checkScore() >= 600 && this.game.checkScore() <= 2500) {
      this.velX = 12;
    } else if (this.game.checkScore() >= 2500 && this.game.checkScore() <= 4000) {
      this.velX = 15;
    } else if (this.game.checkScore() >= 4000) {
      this.velX = 20;
    }

    this.move();
  }

  move() {
    if (this.posX <= -this.width) {
      this.posX = 0;
    }
    this.posX -= this.velX;
  }
}
