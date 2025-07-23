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
    background: String,
    range: Number,
    width: Number,
    playerSoldier: String,
    computerSoldier: String,
    soldiers: Array,
    
    start: Number,
    ending: Number,
    currentStepValue: Number,
    last: Number,
    isFired: Boolean
  }

  static context;

  prepare(event) {
    console.debug("start initialize");

    let width = window.innerWidth;
    let range = width/2;
    this.canvasTarget.width = width;


    this.isFiredValue = false;
    this.startValue = 0;
    this.endingValue = 0;
    this.rangeValue = range;
    this.widthValue = width;
    this.playerSoldierValue = "rebelEndor";
    this.computerSoldierValue = "stormTrooper";

    const positions = [
      [1.3, 205, false],
      [1.5, 210, false],
      [1.4, 235, false],
      [1.6, 240, false],
      [1.15, 225, true], //leader
    ];

    let soldiers = [];
    for (let index = 0; index < positions.length; index++) {
      const coord = positions[index];
      soldiers.push(this.recruitSoldier(coord[0], coord[1], 1, coord[2]));
      soldiers.push(this.recruitSoldier(coord[0], coord[1], 2, coord[2]));
    }
    this.soldiersValue = soldiers;
    console.debug(soldiers);

    console.debug("end initialize");
    // start the animation
    this.lastValue = requestAnimationFrame(this.step.bind(this));
  }

  // logical process for the animation
  step(timestamp) {
    // starting animation timestamp
    if (this.startValue === 0) {
      this.startValue = timestamp;
      this.currentStepValue = 1;
    }
    
    const elapsed = timestamp - this.startValue;
    if (this.endingValue == 0 && this.currentStepValue == 4) {
      console.debug("elapsed", elapsed);
      this.endingValue = elapsed + 1500;
    }

    // Switch between frames
    let frame = Math.floor(elapsed/150%4)+1;
    if (this.currentStepValue == 2) {
      frame = Math.floor((elapsed-1000)/100)+1;
    }

    if (this.currentStepValue == 1 && elapsed > 1000 && frame == 2) {
      this.currentStepValue = 2;
      console.info("switch to step "+this.currentStepValue);
    } else if (this.currentStepValue == 3 && this.soldiersValue[5].posX <= this.widthValue - this.soldiersValue[5].laserX - this.soldiersValue[5].shootX) {
      this.currentStepValue = 4;
      // ref.play('hit1');
      // ref.play('hit2');
      console.info("switch to step "+this.currentStepValue);
    } else if (this.currentStepValue == 4 && elapsed > this.endingValue) {
      cancelAnimationFrame(this.lastValue);
      return this.dispatch("done");
    }

    this.draw(elapsed, this.currentStepValue, frame);
    if (this.currentStepValue == 2 && frame == 6 && !this.isFiredValue) {
      this.isFiredValue = true;
      this.dispatch("sound", { detail: { file: this.soldiersValue[0].laserSound } });
      this.dispatch("sound", { detail: { file: this.soldiersValue[1].laserSound } });
    } else if (this.currentStepValue == 2 && frame == 10) {
      this.currentStepValue = 3;
      console.info("switch to step "+this.currentStepValue);
    }

    this.lastValue = requestAnimationFrame(this.step.bind(this));
  }

  // Draw the animation, depending on the step
  draw(elapsed, step, frame) {
    let soldiers = this.soldiersValue;
    let context = this.canvasTarget.getContext("2d");
    let background = new Image();
    background.src = this.backgroundValue;
    context.drawImage(background, 0, 0, this.widthValue, 300);
    
    let lastSide = null;
    let speed= 12;
    
    // draw each soldier and laser
    for (const index in soldiers) {
      const soldier = soldiers[index];

      if (lastSide != soldier.side) {
        context.translate(this.widthValue, 0);
        context.scale(-1, 1);
      }
      switch (step) {
        case 0:
        case 1:
          // Idle
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
          break;
        case 2:
          //prepare to shoot && shoot
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`fire ${Math.min(4, frame)}`)[0], soldier.posX, soldier.posY);
          if (frame > 6 && elapsed > 1500) {
            soldier.laserX = this.fire(context, soldier.laser, soldier.laserX, soldier.laserY, speed);
          }
          break;
        case 3:
          // Shooting
          soldier.laserX = this.fire(context, soldier.laser, soldier.laserX, soldier.laserY, speed);
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
          break;
        case 4:
          // Killed
          // if (!kills.includes(index)) {
            context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
            // } else {
              // speed = this.kill(context, soldier._idle[1], soldier.posX, soldier.posY, speed);
            // soldier.posX += speed;
            // soldier.posY -= speed/speed*15;
            // }
          soldier.laserX = this.fire(context, soldier.laser, soldier.laserX, soldier.laserY, speed);
          break;
        default:
          break;
      }
      lastSide = soldier.side;
    }
    // The canvas is flipped to draw the soldier at the right position, so it need to end on the right side
    if (lastSide == 1) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    this.soldiersValue = soldiers;
  }


  // Choose the kind of soldier to recruit
  recruitSoldier(ratioX, posY, side, isLeader) {
    let soldier;

    if (side == 1) {
      if (isLeader) {
        soldier = document.getElementById(this.playerSoldierValue);
      } else {
        soldier = document.getElementById(this.playerSoldierValue);
      }
    } else {
      if (isLeader) {
        soldier = document.getElementById(this.computerSoldierValue);
      } else {
        soldier = document.getElementById(this.computerSoldierValue);
      }
    }

    return { 
      id: soldier.id,
      side: side,
      posX: this.rangeValue*ratioX,
      posY: posY,
      laser: soldier.dataset.laserEffect,
      laserX: this.rangeValue * ratioX - parseInt(soldier.dataset.laserX),
      laserY: parseInt(soldier.dataset.laserY) + posY,
      shootX: parseInt(soldier.dataset.laserX),
      laserSound: soldier.dataset.laserSound,
      soldierSound: soldier.dataset.soldierSound
    };
  }

  // move the laser, and define its speed
  fire(context, path, x, y, speed=0) {
    let laser = new Image();
    laser.src = path;

    context.drawImage(laser, x, y);
    return x - speed;
  }

  // remove a soldier
  kill(context, soldier, x, y, speed=0) {
    context.drawImage(soldier, x, y);
    return speed;
  }

  stop() {
    console.debug("cancel animation");
    cancelAnimationFrame(this.lastValue);
  }
}
