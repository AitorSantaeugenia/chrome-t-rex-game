export class Cloud {
  constructor(ctx, gameWidth, game) {
    this.ctx = ctx;
    this.gameWidth = gameWidth;
    this.game = game;

    this.width = 60;
    this.height = 25;
    this.posX = gameWidth;
    this.posY = Math.trunc(Math.random() * (window.innerHeight / 2 - 100 + 1) + 100);

    this.image = new Image();
    this.image.src = "./img/cloud.png";

    this.velX = 2;
  }

  draw() {
    if (this.game.checkTimeZone() === "night") {
      this.image.src = "./img/cloud.png";
    } else {
      this.image.src = "./img/cloud.png";
    }

    this.ctx.drawImage(
      this.image,
      this.posX,
      this.posY,
      this.width,
      this.height
    );

    if (this.game.checkScore() >= 600 && this.game.checkScore() <= 2500) {
      this.velX = 3;
    } else if (this.game.checkScore() >= 2500 && this.game.checkScore() <= 4000) {
      this.velX = 4;
    } else if (this.game.checkScore() >= 4000) {
      this.velX = 5;
    }

    this.move();
  }

  move() {
    if (this.posX <= -this.width) {
      this.posX = this.gameWidth;
      this.posY = Math.trunc(Math.random() * (window.innerHeight / 2 - 100 + 1) + 100);
    }
    this.posX -= this.velX;
  }
}
