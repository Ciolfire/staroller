import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {
  static targets = [
    "count",
    "roll",
    "success",
    "failure",
    "force",
    "result",
    "details"
  ];

  static values = {
    dice: Object,
    pool: Object,
    result: Object,
    details: Array,
    symbols: Object
  }

  connect() {
    this.detailsValue = [];
    this.countTargets.forEach(count => {
      let value = count.lastElementChild.value;
      let type = count.id;

      // update the display value
      count.firstElementChild.innerText = value;

      this.addToPool(type, value);
      if (value == count.dataset.max) {
        document.getElementsByClassName(`btn-add ${type}`)[0].classList.add("disabled");
      } else if (value == 0) {
        document.getElementsByClassName(`btn-remove ${type}`)[0].classList.add("disabled");
      }
    });

    // console.debug(this.poolValue);
    if (Object.values(this.poolValue).reduce((a, b) => a +b, 0) > 0) {
      this.rollTarget.classList.remove('disabled');
    }
  }

  reset(event) {
    // Update values
    this.poolValue = {};
    // Update form
    this.countTargets.forEach(count => {
      count.lastElementChild.value = 0;
      count.firstElementChild.innerText = 0;
    });
    // Update btns
    for (const element of document.getElementsByClassName("btn-remove")) {
      element.classList.add("disabled");
    }
    for (const element of document.getElementsByClassName("btn-add")) {
      element.classList.remove("disabled");
    }
    this.rollTarget.classList.add("disabled");
  }

  update(event) {
    let target = event.currentTarget;
    let change = parseInt(event.params.change);

    this.countTargets.forEach(count => {
      // We found the right total to update
      if (count.id == event.params.type) {
        console.debug(count.id, event.params.type)
        let label = count.firstElementChild;
        let input = count.lastElementChild;
        let value = parseInt(input.value) + change;

        // Deactivate the button if needed
        if (value == 0 || value >= event.params.max) {
          target.classList.add("disabled");
        } else {
          if (change > 0) {
            target.parentElement.closest(".row").getElementsByClassName("btn-remove")[0].classList.remove("disabled");
          } else {
            target.parentElement.closest(".row").getElementsByClassName("btn-add")[0].classList.remove("disabled");
          }
        }

        input.value = value;
        label.innerText = value;
        // update the value
        this.addToPool(count.id, value);
        console.debug(this.poolValue);

        // update the button
        if (Object.values(this.poolValue).reduce((a, b) => a +b, 0) > 0) {
          this.rollTarget.classList.remove('disabled');
        } else {
          this.rollTarget.classList.add('disabled');
        }
      }
    });
  }

  addToPool(type, value) {
    let pool = this.poolValue;
    pool[type] = value;
    this.poolValue = pool;
    // console.debug(this.poolValue);
  }


  roll() {
    let result = {};
    if (!this.isForceOnly()) {
      result = { 'success': 0 };
    }
    let details = [];
    
    console.debug(this.poolValue);
    // Fetch the info for each dice type
    for (const [type, count] of Object.entries(this.poolValue)) {
      // console.debug(type, this.diceValue);
      let faces = this.diceValue[type].faces;
      for (let index = 0; index < count; index++) {
        let roll = faces[1 + Math.floor(Math.random() * Object.keys(faces).length)];

        // add to the details list
        details.push([type, roll]);
        // sum it up
        for (var key in roll) {
          if (!result[key]) {
            result[key] = roll[key];
          } else {
            result[key] += roll[key];
          }
        }
      }
    }

    this.resultValue = result;
    this.detailsValue = details;
    // console.debug(this.resultValue, this.detailsValue);

    // We dispatch the event for the animation
    this.dispatch("rolled", { detail: { type: 'attribute' } });
    // And update the result page at the same time
    this.updateResult();
    // Finally update the details on the result page
    this.updateDetails();
  }

  updateResult() {
    this.resultTargets.forEach(element => {
      element.classList.add("d-none");
    });
    // Show the right title
    if (this.resultValue.success > 0) {
      this.successTarget.classList.remove("d-none");
      this.failureTarget.classList.add("d-none");
      this.forceTarget.classList.add("d-none");
    } else if (this.isForceOnly()) {
      this.successTarget.classList.add("d-none");
      this.failureTarget.classList.add("d-none");
      this.forceTarget.classList.remove("d-none");
    } else {
      this.successTarget.classList.add("d-none");
      this.failureTarget.classList.remove("d-none");
      this.forceTarget.classList.add("d-none");
    }
    // Update the total of symbols
    for (let [type, value] of Object.entries(this.resultValue)) {
      if (value < 0) {
        type = this.inverseType(type);
        value = -value;
      }
      let category = this.resultTargets.find((element) => element.dataset.type == type);
      category.innerText = `${value}${this.symbolsValue[type]}`;
      category.classList.remove("d-none");
    }
  }

  updateDetails() {
    let details = "";
    for (const [type, face] of this.detailsValue) {
      let dice = `<span class="d-inline-block">`;
      let icon = `<svg width="50" height="50" viewBox="0 0 100 100">
        <polygon class="dice dice-${type}" points="${this.diceValue[type]["points"]}"/>
      </svg>`;
      dice += icon;
      // For each face...
      for (let [type, value] of Object.entries(face)) {
        let category = type;
        if (value < 0) {
          type = this.inverseType();
          value = -value;
        }
        // ... display each symbol
        for (let index = 0; index < value; index++) {
          let symbol = `<span class="star-symbol-light ${type}">${this.symbolsValue[category]}</span>`
          dice += symbol;
        }
      }
      dice += `</span>`;
      details += dice;
    }

    this.detailsTarget.innerHTML = details;
  }

  isForceOnly() {
    if (this.poolValue['force'] > 0) {
      for (const [category, value] of Object.entries(this.poolValue)) {
          if (category != "force" && value != 0) {
            return false
          }
      };

      return true;
    }

    return false;
  }

  // Used to get the right type when negative results
  inverseType(type) {
    switch (type) {
      case "success":
        return "failure";
      case "advantage":
        return "threat";
    }
  }
}
