export class Obstacle {
    constructor(ctx, w, posY0, h, game) {
      this.ctx = ctx;
      this.width = 40;  // Ancho fijo del cactus
      this.game = game;
  
      // Seleccionar aleatoriamente un cactus (0-6)
      this.randomCactus = Math.floor(Math.random() * 7); // 0-6
      this.image = new Image();
      this.image.src = `./img/cactus/cactus${this.randomCactus}.png`;
  
      this.posX = w;
      this.posY = window.innerHeight / 2 + 30;  // Posición Y en la mitad de la pantalla
      this.height = 60;  // Alto fijo del cactus
  
      this.velX = 10;
    }
  
    draw() {
      if (this.game.checkTimeZone() === "night") {
        this.image.src = `./img/nightime/cactus/cactus${this.randomCactus}.png`;
      } else {
        this.image.src = `./img/cactus/cactus${this.randomCactus}.png`;
      }
  
      this.ctx.drawImage(
        this.image,
        this.posX,
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
        this.posX = this.width;
      }
      this.posX -= this.velX;
    }
  } 