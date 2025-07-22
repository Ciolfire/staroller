import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {
  static targets = [
    "page"
  ];

  switch(event) {
    this.pageTargets.forEach(element => {
      if (element.id != event.params.target) {
        element.classList.add("collapse");
      } else {
        element.classList.remove("collapse");
      }
    });
  }
}
