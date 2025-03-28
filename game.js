import { Background } from './background.js';
import { Player } from './player.js';
import { Obstacle } from './obstacle.js';
import { Cloud } from './cloud.js';
import { Ptera } from './ptera.js';
import { Meteor } from './meteor.js';

export const Game = {
  canvas: undefined,
  ctx: undefined,
  width: undefined,
  height: undefined,
  framesCounter: 0,

  background: undefined,
  player: undefined,
  obstacles: [],
  clouds: [],
  pteras: [],
  meteors: [],
  timeZone: "day",

  //spacekey
  keys: {
    SPACE: 32,
    ArrowDown: 40,
    ArrowUp: 38,
  },

  //score
  score: 0,

  //sound
  hitSound: document.getElementById("hitSoundEff"),
  reachSoundEff: document.getElementById("reachSoundEff"),
  restartButton: document.getElementById("restartButton"),
  gameRunning: true,

  init() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.setDimensions();
    this.start();
  },

  setDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  start() {
    this.reset();

    this.refreshScreen();
  },

  refreshScreen() {
    this.interval = requestAnimationFrame(() => this.refreshScreen());

    this.isCollision() || this.isCollisionPteras()
      ? (this.gameRunning = false)
      : (this.gameRunning = true);
    this.isCollision() || this.isCollisionPteras() ? this.gameOver() : null;

    this.clear();
    this.rewards();
    this.drawAll();
    this.clearObstacles();

    this.framesCounter++;

    if (this.framesCounter % 1 === 0) {
      this.generateObstacles();
    }

    if (this.framesCounter % 2 === 0) {
      this.generateClouds();
    }

    this.generatePteras();
    this.generateMeteors();

    if (this.gameRunning === false) {
      this.drawGameOver();
    }
  },

  reset() {
    this.background = new Background(this.ctx, this.width, 40, this); //2527
    this.player = new Player(this.ctx, this.width, this.height, this.keys, this);
    this.obstacles = [];
  },

  drawAll() {
    this.background.draw();
    this.player.draw(this.framesCounter, this.checkGameOver(this.gameRunning));
    this.obstacles.forEach((obs) => obs.draw());
    this.clouds.forEach((obs) => obs.draw());
    this.pteras.forEach((obs) => obs.draw(this.framesCounter));
    this.meteors.forEach((meteor) => meteor.draw());
    //showing a score
    this.showScore();
  },

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },

  generateObstacles() {
    if (this.framesCounter % 60 === 0) {
      this.obstacles.push(
        new Obstacle(
          this.ctx,
          this.width,
          this.player.posY0,
          this.player.height,
          this
        )
      );
    }
  },

  generateClouds() {
    if (this.framesCounter % 300 === 0) {
      this.clouds.push(new Cloud(this.ctx, this.width, this));
    } else if (this.framesCounter === 1) {
      this.clouds.push(new Cloud(this.ctx, this.width, this));
    }
  },

  generatePteras() {
    if (this.framesCounter >= 1000 && this.framesCounter <= 2500) {
      if (this.framesCounter % 500 === 0) {
        this.pteras.push(new Ptera(this.ctx, this.width, this.height, this));
      }
    } else if (this.framesCounter >= 2500) {
      if (this.framesCounter % 250 === 0) {
        this.pteras.push(new Ptera(this.ctx, this.width, this.height, this));
      }
    }
  },

  generateMeteors() {
    if (this.framesCounter % 100 === 0) {
      this.meteors.push(new Meteor(this.ctx, this.width, this.height, this));
    }
  },

  clearObstacles() {
    this.obstacles = this.obstacles.filter((obs) => obs.posX >= 0);
    this.pteras = this.pteras.filter((obs) => obs.posX >= 0);
    this.meteors = this.meteors.filter((meteor) => meteor.posX >= 0);
  },

  isCollision() {
    return this.obstacles.some((obs) => {
      return (
        this.player.posX + this.player.width - 30 >= obs.posX &&
        this.player.posY + this.player.height - 40 >= obs.posY &&
        this.player.posX <= obs.posX + obs.width - 40
      );
    });
  },

  isCollisionPteras() {
    if (this.player.checkRunningMethod() === "running") {
      return this.pteras.some((obs) => {
        return (
          this.player.posX + this.player.width - 50 >= obs.posX &&
          this.player.posY + this.player.height - 20 >= obs.posY + 20 &&
          this.player.posY - 20 <= obs.posY
        );
      });
    } else if (this.player.checkRunningMethod() === "crouch") {
      return this.pteras.some((obs) => {
        return (
          this.player.posX + this.player.width - 50 >= obs.posX &&
          this.player.posY + this.player.height - 20 >= obs.posY &&
          this.player.posY <= obs.posY - 20
        );
      });
    }
  },

  gameOver() {
    this.hitSound.play();
    this.gameRunning = false;

    cancelAnimationFrame(this.interval);

    // Actualizar el score final
    document.getElementById("finalScore").textContent = this.score;

    // Mostrar el formulario
    document.getElementById("gameOverForm").classList.remove("hidden");
  },

  drawGameOver() {
    this.ctx.font = "32px P2S";
    this.ctx.fillStyle = "#535353";
    this.ctx.fillText(
      "G A M E  O V E R",
      window.innerWidth / 2 - 250,
      window.innerHeight / 2 - 122
    );
  },

  checkGameOver(gameRunning) {
    if (!gameRunning) {
      gameRunning = false;
    }
    this.gameRunning = gameRunning;

    return this.gameRunning;
  },

  showScore() {
    if (this.checkTimeZone() === "night") {
      this.ctx.fillStyle = "#fff";
    } else {
      this.ctx.fillStyle = "#535353";
    }

    this.ctx.font = "35px P2S";

    //this should be a for, but we'll come later for this
    if (String(this.score).length === 1) {
      this.ctx.fillText(this.score++, window.innerWidth - 100, 200);
    } else if (String(this.score).length === 2) {
      this.ctx.fillText(this.score++, window.innerWidth - 135, 200);
    } else if (String(this.score).length === 3) {
      this.ctx.fillText(this.score++, window.innerWidth - 170, 200);
    } else if (String(this.score).length === 4) {
      this.ctx.fillText(this.score++, window.innerWidth - 205, 200);
    } else if (String(this.score).length === 5) {
      this.ctx.fillText(this.score++, window.innerWidth - 240, 200);
    } else if (String(this.score).length === 6) {
      this.ctx.fillText(this.score++, window.innerWidth - 275, 200);
    }
  },

  rewards() {
    if (this.score % 500 === 0 && this.score >= 400) {
      reachSoundEff.volume = 0.1;
      reachSoundEff.play();
    }
  },

  checkScore() {
    return this.score;
  },

  checkTimeZone() {
    if (this.score % 1000 === 0 && this.score % 2000 !== 0) {
      this.timeZone = "night";
    } else if (this.score % 2000 === 0) {
      this.timeZone = "day";
    }

    return this.timeZone;
  },
};
