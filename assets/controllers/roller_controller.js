import { Controller } from '@hotwired/stimulus';

/*
 *
 */
export default class extends Controller {
  static targets = [
    "count",
    "details",
    "failure",
    "force",
    "result",
    "roll",
    "success"
  ];

  static values = {
    dice: Object,
    symbols: Object,
    details: Array,
    pool: Object,
    result: Object
  }

  connect() {
    this.detailsValue = [];
    this.resultValue = {};
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

    if (Object.values(this.poolValue).reduce((a, b) => a +b, 0) > 0) {
      this.rollTarget.classList.remove('disabled');
    }
  }

  reset(event) {
    // Update values
    this.poolValue = {};
    this.detailsValue = [];
    this.resultValue = {};
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
      // We find the right total to update
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
  }


  roll() {
    let result = {};
    if (!this.isForceOnly()) {
      result = { 'success': 0 };
    }
    let details = [];
    
    // Fetch the info for each dice type
    for (const [type, count] of Object.entries(this.poolValue)) {
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
    let kills = this.killSoldiers();

    // We dispatch the event for the animation
    this.dispatch("rolled", { detail: { content: kills } });
    // And update the result page at the same time
    this.updateResult();
    // Finally update the details on the result page
    this.updateDetails();
  }

  killSoldiers() {
    let kills= {
      allies: [],
      enemies: [],
    };
    if (this.resultValue['success'] > 0) {
        kills.enemies.push(1);
        kills.enemies.push(2);
        kills.enemies.push(3);
      } else {
        kills.allies.push(1);
        kills.allies.push(2);
        kills.allies.push(3);
      }
      if (this.resultValue['advantage'] > 0) {
        kills.enemies.push(4);
      } else if (this.resultValue['advantage'] < 0) {
        kills.allies.push(4);
      }
      if (this.resultValue['triumph'] > 0) {
        kills.enemies.push(0);
      }
      if (this.resultValue['despair'] > 0) {
        kills.allies.push(0);
      }
    return kills;
  }

  updateResult() {
    this.resultTargets.forEach(element => {
      element.innerHTML = null;
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
      if (value != 0) {
        category.innerHTML = `<span class="fs-star-jedi pe-1">${value}</span>${this.symbolsValue[type]}`;
      }
    }
  }

  updateDetails() {
    for (const element of this.detailsTarget.children) {
      element.innerHTML = null;
    }
    let details = [];
    for (const [type, face] of this.detailsValue) {
      let dice = `<span class="d-inline-block">`;
      let icon = `<svg width="50" height="50" viewBox="0 0 100 100">
        <polygon class="dice dice-${type}" points="${this.diceValue[type]["points"]}"/>
      </svg>`;
      dice += icon;
      // For each face...
      for (let [type, value] of Object.entries(face)) {
        if (value < 0) {
          type = this.inverseType(type);
          value = -value;
        }
        // ... display each symbol
        for (let index = 0; index < value; index++) {
          let symbol = `<span class="star-symbol small clear ${type}" title="${type}">${this.symbolsValue[type]}</span>`
          dice += symbol;
        }
      }
      dice += `</span>`;
      if (details[type] == undefined) {
        details[type] = "";
      }
      details[type] += dice;
    }

    for (const key in details) {
      document.getElementById(`details-${key}`).innerHTML = details[key];
    }
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
