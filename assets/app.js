import 'bootstrap/dist/css/bootstrap.min.css';

import './bootstrap.js';
/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
import './styles/app.css';
// import './styles/dice.css';

console.log('This log comes from assets/app.js - welcome to AssetMapper! 🎉');

let last_touch_end = 0;
document.addEventListener("touchend", function (e) {
  const now = (new Date()).getTime();
  if (now - last_touch_end <= 300) {
      e.preventDefault();
  }
  last_touch_end = now;
}, false);