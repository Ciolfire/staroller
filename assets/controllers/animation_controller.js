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
    currentStep: Number,
    last: Number,
    isFired: Boolean
  }

  static context;

  prepare(event) {
    console.debug("start initialize");

    let width = window.innerWidth;
    let range = width/2;
    this.canvasTarget.width = width;


    this.startValue = undefined;
    this.isFired = false;
    this.rangeValue = range;
    this.widthValue = width;
    this.playerSoldierValue = "rebelEndor";
    this.computerSoldierValue = "stormTrooper";
    // needed ?
    // this.currentStepValue = undefined;
    // this.endingValue = undefined;

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
    console.log(soldiers);

    console.debug("end initialize");
    // start the animation
    this.lastValue = requestAnimationFrame(this.step.bind(this));
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
      laserY: posY + parseInt(soldier.dataset.laserY),
    };
  }

  // logical process for the animation
  step(timestamp) {
    // Initialize
    let currentStep = this.currentStepValue;
    let ending = this.endingValue;
    let frame;

    // starting animation timestamp
    if (this.startValue === 0) {
      this.startValue = timestamp;
      currentStep = 1;
    }

    // 
    const elapsed = timestamp - this.startValue;
    if (ending == null && currentStep == 4) {
      ending = elapsed;
    }
    
    // Switch between frames
    if (currentStep == 2) {
      frame = Math.floor((elapsed-1000)/100)+1;
    } else {
      frame = Math.floor(elapsed/150%4)+1;
    }

    if (currentStep == 1 && elapsed > 1000 && frame == 2) {
      currentStep = 2;
      console.info("switch to step "+currentStep);
    } else if (currentStep == 3 && this.soldiersValue[5].posX <= this.widthValue - this.soldiersValue[5].laserX) {
      currentStep = 4;
      // ref.play('hit1');
      // ref.play('hit2');
      console.info("switch to step "+currentStep);
    } else if (currentStep == 4 && elapsed > ending+1500) {
      cancelAnimationFrame(this.lastValue);
      return this.dispatch("done");
    }

    console.debug("draw", currentStep, frame);
    this.draw(elapsed, currentStep, frame);
    if (currentStep == 2 && frame == 6 && !this.isFiredValue) {
      this.isFiredValue = true;
      // played = ref.play('blaster1');
      // ref.play('blaster2');
      // ref.play('blaster1');
    } else if (currentStep == 2 && frame == 10) {
      currentStep = 3;
      console.info("switch to step "+currentStep);
    }

    this.currentStepValue = currentStep;
    this.endingValue = ending;
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
    for (const index in soldiers) {
      const soldier = soldiers[index];

      if (lastSide != soldier.side) {
        context.translate(this.widthValue, 0);
        context.scale(-1, 1);
      }
      switch (step) {
        case 2:
      console.log("laser", soldier.laserX, soldier.laserY);
      console.log("soldier", soldier.posX, soldier.posY);
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`fire ${Math.min(4, frame)}`)[0], soldier.posX, soldier.posY);
          if (frame > 6 && elapsed > 1500) {
            soldier.laserX = this.fire(context, soldier.laser, soldier.laserX, soldier.laserY, speed);
          }
          break;
        case 3:
          soldier.laserX = this.fire(context, soldier.laser, soldier.laserX, soldier.laserY, speed);
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
          break;
        case 4:
          // if (!kills.includes(index)) {
            // context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
          // } else {
            // speed = this.kill(context, soldier._idle[1], soldier.posX, soldier.posY, speed);
            // soldier.posX += speed;
            // soldier.posY -= speed/speed*15;
          // }
          soldier.laserX = this.fire(context, soldier.laser, soldier.laserX, soldier.laserY, speed);
          break;
        default:
          context.drawImage(document.getElementById(soldier.id).getElementsByClassName(`idle ${frame}`)[0], soldier.posX, soldier.posY);
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

  // move the laser, and define its speed
  fire(context, path, x, y, speed=0) {
    console.log(x, y);
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
