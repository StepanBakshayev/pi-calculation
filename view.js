
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

window.control = control;

/**
 * @class
 */
function table() {
  Monkberry.call(this);
  var _this = this;

  // Create elements
  var for0 = document.createComment('for');
  var children0 = new Monkberry.Map();

  // Update functions
  this.__update__ = {
    results: function (results) {
      Monkberry.loop(_this, for0, children0, table_for0, results, {"value":"item"});
    }
  };

  // On update actions
  this.onUpdate = function (__data__) {
    children0.forEach(function (view) {
      view.update(view.__state__);
      view.update(__data__);
      view.update(view.__state__);
    });
  };

  // Set root nodes
  this.nodes = [for0];
}
table.prototype = Object.create(Monkberry.prototype);
table.prototype.constructor = table;
table.pool = [];
table.prototype.update = function (__data__) {
  if (__data__.results !== undefined) {
    this.__update__.results(__data__.results);
  }
  this.onUpdate(__data__);
};

/**
 * @class
 */
function table_for0() {
  Monkberry.call(this);
  this.__state__ = {};
  var _this = this;

  // Create elements
  var tr0 = document.createElement('tr');
  var td1 = document.createElement('td');
  var text2 = document.createTextNode('');
  var td3 = document.createElement('td');
  var for0 = document.createComment('if');
  var child0 = {};
  var for1 = document.createComment('if');
  var child2 = {};
  var for2 = document.createComment('if');
  var child4 = {};

  // Construct dom
  td1.appendChild(text2);
  td3.appendChild(for0);
  td3.appendChild(for1);
  td3.appendChild(for2);
  tr0.appendChild(td1);
  tr0.appendChild(td3);

  // Update functions
  this.__update__ = {
    item: function (item) {
      text2.textContent = item.digit_number;
      Monkberry.cond(_this, for0, child0, table_for0_if0, (item.step) !== ('stored'));
      Monkberry.cond(_this, for1, child2, table_for0_if2, ((item.result) !== ('')) && ((item.step) !== ('stored')));
      Monkberry.cond(_this, for2, child4, table_for0_if4, (item.result) !== (''));
    }
  };

  // On update actions
  this.onUpdate = function (__data__) {
    if (child0.ref) {
      child0.ref.update(__data__);
    }
    if (child2.ref) {
      child2.ref.update(__data__);
    }
    if (child4.ref) {
      child4.ref.update(__data__);
    }
  };

  // Set root nodes
  this.nodes = [tr0];
}
table_for0.prototype = Object.create(Monkberry.prototype);
table_for0.prototype.constructor = table_for0;
table_for0.pool = [];
table_for0.prototype.update = function (__data__) {
  if (__data__.item !== undefined && __data__.__index__ !== undefined) {
    this.__update__.item(__data__.item);
  }
  this.onUpdate(__data__);
};

/**
 * @class
 */
function table_for0_if0() {
  Monkberry.call(this);

  // Create elements
  var text0 = document.createTextNode('');

  // Update functions
  this.__update__ = {
    item: function (item) {
      text0.textContent = item.step;
    }
  };

  // Set root nodes
  this.nodes = [text0];
}
table_for0_if0.prototype = Object.create(Monkberry.prototype);
table_for0_if0.prototype.constructor = table_for0_if0;
table_for0_if0.pool = [];
table_for0_if0.prototype.update = function (__data__) {
  if (__data__.item !== undefined) {
    this.__update__.item(__data__.item);
  }
};

/**
 * @class
 */
function table_for0_if2() {
  Monkberry.call(this);

  // Set root nodes
  this.nodes = [document.createTextNode(": ")];
}
table_for0_if2.prototype = Object.create(Monkberry.prototype);
table_for0_if2.prototype.constructor = table_for0_if2;
table_for0_if2.pool = [];
table_for0_if2.prototype.update = function (__data__) {
};

/**
 * @class
 */
function table_for0_if4() {
  Monkberry.call(this);

  // Create elements
  var text0 = document.createTextNode('');

  // Update functions
  this.__update__ = {
    item: function (item) {
      text0.textContent = item.result;
    }
  };

  // Set root nodes
  this.nodes = [text0];
}
table_for0_if4.prototype = Object.create(Monkberry.prototype);
table_for0_if4.prototype.constructor = table_for0_if4;
table_for0_if4.pool = [];
table_for0_if4.prototype.update = function (__data__) {
  if (__data__.item !== undefined) {
    this.__update__.item(__data__.item);
  }
};

window.table = table;
//# sourceMappingURL=view.js.map
