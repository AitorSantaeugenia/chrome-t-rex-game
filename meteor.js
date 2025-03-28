export class Meteor {
    constructor(ctx, w, h, game) {
        this.ctx = ctx;
        this.gameWidth = w;
        this.gameHeight = h;
        this.game = game;
    
        this.image = new Image();
    
        // Posición inicial aleatoria en el eje X superior
        this.posX = Math.random() * (this.gameWidth - 40);  // Posición aleatoria entre 0 y (ancho - 40)
        this.posY = -40;  // Comienza fuera de la pantalla por arriba
        this.width = 40;
        this.height = 40;
    
        this.velX = -3;  // Velocidad horizontal negativa (movimiento hacia la izquierda)
        this.velY = 5;  // Velocidad vertical
        this.exploded = false;  // Estado de explosión
        this.explosionSize = 0;  // Tamaño de la explosión
        this.explosionMaxSize = 50;  // Tamaño máximo de la explosión
        this.explosionSpeed = 2;  // Velocidad de la explosión
    }
    
    draw() {
        if (this.game.checkTimeZone() === "night") {
            this.ctx.fillStyle = "#000000";
            this.ctx.strokeStyle = "#FFFFFF";
        } else {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.strokeStyle = "#000000";
        }
    
        if (!this.exploded) {
            /* Código original de dibujo del meteorito
            // Dibujar la cola en forma de estrella
            this.ctx.beginPath();
            // Cola norte
            this.ctx.moveTo(this.posX + this.width/2, this.posY + this.height/2);
            this.ctx.lineTo(this.posX + this.width/2 - 10, this.posY + this.height/2 - 20);
            this.ctx.lineTo(this.posX + this.width/2 + 10, this.posY + this.height/2 - 20);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        
            // Cola sur
            this.ctx.beginPath();
            this.ctx.moveTo(this.posX + this.width/2, this.posY + this.height/2);
            this.ctx.lineTo(this.posX + this.width/2 - 10, this.posY + this.height/2 + 20);
            this.ctx.lineTo(this.posX + this.width/2 + 10, this.posY + this.height/2 + 20);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        
            // Cola este
            this.ctx.beginPath();
            this.ctx.moveTo(this.posX + this.width/2, this.posY + this.height/2);
            this.ctx.lineTo(this.posX + this.width/2 + 20, this.posY + this.height/2 - 10);
            this.ctx.lineTo(this.posX + this.width/2 + 20, this.posY + this.height/2 + 10);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        
            // Cola oeste
            this.ctx.beginPath();
            this.ctx.moveTo(this.posX + this.width/2, this.posY + this.height/2);
            this.ctx.lineTo(this.posX + this.width/2 - 20, this.posY + this.height/2 - 10);
            this.ctx.lineTo(this.posX + this.width/2 - 20, this.posY + this.height/2 + 10);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            */

            // Dibujar el cuerpo del meteorito (círculo)
            this.ctx.beginPath();
            this.ctx.arc(
                this.posX + this.width/2,
                this.posY + this.height/2,
                this.width/2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.stroke();

            // Verificar colisión con el rex antes de explotar
            this.checkCollisionWithRex();
        } else {
            // Dibujar la explosión
            this.ctx.beginPath();
            this.ctx.arc(
                this.posX + this.width/2,
                this.posY + this.height/2,
                this.explosionSize,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.stroke();

            // Verificar colisión con el rex
            this.checkCollisionWithRex();
        }

        this.move();  // Llamar al método move
    }
    
    move() {
        if (!this.exploded) {
            this.posX += this.velX;  // Movimiento horizontal
            this.posY += this.velY;  // Movimiento vertical
            
            // Si llega al centro, explota
            if (this.posY >= this.gameHeight / 2 + 40) {
                this.exploded = true;
                this.posY = this.gameHeight / 2 + 40;
            }
        } else if (this.explosionSize < this.explosionMaxSize) {
            // Crecer la explosión
            this.explosionSize += this.explosionSpeed;
        } else {
            // Cuando la explosión alcanza su tamaño máximo, eliminar el meteorito
            this.game.meteors = this.game.meteors.filter(meteor => meteor !== this);
        }
    }

    checkCollisionWithRex() {
        // Obtener la posición del rex
        const rex = this.game.player;
        
        // Calcular la distancia entre el centro del meteorito/explosión y el rex
        const meteorCenterX = this.posX + (this.width/2);
        const meteorCenterY = this.posY + (this.height/2);
        const rexCenterX = rex.posX + rex.width/2;
        const rexCenterY = rex.posY + rex.height/2;
        
        const distance = Math.sqrt(
            Math.pow(meteorCenterX - rexCenterX, 2) + 
            Math.pow(meteorCenterY - rexCenterY, 2)
        );
        
        // Si la distancia es menor que el radio del meteorito/explosión más el radio del rex
        const collisionRadius = this.exploded ? this.explosionSize : this.width/2;
        if (distance < collisionRadius + rex.width/2) {
            // El rex ha sido golpeado por el meteorito o la explosión
            this.game.gameOver();
            this.game.hitSound.play();  // Reproducir sonido de colisión
        }
    }
} 