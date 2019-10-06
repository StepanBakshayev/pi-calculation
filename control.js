var Monkberry = require('monkberry');

/**
 * @class
 */
function control() {
  Monkberry.call(this);

  // Create elements
  var form0 = document.createElement('form');
  var input1 = document.createElement('input');
  var button2 = document.createElement('button');
  var text3 = document.createTextNode('');

  // Construct dom
  input1.setAttribute("type", "hidden");
  input1.setAttribute("name", "next_digit_number");
  button2.appendChild(document.createTextNode("Рассчитать "));
  button2.appendChild(text3);
  button2.appendChild(document.createTextNode(" разряд"));
  button2.setAttribute("class", "btn btn-primary");
  form0.appendChild(input1);
  form0.appendChild(button2);
  form0.setAttribute("class", "form-group");
  form0.setAttribute("method", "post");
  form0.setAttribute("content", "multipart/form-data");

  // Update functions
  this.__update__ = {
    next_digit_number: function (next_digit_number) {
      input1.value = next_digit_number;;
      text3.textContent = next_digit_number;
    }
  };

  // Set root nodes
  this.nodes = [form0];
}
control.prototype = Object.create(Monkberry.prototype);
control.prototype.constructor = control;
control.pool = [];
control.prototype.update = function (__data__) {
  if (__data__.next_digit_number !== undefined) {
    this.__update__.next_digit_number(__data__.next_digit_number);
  }
};

module.exports = control;
//# sourceMappingURL=control.js.map
