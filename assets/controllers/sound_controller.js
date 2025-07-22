import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {

  play(event) {
    let audio = new Audio(event.params.file);
    audio.play();
  }
}
