'use strict';

function Transaction() {}

const isObject = (value) => {
  if (
    typeof value === 'object' ||
    typeof value === 'function'
  ) return true;

  return false;
};

Transaction.start = (data) => {
  if (!isObject(data) && data !== null)
    data = { data };
  let delta = {};
  let deleted = [];
  const proxifiedKeys = {};

  const events = {
    commit: [], rollback: [], timeout: [], change: []
  };

  const emit = (name) => {
    const event = events[name];
    for (const listener of event) listener(data);
  };
  const applyToKeysOf = (target, fn) => {
    const res = {};
    Object.keys(target).forEach(
      key => res[key] = target[key][fn]()
    );
    return res;
  };

  const methods = {
    commit: () => {
      Object.assign(data, delta);
      deleted.forEach(key => delete data[key]);
      delta = {};
      deleted = [];
      applyToKeysOf(proxifiedKeys, 'commit');
      emit('commit');
    },
    rollback: () => {
      delta = {};
      deleted = [];
      applyToKeysOf(proxifiedKeys, 'rollback');
      emit('rollback');
    },
    clone: () => {
      const cloned = Transaction.start(data);
      const clonedProxifiedKeys = applyToKeysOf(proxifiedKeys, 'clone');
      Object.assign(cloned.delta, delta);
      Object.assign(cloned.deleted, deleted);
      Object.assign(cloned.proxifiedKeys, clonedProxifiedKeys);
      return cloned;
    },
    on: (name, callback) => {
      const event = events[name];
      if (event) event.push(callback);
    }
  };


  return new Proxy(data, {
    get(target, key) {
      if (isObject(target[key]) && target[key] !== null) {
        if (!proxifiedKeys[key])  // lazy proxification of inner objects
          return proxifiedKeys[key] = Transaction.start(target[key]);
        return proxifiedKeys[key];
      }
      if (key === 'delta') return delta;
      if (key === 'deleted') return deleted;
      if (key === 'proxifiedKeys') return proxifiedKeys;
      if (methods.hasOwnProperty(key)) return methods[key];
      if (delta.hasOwnProperty(key)) return delta[key];
      if (deleted.indexOf(key) !== -1) return undefined;
      return target[key];
    },
    set(target, key, val) {
      const index = deleted.indexOf(key);
      if (index !== -1) delete deleted.slice(index, 1);
      if (target[key] === val) delete delta[key];
      else delta[key] = val;
      return true;
    },
    deleteProperty(target, key) {
      if (target[key] || delta[key]) deleted.push(key);
      delete delta[key];
      return true;
    },
    getOwnPropertyDescriptor: (target, key) => {
      if (deleted.indexOf(key) !== -1) return undefined;
      return Object.getOwnPropertyDescriptor(
        delta.hasOwnProperty(key) ? delta : target, key
      );
    },
    ownKeys() {
      const changes = Object.keys(delta);
      const keys = Object.keys(data)
        .concat(changes);
      return keys.filter((x, i, a) => a.indexOf(x) === i);
    }
  });
};

function DatasetTransaction(dataset) {
  if (!dataset) throw new Error('An argument expected');
  this.selfTransaction = Transaction.start({ dataset });
  this.dataset = this.selfTransaction.dataset;
}

DatasetTransaction.start = function(dataset) {
  if (!dataset) throw new Error('An argument expected');
  if (!isObject(dataset) && dataset !== null) {
    const val = dataset;
    dataset = [{ data: val }];
  }
  return new DatasetTransaction(dataset);
};

DatasetTransaction.prototype.commit = function() {
  for (const item of this.dataset) {
    if (item) item.commit();
  }
  this.selfTransaction.commit();
};

DatasetTransaction.prototype.rollback = function() {
  for (const item of this.dataset) {
    item.rollback();
  }
  this.selfTransaction.rollback();
};

DatasetTransaction.prototype.add = function(dataset) {
  if (!dataset) throw new Error('An argument expected');
  const transactions = [];
  if (dataset.isArray)
    dataset.forEach(data => transactions.push(Transaction.start(data)));
  else
    transactions.push(Transaction.start(dataset));
  transactions.forEach(transaction => this.dataset.push(transaction));
};

DatasetTransaction.prototype.clone = function() {
  const dt = new DatasetTransaction({});
  dt.selfTransaction = this.selfTransaction.clone();
  dt.dataset = dt.selfTransaction.dataset;
  return dt;
};

DatasetTransaction.prototype.delete = function(index) {
  if (!index) throw new Error('An argument expected');
  if (this.dataset.length < index) return false;
  this.dataset.splice(index, 1);
  return true;
};

module.exports = DatasetTransaction;
