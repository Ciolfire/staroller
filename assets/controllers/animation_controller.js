import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {

  static targets = [
    "canvas",
    "soldier",
  ];

  static values = {
    background: String, // The background image path
    range: Number, // The distance between soldiers
    width: Number, // of the window
    playerSoldier: String, // user sprite
    computerSoldier: String, // ennemy sprite
    soldiers: Array, // soldiers list, all of them
    allies: Array, // soldiers list, allies
    enemies: Array, // soldiers list, enemies
    kills: Object, // soldiers to kill
    killed: Array, // killed soldiers
    
    start: Number, // timestamp
    ending: Number, // timestamp
    currentStepValue: Number, // which step of the whole animation
    last: Number, // reference to the last animation step
    isFired: Boolean, // true when the troops have fired

    speed: 12,
  }

  prepare({ detail: {content}}) {
    console.info("preparing animation");


    this.killsValue = content;
    this.killedValue = [];

    this.startValue = 0;
    this.endingValue = 0;
    this.currentStepValue = 1;
    this.isFiredValue = false;
    this.widthValue = window.innerWidth;
    this.rangeValue = window.innerWidth/2;
    this.canvasTarget.width = this.widthValue;
    this.playerGeneralValue = "hanSolo";
    this.playerArmyValue = "rebelEndor";
    this.enemyGeneralValue = "stormOfficier";
    this.enemyArmyValue = "stormTrooper";

    const positions = [
      [1.15, 225, true], //leader
      [1.3, 205, false],
      [1.5, 210, false],
      [1.4, 235, false],
      [1.6, 240, false],
    ];

    // let soldiers = [];
    let allies = [];
    let enemies = [];

    for (let index = 0; index < positions.length; index++) {
      const coord = positions[index];
      allies.push(this.recruitSoldier(coord[0], coord[1], 1, coord[2]));
      // soldiers.push(this.recruitSoldier(coord[0], coord[1], 1, coord[2]));
      enemies.push(this.recruitSoldier(coord[0], coord[1], 2, coord[2]));
      // soldiers.push(this.recruitSoldier(coord[0], coord[1], 2, coord[2]));
    }
    // this.soldiersValue = soldiers;
    this.alliesValue = allies;
    this.enemiesValue = enemies;

    console.info("start animation");
    // start the animation
    this.lastValue = requestAnimationFrame(this.step.bind(this));
  }

  // logical process for the animation
  step(timestamp) {
    // Animation starting timestamp
    if (this.startValue === 0) {
      this.startValue = timestamp;
      console.info(`step → ${this.currentStepValue} [starting]`);
    }
    const elapsed = timestamp - this.startValue;

    // Animation flagged to end
    if (this.endingValue == 0 && this.currentStepValue == 4) {
      // The more informations to process, the longer the after animation screen
      this.endingValue = elapsed + (this.killedValue.length * 400);
    } else if (this.currentStepValue == 4 && elapsed > this.endingValue) {
      // Animation is done
      cancelAnimationFrame(this.lastValue);
      return this.dispatch("done");
    }

    // Switch between frames
    let frame = Math.floor(elapsed/150%4)+1;
    if (this.currentStepValue == 2) {
      frame = Math.floor((elapsed-1000)/100)+1;
    }

    if (this.currentStepValue == 1 && elapsed > 1000 && frame == 2) {
      this.currentStepValue = 2;
      console.info(`step → ${this.currentStepValue} [target]`);
    }

    this.draw(elapsed, frame);
    if (this.currentStepValue == 2 && frame == 6 && !this.isFiredValue) {
      this.isFiredValue = true;
    } else if (this.currentStepValue == 2 && frame == 10) {
      this.currentStepValue = 3;
      console.info(`step → ${this.currentStepValue} [fire]`);
    }

    this.lastValue = requestAnimationFrame(this.step.bind(this));
  }

  // Draw the animation, depending on the step
  draw(elapsed, frame) {
    let context = this.canvasTarget.getContext("2d");
    let background = new Image();
    background.src = this.backgroundValue;
    // Draw the background
    context.drawImage(background, 0, 0, this.widthValue, 300);

    let allies = this.alliesValue;
    let enemies = this.enemiesValue;
    // Draw the enemy soldiers
    this.enemiesValue = this.drawSoldiers("enemies", enemies, this.alliesValue, frame, elapsed);
    // Draw the player soldiers, after flipping the canvas
    this.alliesValue = this.drawSoldiers("allies", allies, this.enemiesValue, frame, elapsed);
    // Flip the canvas back to its normal side
    this.alliesValue = allies;
    this.enemiesValue = enemies;
    if (
      this.killedValue.length == this.killsValue.allies.length + this.killsValue.enemies.length &&
      elapsed > this.endingValue
    ) {
      this.currentStepValue = 4;
      console.info(`step → ${this.currentStepValue} [ending]`);
    }
  }

  drawSoldiers(type, soldiers, opponent, frame, elapsed) {
    let context = this.canvasTarget.getContext("2d");
    let killed = this.killedValue;

    for (const index in soldiers) {
      const soldier = soldiers[index];
      switch (this.currentStepValue) {
        case 1:
          // Idle
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
          break;
        case 2:
          //prepare to shoot && shoot
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`fire ${Math.min(4, frame)}`)[0], soldier.posX, soldier.posY);
          if (frame > 6 && elapsed > 1500 + (index * 150)) {
            soldiers[index] = this.fire(soldier, context);
          }
          break;
        case 3:
        case 4:
          if ( soldier.isHit ||
            opponent[index].laserX <= this.widthValue - soldier.posX - soldier.shootX && this.killsValue[type].includes(Number.parseInt(index))
          ) {
            // Soldier is removed
            if (!soldier.isHit) {
              this.dispatch("sound", { detail: { file: soldier.hitSound } });
              soldiers[index].isHit = true;
              killed.push(soldier.id);
            }
            this.kill(context, frame, soldier);
            soldiers[index].posX += this.speedValue;
            soldiers[index].posY -= this.speedValue/2;
          } else {
            // Soldier is not removed, idle
            context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
          }
          if (!opponent[index].isHit) {
            soldiers[index] = this.fire(soldier, context);
          }
          break;
        default:
          break;
      }
    }

    context.translate(this.widthValue, 0);
    context.scale(-1, 1);

    this.killedValue = killed;

    return soldiers;
  }


  // Choose the kind of soldier to recruit
  recruitSoldier(ratioX, posY, side, isLeader) {
    let soldier;

    if (side == 1) {
      if (isLeader) {
        soldier = document.getElementById(this.playerGeneralValue);
      } else {
        soldier = document.getElementById(this.playerArmyValue);
      }
    } else {
      if (isLeader) {
        soldier = document.getElementById(this.enemyGeneralValue);
      } else {
        soldier = document.getElementById(this.enemyArmyValue);
      }
    }

    return { 
      id: soldier.id,
      posX: this.rangeValue*ratioX,
      posY: posY,
      laser: soldier.dataset.laserEffect,
      laserX: this.rangeValue * ratioX - parseInt(soldier.dataset.laserX),
      laserY: parseInt(soldier.dataset.laserY) + posY,
      shootX: parseInt(soldier.dataset.laserX),
      laserSound: soldier.dataset.laserSound,
      hitSound: soldier.dataset.hitSound,
      hasFired: false,
      isHit: false,
    };
  }

  // move the laser, and define its speed
  fire(soldier, context) {
    let laser = new Image();
    laser.src = soldier.laser;

    context.drawImage(laser, soldier.laserX, soldier.laserY);

    if (!soldier.hasFired) {
      this.dispatch("sound", { detail: { file: soldier.laserSound } });
      soldier.hasFired = true;
    }
    soldier.laserX -= this.speedValue;
    return soldier;
  }

  // remove a soldier
  kill(context, frame, soldier) {
    context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
  }

  stop() {
    console.info("end animation");
    cancelAnimationFrame(this.lastValue);
  }
}
