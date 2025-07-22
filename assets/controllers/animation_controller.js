import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {

  static targets = [
    "canvas",
  ];

  static values = {
    backgroundFile: String,
    ctx: Object,
    background: Object,
    range: Number,
    width: Number
  }

  initialize(event) {
    console.debug("start drawing");
    
    let ctx = this.canvasTarget.getContext("2d");
    let background = new Image();
    let width = window.innerWidth;
    let range = width/2;
    this.canvasTarget.width = width;

    background.src = this.backgroundFileValue;

    this.backgroundValue = background;
    this.ctxValue = ctx;
    this.rangeValue = range;
    this.widthValue = width;
  }

  step(timestamp) {
    if (start == null) {
      start = timestamp;
      currentStep = 1;
    }
    const elapsed = timestamp - start;
      if (ending == null && currentStep == 4) {
        ending = elapsed;
      }

    let frame;
    if (currentStep == 2) {
      frame = Math.floor((elapsed-1000)/100)+1;
      } else {
        frame = Math.floor(elapsed/150%4)+1;
    }

    if (currentStep == 1 && elapsed > 1000 && frame == 2) {
      currentStep = 2;
      console.info("switch to step "+currentStep);
    } else if (currentStep == 3 && soldiers[5].posX <= width - soldiers[5].laserX - soldiers[5].soldier._shootX) {
      currentStep = 4;
      ref.play('hit1');
      ref.play('hit2');
      console.info("switch to step "+currentStep);
    } else if (currentStep == 4 && elapsed > ending+1500) {
      cancelAnimationFrame(last);
      ref.visible = false;
      return true;
    }

    draw(elapsed, currentStep, frame);
    if (currentStep == 2 && frame == 6 && !played) {
      played = ref.play('blaster1');
      ref.play('blaster2');
      // ref.play('blaster1');
    } else if (currentStep == 2 && frame == 10) {
      currentStep = 3;
      console.info("switch to step "+currentStep);
    }
    last = requestAnimationFrame(step);
  }

  // Draw the animation, depending on the step
  draw(elapsed, step, frame) {
    this.ctxValue.drawImage(background, 0, 0, width, 300);
    
    let lastSide = null;
    let speed= 12;
    // for (const index in soldiers) {
    //   const current = soldiers[index];
    //   const soldier = current.soldier;
    //   if (lastSide != current.side) {
    //     ctx.translate(width, 0);
    //     ctx.scale(-1, 1);
    //   }
    //   switch (step) {
    //     case 2:
    //       ctx.drawImage(soldier._start[Math.min(4, frame)], current.posX, current.posY);
    //       if (frame > 6 && elapsed > 1500) {
    //         current.laserX = fire(soldier._laser, current.laserX, current.laserY+soldier._shootY, speed);
    //       }
    //       break;
    //     case 3:
    //       current.laserX = fire(soldier._laser, current.laserX, current.laserY+soldier._shootY, speed);
    //       ctx.drawImage(soldier._idle[frame], current.posX, current.posY);
    //       break;
    //     case 4:
    //       if (!kills.includes(index)) {
    //         ctx.drawImage(soldier._idle[frame], current.posX, current.posY);
    //       } else {
    //         speed = kill(soldier._idle[1], current.posX, current.posY, speed);
    //         current.posX += speed;
    //         // current.posY -= speed/speed*15;
    //       }
    //       current.laserX = fire(soldier._laser, current.laserX, current.laserY+soldier._shootY, speed);
    //       break;
    //     default:
    //       ctx.drawImage(soldier._idle[frame], current.posX, current.posY);
    //       break;
    //   }
    //   lastSide = current.side;
    // }
    // The canvas is flipped to draw the soldier at the right position, so it need to end on the right side
    // if (lastSide == 1) {
    //   ctx.translate(width, 0);
    //   ctx.scale(-1, 1);
    // }
  }
}
