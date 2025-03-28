import { Game } from './game.js';

export class Ptera {
  constructor(ctx, gameWidth, gameHeight, game) {
    this.ctx = ctx;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.game = game;
    //we now generate pteras from when the dino is running, to his max jump posY
    this.randomNumber = Math.trunc(
      Math.random() * (this.gameHeight / 2 - 200 + 1) + 200
    );

    this.width = 60;
    this.height = 40;
    this.posX = gameWidth;
    this.posY = this.randomNumber;

    //cactus image
    this.image = new Image();
    this.image.src = `./img/trex/ptera.png`;
    this.image.framesIndex = 0;
    this.image.frames = 2;

    this.velX = 15;
  }

  draw(framesCounter) {
    if (this.game.checkTimeZone() === "night") {
      this.image.src = "./img/nightime/trex/ptera.png";
    } else {
      this.image.src = `./img/trex/ptera.png`;
    }

    this.ctx.drawImage(
      this.image,
      (this.image.framesIndex * this.image.width) / this.image.frames,
      0,
      this.image.width / this.image.frames,
      this.image.height / 2 + 10,
      this.posX,
      this.posY,
      this.width,
      this.height
    );

    //check colision border of the ptera
    //this.ctx.strokeRect(this.posX, this.posY, this.width, this.height);
    if (this.game.checkScore() >= 2500) {
      this.velX = 20;
    }

    this.animate(framesCounter);
    this.move();
  }

  move() {
    this.posX -= this.velX;
  }
  animate(framesCounter) {
    if (framesCounter % 10 == 0) {
      this.image.framesIndex++;
    }
    if (this.image.framesIndex >= this.image.frames) {
      this.image.framesIndex = 0;
    }
  }
}
