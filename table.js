var Monkberry = require('monkberry');

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
  var a2 = document.createElement('a');
  var text3 = document.createTextNode('');
  var td4 = document.createElement('td');
  var for0 = document.createComment('if');
  var child0 = {};
  var for1 = document.createComment('if');
  var child2 = {};
  var for2 = document.createComment('if');
  var child4 = {};

  // Construct dom
  a2.appendChild(text3);
  a2.setAttribute("href", "/detail/");
  td1.appendChild(a2);
  td4.appendChild(for0);
  td4.appendChild(for1);
  td4.appendChild(for2);
  tr0.appendChild(td1);
  tr0.appendChild(td4);

  // Update functions
  this.__update__ = {
    item: function (item) {
      text3.textContent = item.digit_number;
      a2.setAttribute("href", ("/detail/") + (item.digit_number));;
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

module.exports = table;
//# sourceMappingURL=table.js.map
