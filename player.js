import { Game } from './game.js';

export class Player {
  constructor(ctx, gameW, gameH, keys, game) {
    //Canvas properties
    this.ctx = ctx;
    this.gameWidth = gameW;
    this.gameHeight = gameH;
    this.game = game;

    //Player properties
    this.width = 80;
    this.height = 90;
    this.image = new Image();
    this.image.src = "./img/trex/dinowalk.png";
    //we add the image width here, and force it instead of calculate it later, so we solve the 0 bug
    //also we force this.image.height
    this.image.width = 376;
    this.image.height = 159;

    this.image.frames = 3;
    this.image.framesIndex = 2;
    //we add this to know the running method
    this.running = true;
    this.rcrouch = false;
    this.runningMethod = "running";

    //game property
    this.gameRunning = true;

    //Sounds
    this.jumpSound = document.getElementById("jumpSoundEff");

    //fixed positions for movement while we using keys
    this.posX = 50;
    this.posY = this.gameHeight / 2;
    this.posY0 = this.posY;

    //velocity and gravity
    this.velY = 1;
    this.gravity = 0.4;

    //changing position of TREX to Crouch or Running
    this.sx = this.image.width / this.image.frames;
    this.sy = 0;
    this.offSetRight = 33;
    this.offSetUp = 0;
    this.varOffset = 5;

    this.keys = keys;

    this.setListeners();
  }

  draw(framesCounter, gameRunning) {
    //this is to check the hitbox
    // this.ctx.strokeRect(this.posX, this.posY, this.width, this.height);

    this.gameRunning = gameRunning;

    if (this.gameRunning === false) {
      this.image.framesIndex = 2;
    }

    this.ctx.drawImage(
      this.image,
      this.image.framesIndex * this.sx - this.offSetRight + this.varOffset,
      this.sy,
      this.image.width / this.image.frames,
      this.image.height / 2 + 10,
      this.posX,
      this.posY + this.offSetUp,
      this.width,
      this.height
    );

    if (this.game.checkTimeZone() === "night") {
      this.image.src = "./img/nightime/trex/dinowalk.png";
    } else {
      this.image.src = "./img/trex/dinowalk.png";
    }

    this.animate(framesCounter);

    this.move();
  }

  animate(framesCounter) {
    if (this.running === true && this.rcrouch === false) {
      this.runningMethod = "running";
    } else if (this.rcrouch === true && this.running === false) {
      this.runningMethod = "crouch";
    }

    if (framesCounter % 5 == 0) {
      this.image.framesIndex++;
    }

    //we don't want to show the third frame (it's when dino hits an obstacle)
    if (this.image.framesIndex >= 2 && this.gameRunning === true) {
      this.image.framesIndex = 0;
    }
  }

  move() {
    if (this.posY < this.posY0) {
      // Saltando
      this.posY += this.velY;
      this.velY += this.gravity;
    } else {
      this.posY = this.posY0;
      this.velY = 1;
    }
  }

  setListeners() {
    document.addEventListener("keydown", (e) => {
      switch (e.keyCode) {
        case this.keys.SPACE:
          if (this.posY >= this.posY0) {
            this.jump();
          }
          break;

        case this.keys.ArrowDown:
          this.crouch();

          break;

        case this.keys.ArrowUp:
          this.defaultRun();

          break;
      }
    });
  }

  jump() {
    this.posY -= 120;
    this.velY -= 8;
    //we need to work here with the sound bug after game false
    if (this.gameRunning === true) {
      this.jumpSound.play();
    } else if (this.gameRunning === false) {
      this.jumpSound.volume = 0;
      this.jumpSound.stop();
    }
  }

  crouch() {
    this.rcrouch = true;
    this.running = false;
    this.sx = this.image.width / this.image.frames + 5;
    this.sy = this.image.height / 2 + 20;
    this.offSetUp = 50;
    this.velY += 8;
    this.offSetRight = 0;
    this.varOffset = 0;
  }

  defaultRun() {
    this.running = true;
    this.rcrouch = false;
    this.sx = this.image.width / this.image.frames;
    this.sy = 0;
    this.offSetRight = 33;
    this.offSetUp = 0;
    this.varOffset = 5;
  }

  checkRunningMethod() {
    return this.runningMethod;
  }
}
