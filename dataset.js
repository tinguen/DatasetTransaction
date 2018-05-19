'use strict';

function Transaction() {}

const isObject = (value) => {
  if (
    typeof value === 'object' || 
    typeof value === 'function'
  )return true;
		
  return false;
};  

Transaction.start = (data) => {
	
  if (!isObject(data) && data !== null)
    data = {data};
  
  let delta = {};
  let proxifiedKeys = {};

  const events = {
    commit: [], rollback: [], timeout: [], change: []
  };

  const emit = (name) => {
    const event = events[name];
    for (const listener of event) listener(data);
  };
  
  const applyToKeysOf = (target, fn) => {
    let res = {};
    Object.keys(target).forEach(
      key => res[key] = target[key][fn]()
    );

    return res;
  };

  const methods = {
    commit: () => {
      Object.assign(data, delta);
      delta = {};
      applyToKeysOf(proxifiedKeys, 'commit');
      
      emit('commit');
    },
    rollback: () => {
      delta = {};
      applyToKeysOf(proxifiedKeys, 'rollback');

      emit('rollback');
    },
    clone: () => {
      const cloned = Transaction.start(data);
      const clonedProxifiedKeys = applyToKeysOf(proxifiedKeys, 'clone');
      Object.assign(cloned.delta, delta);
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
      if (key === 'proxifiedKeys') return proxifiedKeys;
      if (methods.hasOwnProperty(key)) return methods[key];
      if (delta.hasOwnProperty(key)) return delta[key];
      return target[key];
    },
    set(target, key, val) {
      if (target[key] === val) delete delta[key];
      else delta[key] = val;
      return true;
    },
    getOwnPropertyDescriptor: (target, key) => {
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
  if (!isObject(dataset) && dataset !== null ) {
    const val = dataset;
    dataset = [{data: val}];
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
