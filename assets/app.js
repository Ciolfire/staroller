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

document.addEventListener("gesturestart", function (e) {
	e.preventDefault();

  document.body.style.zoom = 0.99;
});

document.addEventListener("gesturechange", function (e) {
	e.preventDefault();

  document.body.style.zoom = 0.99;
});
document.addEventListener("gestureend", function (e) {
  e.preventDefault();

  document.body.style.zoom = 1;
});