import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {

  play(event) {
    console.debug(event);
    let audio = new Audio(event.params.file);
    audio.play();
  }

  effect({ detail: { file } }) {
    console.debug(file);
    let audio = new Audio(file);
    audio.play();
  }
}
