/*     Lode Runner

Aluno 1: 55261 Rodrigo Félix
Aluno 2: 55584 Inês Simões

Comentario:

Foram implementados todos os aspetos do jogo referidos no enunciado. Para além
disso, também permitimos que o jogador mude a direção para que está virado
clicando na seta para cima ou para baixo, facilitando assim os disparos quando 
se encontra sem espaço para mover.
O jogador tem 5 tentativas por nível e quando perde tem de voltar ao nível 
inicial.

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/


// GLOBAL VARIABLES

// tente não definir mais nenhuma variável global

let empty, hero, control;


// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
	}

	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
			x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}

	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}

	isBarrier() { }

	animation() { }

}

class PassiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
	}

	show() {
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}

	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}

	isClimbable() { return false; }

	isCrossable() { return false; }

	isVisible() { return true; }

	isTrespassable() { return false; }

	canOnlyFallThrough() { return false; }

}

//classes abstratas extensiveis de passive actor
class Destroyable extends PassiveActor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.timeDestroyed = -1;
	}

	destroy() {
		this.timeDestroyed = control.time;
		this.imageName = "empty";
		this.show();
	}

	isDestroyed() {
		return this.imageName == "empty";
	}

	regenerate() { }

	isTrespassable() {
		if (this.imageName == "empty") { return true; }
		return false;
	}

	isBarrier() {
		if (this.imageName == "empty") { return false; }
		return true;
	}

	timeForRegeneration() { }

	canGetStuck() { }
}

class Collectibles extends PassiveActor {

	isTrespassable() { return true; }

}
//

class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.facingRight = false;
	}

	show() {
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}

	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}

	setFacingDirection(dx) {
		if (dx < 0) {
			this.facingRight = false;
		} else if (dx > 0) {
			this.facingRight = true;
		}
	}

	isFalling() { }

}

//classes abstratas extensiveis de active actor
class Villains extends ActiveActor {

	drop() { }
}

class GoodGuys extends ActiveActor { }
//

class Brick extends Destroyable {
	constructor(x, y) { super(x, y, "brick"); }

	regenerate() {
		this.imageName = "brick";
		this.show();
		this.timeDestroyed = -1;
	}

	timeForRegeneration() {
		return control.time - this.timeDestroyed >= 60;
	}

	canGetStuck() { return true; }

}

class Chimney extends PassiveActor {
	constructor(x, y) { super(x, y, "chimney"); }

	isBarrier() { return false; }

	isTrespassable() { return true; }

	canOnlyFallThrough() { return true; }
}

class Empty extends PassiveActor {
	constructor() { super(-1, -1, "empty"); }
	show() { }
	hide() { }

	isBarrier() { return false; }

	isTrespassable() { return true; }
}

class Gold extends Collectibles {
	constructor(x, y) { super(x, y, "gold"); }

	isBarrier() { return false; }
}

class Invalid extends PassiveActor {
	constructor(x, y) { super(x, y, "invalid"); }

	isBarrier() { return true; }
}

class Ladder extends PassiveActor {
	constructor(x, y) {
		super(x, y, "empty");
	}

	isVisible() {
		if (this.imageName == "ladder") { return true; }
		return false;
	}

	makeVisible() {
		this.imageName = "ladder";
		this.show();
	}

	isBarrier() { return false; }

	isClimbable() {
		if (this.imageName == "ladder") { return true; }
		return false;
	}

	isTrespassable() {
		if (this.imageName == "ladder") { return false; }
		return true;
	}

	animation() { this.makeVisible(); }
}

class Rope extends PassiveActor {
	constructor(x, y) { super(x, y, "rope"); }

	isBarrier() { return false; }

	isCrossable() { return true; }
}

class Stone extends PassiveActor {
	constructor(x, y) { super(x, y, "stone"); }

	isBarrier() { return true; }
}

class Boundary extends Stone {
	constructor() { super(-1, -1); }
	show() { }
	hide() { }
}

class Hero extends GoodGuys {
	constructor(x, y) {
		super(x, y, "hero_runs_left");
		this.isShooting = false;
	}

	isBarrier() { return true; }

	checkForCollectibles(behind) {
		if (behind instanceof Collectibles) {
			behind.hide();
			control.gainPoints(50);
			control.catchCollectibles();
		}
	}

	checkBurried() {
		let behind = control.getBehind(this.x, this.y);
		if ((behind instanceof Destroyable) && !behind.isDestroyed()) {
			control.decAttempts();
		}
	}

	move(dx, dy) {
		let next = control.get(this.x + dx, this.y + dy);
		let nextBehind = control.getBehind(this.x + dx, this.y + dy);
		let behind = control.getBehind(this.x, this.y);
		if (!(behind.isCrossable()) && (dy != 0) && !(behind.isClimbable()) &&
			!(nextBehind.isClimbable()) && !this.isFalling()) {
			;

		} else if (dy < 0 && behind.isCrossable()) {
			;

		} else if (next instanceof Villains && !control.died) {
			control.decAttempts();

		} else if (next.isBarrier()) {
			;

		} else if(dx != 0 && next.canOnlyFallThrough()){
			;

		} else {
			this.checkForCollectibles(nextBehind);
			super.move(dx,dy);
		}
	}

	shoot() {
		let target;
		let nextBehind; //objeto inativo a frente dele
		let recoilBehind; //objeto inativo onde o heroi fica depois do disparo
		let recoilAtFeet; //objeto inativo no chao onde o heroi fica com o coice
		this.isShooting = true;
		if (this.facingRight) {
			target = control.getBehind(this.x + 1, this.y + 1);
			nextBehind = control.getBehind(this.x + 1, this.y);
			recoilBehind = control.getBehind(this.x - 1, this.y);
			recoilAtFeet = control.getBehind(this.x - 1, this.y + 1);
		} else {
			target = control.getBehind(this.x - 1, this.y + 1);
			nextBehind = control.getBehind(this.x - 1, this.y);
			recoilBehind = control.getBehind(this.x + 1, this.y);
			recoilAtFeet = control.getBehind(this.x + 1, this.y + 1);
		}

		if (!nextBehind.isBarrier() && target instanceof Destroyable 
			&& !target.isDestroyed()) {
			target.destroy();
		}

		if (!recoilBehind.isBarrier() 
			&& (recoilAtFeet.isBarrier() || recoilAtFeet.isClimbable())) {
			if (this.facingRight) {
				this.move(-1, 0);
			} else {
				this.move(1, 0);
			}
		}
		this.isShooting = false;
	}

	isFalling() {
		let behind = control.getBehind(this.x, this.y); //tem de estar vazio
		let atFeetBehind = control.getBehind(this.x, this.y + 1); //sem chao
		let atFeet = control.get(this.x, this.y + 1); //nao pode ter um vilao
		return behind.isTrespassable() 
			&& (atFeetBehind.isCrossable() || atFeetBehind.isTrespassable())
			&& !((atFeetBehind instanceof Destroyable) 
			&& atFeetBehind.isDestroyed() && (atFeet instanceof Villains));
	}

	canShoot() {
		let behind = control.getBehind(this.x, this.y); //tem de estar vazio
		let atFeet = control.getBehind(this.x, this.y + 1); 
		return ((behind.isTrespassable() && !behind.canOnlyFallThrough()) 
			|| behind.isClimbable())
			&& (atFeet.isBarrier() || atFeet.isClimbable());
	}

	animation() {
		let k = control.getKey();
		this.show();
		this.checkBurried();
		if (this.isFalling()) {
			this.move(0, 1);
		} else if (k == ' ') {
			if (this.canShoot()) { this.shoot(); }
		} else if (k == null) {
			; //nada
		} else {
			let [dx, dy] = k;
			this.setFacingDirection(dx);
			//subir e descer vai mudando o sentido
			if (dy != 0) { this.facingRight = !this.facingRight }
			this.move(dx, dy);
		}
	}

	show() { //pode ser aqui que e redefinida a imagem do heroi
		let behind = control.getBehind(this.x, this.y);
		//this.imageName = "hero_runs_right";
		if (this.facingRight) {//direita
			if (this.isShooting) {
				this.imageName = "hero_shoots_right"
			} else
			if (behind.isClimbable()) {// escada
				this.imageName = "hero_on_ladder_right";
			} else if (behind.isCrossable()) {//corda
				this.imageName = "hero_on_rope_right"
			} else if (this.isFalling()) {//cair
				this.imageName = "hero_falls_right"
			} else{
//situacoes default, por aqui os ifs caso se criem novos casos c/ novas imagens
				//imagem default para a direita
				this.imageName = "hero_runs_right"
			}

		} else {//esquerda
			if (this.isShooting) {
				this.imageName = "hero_shoots_left"
			} else if (behind.isClimbable()) {// escada
				this.imageName = "hero_on_ladder_left"
			} else if (behind.isCrossable()) {//corda
				this.imageName = "hero_on_rope_left"
			} else if (this.isFalling()) {//cair
				this.imageName = "hero_falls_left"
			} else  {
//situacoes default, por aqui os ifs caso se criem novos casos c/ novas imagens
				//imagem default para a esquerda
				this.imageName = "hero_runs_left"
			}
		}
		super.show()
	}

}

class Robot extends Villains {
	constructor(x, y) {
		super(x, y, "robot_runs_right");
		this.dx = 1;
		this.dy = 0;
		this.timeHasCollectible = -1;
		this.collectible = null;
	}

	isBarrier() { return true; }

	checkForCollectibles(behind) {
		if (behind instanceof Collectibles && (this.timeHasCollectible == -1)) {
			this.collectible = behind;
			behind.hide();
			this.timeHasCollectible = control.time;
		}
	}

	timeForDropping() {
		return control.time - this.timeHasCollectible >= 40;
	}

	drop() {
		let atFeet = control.getBehind(this.x, this.y + 1);
		let actual = control.getBehind(this.x, this.y);
		let back;
		let difference;
		if (this.facingRight) {
			back = control.get(this.x - 1, this.y);
			difference = -1;
		} else {
			back = control.get(this.x + 1, this.y);
			difference = 1;
		}
		let behind = control.getBehind(this.x, this.y);
		let topBehind = control.getBehind(this.x, this.y - 1)
		//larga quando fica preso
		if (this.timeHasCollectible != -1 && (behind instanceof Destroyable) 
		&& behind.isDestroyed() && !topBehind.isBarrier()) {
			this.collectible.x = this.x;
			this.collectible.y = this.y - 1;
			topBehind = this.collectible;
			topBehind.show();
			this.timeHasCollectible = -1;
			this.collectible = null;

		//larga porque passou tempo e condicoes permitem
		} else if (back === empty && actual === empty 
			&& this.timeHasCollectible != -1 && this.timeForDropping() 
			&& atFeet.isBarrier()) {

			this.collectible.x = this.x + difference;
			this.collectible.y = this.y;

			back = this.collectible;
			back.show();
			this.timeHasCollectible = -1;
			this.collectible = null;
		}
	}

	checkBurried() {
		let behind = control.getBehind(this.x, this.y);
		if ((behind instanceof Destroyable) && !behind.isDestroyed()) {
			this.moveRegardless(0, -1);
		}
	}

	move(dx, dy) {
		let moved = false;
		let next = control.get(this.x + dx, this.y + dy);
		let nextBehind = control.getBehind(this.x + dx, this.y + dy);
		let behind = control.getBehind(this.x, this.y);
		if (!(behind.isCrossable()) && (dy != 0) && !(behind.isClimbable()) &&
			!(nextBehind.isClimbable()) && !this.isFalling()) {
			;
		} else if (dy < 0 && behind.isCrossable()) {
			;
		} else if (next instanceof GoodGuys && !control.died) {
			control.decAttempts();
		} else if (next.isBarrier()) {
			;
		} else if(dx != 0 && next.canOnlyFallThrough()){
			;
		} else {
			this.checkForCollectibles(nextBehind);
			super.move(dx,dy);
			moved = true;
		}
		return moved;
	}

	moveRegardless(dx, dy) {
		let next = control.get(this.x + dx, this.y + dy);
		let nextBehind = control.getBehind(this.x + dx, this.y + dy);

		if (!next.isBarrier()) {
			this.checkForCollectibles(nextBehind);
			super.move(dx,dy);
		}

	}

	isFalling() {
		let behind = control.getBehind(this.x, this.y); //tem de estar vazio
		let atFeetBehind = control.getBehind(this.x, this.y + 1); //nao chao
		let atFeet = control.get(this.x, this.y + 1); //nao pode ter um vilao
		return (behind.isTrespassable() && !(behind instanceof Destroyable 
			&& behind.canGetStuck()))
			&& (atFeetBehind.isCrossable() || atFeetBehind.isTrespassable())
			&& !((atFeetBehind instanceof Destroyable) 
			&& atFeetBehind.isDestroyed() && (atFeet instanceof Villains));
	}

	pathfinder() {
		let dx;
		let dy;

		if (hero.x - this.x > 0) { //heroi mais para a direita
			dx = 1; //anda para direita
		} else if (hero.x - this.x < 0) { //heroi mais para a esquerda
			dx = -1; //anda para a esquerda
		} else { //igual
			dx = 0; //nao move 
		}

		if (hero.y - this.y > 0) { //heroi mais para baixo
			dy = 1; //desce
		} else if (hero.y - this.y < 0) { //heroi mais para cima
			dy = -1; //sobe
		} else { //igual
			dy = 0; //nao move
		}

		return [dx, dy];
	}

	animation() {
		if (this.time % control.difficulty == 0) {
			this.show();
			let [dx, dy] = this.pathfinder();
			let actual = control.getBehind(this.x,this.y);
			let nextX = control.getBehind(this.x + dx, this.y);
			let atFeet = control.get(this.x, this.y + 1);
			let nextAtFeet = control.getBehind(this.x + dx, this.y + 1);
			let canGoX = (!actual.isClimbable() || nextAtFeet.isBarrier() 
				|| atFeet.isBarrier() || nextX.isClimbable() 
				|| nextX.isCrossable()) && !(actual instanceof Destroyable);
			this.checkBurried();
			if (this.isFalling()) {
				this.move(0, 1);
			} else {
				if (this.move(0, dy)) { this.facingRight = !this.facingRight 
				} else {
					if (canGoX) {
						this.setFacingDirection(dx);
						this.move(dx, 0);
					}
				}
			}
		}
	}
	
	show() { //pode ser aqui que e redefinida a imagem do heroi
		let behind = control.getBehind(this.x, this.y);
		//MUITOS CASOS
		//this.imageName = "robot_runs_right";
		if (this.facingRight) {//direita
			if (behind.isClimbable()) {// escada
				this.imageName = "robot_on_ladder_right";
			} else if (behind.isCrossable()) {//corda
				this.imageName = "robot_on_rope_right"
			} else if (this.isFalling()) {//cair
				this.imageName = "robot_falls_right"
			} else {
//situacoes default, por aqui os ifs caso se criem novos casos c/ novas imagens
				//imagem default para a direita
				this.imageName = "robot_runs_right"
			}

		} else {//esquerda
			if (behind.isClimbable()) {// escada
				this.imageName = "robot_on_ladder_left"
			} else if (behind.isCrossable()) {//corda
				this.imageName = "robot_on_rope_left"
			} else if (this.isFalling()) {//cair
				this.imageName = "robot_falls_left"
			} else {
//situacoes default, por aqui os ifs caso se criem novos casos c/ novas imagens
				//imagem default para a esquerda
				this.imageName = "robot_runs_left"
			}
		}
		super.show()
	}
}

// GAME CONTROL

class GameControl {
	constructor() {
		control = this;
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.boundary = new Boundary();
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(1);
		this.setupEvents();
		//
		this.maxAttemps = 5;
		this.attempts = control.maxAttemps;
		this.points = 0;
		this.levelpoints = 0;
		this.died = false;
		this.gameover = false;
		this.currLevel = 1;
		this.totalCollectibles = 0;
		this.caughtCollectibles = 0;
		this.secretPathFound = false;
		control.calcCollectibles();
		this.difficulty = 4; //default normal
		this.pause = false;
		this.eventinterval;
		this.pauseinterval;
	}

	setExtreme() {//botao extreme
		control.difficulty = 1;
	}
	setHard() {//botao hard
		control.difficulty = 2;
	}
	setNormal() {//botao normal
		control.difficulty = 4;
	}
	setEasy() {//botao easy
		control.difficulty = 8;
	}

//BOTAO PAUSE CHAMA ESTA FUNCAO
switchPause() {
        
	if(!control.pause){
		clearInterval(control.eventinterval);
		document.getElementById("Play").value = "▶ Play";
	} else {
		control.eventinterval = setInterval(control.animationEvent, 
								1000 / ANIMATION_EVENTS_PER_SECOND);
		document.getElementById("Play").value = "▮▮ Pause";
	}
	control.pause = !control.pause;
}

	catchCollectibles() {
		control.caughtCollectibles++;
		return true;
	}

	decAttempts() {
		control.attempts--;
		control.died = true;
		if (control.attempts == 0) { control.gameover = true; }
	}

	gainPoints(value) {
		control.levelpoints += value;
	}

	makeAllInvisible() {
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				control.getBehind(x,y).hide();
				control.get(x,y).hide();
			}
	}

	makeAllVisible() {
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				let ap = control.getBehind(x,y);
				if (!ap.isVisible()) {
					ap.animation();
				}
			}
		control.secretPathFound = true;
	}

	calcCollectibles() {
		control.totalCollectibles = 0;
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				if (control.world[x][y] instanceof Collectibles) {
					control.totalCollectibles++;
				}
			}
	}

	createMatrix() { // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for (let x = 0; x < WORLD_WIDTH; x++) {
			let a = new Array(WORLD_HEIGHT);
			for (let y = 0; y < WORLD_HEIGHT; y++)
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}

	regenerateDestroyed(a) {
		if (a instanceof Destroyable && a.timeForRegeneration()) {
			a.regenerate();
		}
	}

	villainsDrop(a) {
		if (a instanceof Villains) {
			a.drop();
		}
	}

	loadLevel(level) {
		if (level < 1 || level > MAPS.length)
			fatalError("Invalid level " + level)
		let map = MAPS[level - 1];  // -1 because levels start at 1
		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				// x/y reversed because map stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
	}
	getKey() {
		let k = control.key;
		control.key = 0;
		switch (k) {
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};
	}

	setupEvents() {
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		control.eventinterval = setInterval(this.animationEvent, 
								1000 / ANIMATION_EVENTS_PER_SECOND);
	}

	animationEvent() {

		control.time++;
		control.refreshStats();
		//
		if (control.died) {
			if (control.gameover) {
				control.pause = true;
				control.gameOverScreen();
			} else {
				control.startLevel(control.currLevel);
				control.died = false;
			}
		}
		
		if (control.caughtCollectibles == control.totalCollectibles 
			&& !control.secretPathFound) {
			control.makeAllVisible();
		}

		if (control.secretPathFound 
			&& control.getBehind(hero.x, hero.y).isClimbable() && hero.y == 0) {
			control.gainPoints(100);
			control.points += control.levelpoints;
			control.attempts = control.maxAttemps;
			if(control.currLevel < MAPS.length) {
				control.startLevel(++control.currLevel);
			} else {
				control.pause = true;
				control.winScreen();
			}
			
		}

		for (let x = 0; x < WORLD_WIDTH; x++)
			for (let y = 0; y < WORLD_HEIGHT; y++) {
				let a = control.get(x,y);
				let a2 = control.getBehind(x,y);
				if (a.time < control.time) {
					a.time = control.time;
					a.animation();
				}
				control.regenerateDestroyed(a2);
				control.villainsDrop(a);
			}
	}

	keyDownEvent(k) {
		control.key = k.keyCode;
	}

	keyUpEvent(k) { }

	startLevel(level) {
		control.levelpoints = 0;
		control.caughtCollectibles = 0;
		control.makeAllInvisible();
		control.secretPathFound = false;
		control.loadLevel(level);
		control.calcCollectibles();
	}

	restartGame() {
		control.died = false;
		control.gameover = false;
		control.currLevel = 1;
		control.attempts = control.maxAttemps;
		control.points = 0;
		control.ctx.fillStyle="#ffffff";
		control.ctx.fillRect(0, 0, 550, 550);
		control.startLevel(1);
		control.pause = false;
	}

	isInside(x, y) {
		return 0 <= x && x < WORLD_WIDTH && 0 <= y && y < WORLD_HEIGHT;
	}

	get(x, y) {
		if (!this.isInside(x, y)) {
			return this.boundary;
		} else if (control.worldActive[x][y] !== empty) {
			return control.worldActive[x][y];
		} else {
			return control.world[x][y];
		}
	}

	getBehind(x, y) {
		if (!this.isInside(x, y)) {
			return this.boundary;
		} else {
			return control.world[x][y];
		}
	}

	refreshStats() {
		document.getElementById("score").value = 
										control.points + control.levelpoints;
		document.getElementById("attempts").value = control.attempts;
		document.getElementById("level").value = 
										control.currLevel + "/" + MAPS.length;
		document.getElementById("caught").value = 
				control.caughtCollectibles + "/" + control.totalCollectibles;
	}

	gameOverScreen() {
		control.makeAllInvisible();
		control.ctx.fillStyle="#000000";
		control.ctx.fillRect(0, 0, 550, 550);
		
		control.ctx.fillStyle="#B80000";
		control.ctx.font="50px 'Bungee Inline', cursive";
		control.ctx.fillText("Game Over",100,150);

		control.ctx.fillStyle="#B80000";
		control.ctx.font="15px 'Lucida Console', Courier, monospace";
		control.ctx.fillText("Press ⟲ Restart to start a new game", 95, 180);
	
	}

	winScreen() {
		control.makeAllInvisible();
		control.ctx.fillStyle="#000000";
		control.ctx.fillRect(0, 0, 550, 550);
		
		control.ctx.fillStyle="#ffffff";
		control.ctx.font="50px 'Bungee Inline', cursive";
		control.ctx.fillText("You won!",120,150);

		control.ctx.fillStyle="#ffffff";
		control.ctx.font="15px 'Lucida Console', Courier, monospace";
		control.ctx.fillText("Press ⟲ Restart to start a new game", 100, 180);
	}
}

// HTML FORM

function onLoad() {
	// Asynchronously load the images an then run the game
	GameImages.loadAll(function () { new GameControl(); });
}

function b1() {
	var selection = document.getElementById("difficulty");
    var difficulty = selection.options[selection.selectedIndex].value;
	switch(difficulty) {
		case "Easy": control.setEasy();
			break;
		case "Normal": control.setNormal();
			break;
		case "Hard": control.setHard();
			break;
		case "Extreme": control.setExtreme();
			break;
		default:
			break;
	}

	selection.blur();
}

function b2() { 
	if(!control.gameover) { control.switchPause(); }
	document.getElementById("Play").blur();
}

function b3() {
	 control.restartGame();
	 document.getElementById("Reset").blur();
	}

let audio = null;
let musicpaused = true;

function b4() { 
	let musicButton = document.getElementById("Music");
	if(musicpaused){
		if(audio == null) {
			audio = new Audio("https://archive.org/download/SpiderMan2TheGamePizzaTheme/Spider-Man%202%20The%20Game%20Pizza%20Theme.mp3");
			audio.loop = true;
			audio.volume = 0.07;
		}
		audio.play();
		musicButton.value = "♫ Music off";
		musicpaused = false;
	} else {
		audio.pause();
		musicButton.value = "♫ Music on";
		musicpaused = true;
	}

	musicButton.blur();
}

function b5() {
	if(!control.gameover && !control.pause) {
		control.decAttempts();
	}
	document.getElementById("RestartLevel").blur();
}