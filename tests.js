'use strict';

const DatasetTransaction = require('./dataset.js'); 	
const assert = require('assert');
const equals = require('lodash').isEqual; // is used to compare objects

//** TEST 1 **//
(function test1(
  DESCRIPTION = 'Check if .commit() works correct'
) {

  const dataset = [
    { name: 'Alex', description: { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: { city: 'Nurnberg', sex: 'female', age: 19 } },
    { name: 'Ivan', description: { city: 'Brest', sex: 'male', age: 34 } }
  ]; 
	
  const transaction = DatasetTransaction.start(dataset);
	
  //MODIFY THE DATASET
  for (const data of transaction.dataset) {
    data.description.city = 'Sofia';
  }
	
  const before = [
    { name: 'Alex', description: 
      { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: 
      { city: 'Nurnberg', sex: 'female', age: 19 } },
    { name: 'Ivan', description: 
      { city: 'Brest', sex: 'male', age: 34 } }
  ]; 
	
  //ASSERTION
  assert(equals(before, dataset), 'Dataset remains unchanged before commit');
	
  transaction.commit();
	
  const after = [
    { name: 'Alex', description: 
      { city: 'Sofia', sex: 'male', age: 21 } },
    { name: 'Sarah', description: 
      { city: 'Sofia', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: 
      { city: 'Sofia', sex: 'male', age: 34 } }
  ];
	
  //ASSERTION
  assert(equals(after, dataset), 'Changes are applied after we performed .commit()');
  console.log('TEST 1: OK');
}());
// END OF TEST //

//** TEST 2 **//
(function test3(
  DESCRIPTION = 'Check if .rollback() works correct'
) {

  const dataset = [
    { name: 'Alex', description: { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: { city: 'Brest', sex: 'male', age: 34 } }
  ]; 

  const transaction = DatasetTransaction.start(dataset);

  //MODIFY THE DATASET
  for (const data of transaction.dataset) {
    data.description.city = 'Sofia';
  }
	
  const before = [
    { name: 'Alex', description: 
      { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: 
      { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: 
      { city: 'Brest', sex: 'male', age: 34 } }
  ]; 
	
  //ASSERTION
  assert(equals(before, dataset), 'Dataset remains unchanged before commit');

  transaction.rollback();
  transaction.commit();

  const after = [
    { name: 'Alex', description: 
      { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: 
      { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: 
      { city: 'Brest', sex: 'male', age: 34 } }
  ];

  //ASSERTION
  assert(equals(after, dataset), 'No modifications were made because .rollback() discarded all the changes');
  console.log('TEST 2: OK');
}());
// END OF TEST //

//** TEST 3 **//
(function test3(
  DESCRIPTION = 'Check if .add(dataset) works correct with objects'
) {

  const dataset = [
    { name: 'Alex', description: { city: 'Boston', sex: 'male', age: 21 } },
  ]; 
	
  const transaction = DatasetTransaction.start(dataset);
	
  const remainder = { name: 'Max', description: undefined };
	
  //MODIFY THE DATASET
  transaction.add(remainder);
  transaction.commit();

  //ASSERTION
  assert(equals(transaction.dataset[1], { name: 'Max', description: undefined }), 'The remainder is succesfully added to the Dataset');
  console.log('TEST 3: OK');
}());
// END OF TEST //

//** TEST 4 **//
(function test4(
  DESCRIPTION = 'Check if .add(dataset) works correct with primitives'
) {

  const dataset = [
    { name: 'Ivan', description: { city: 'Brest', sex: 'male', age: 34 } }
  ]; 
	
  const transaction = DatasetTransaction.start(dataset);
	
  const string = 'string';
  const integer = 1091939;
	
  //MODIFY THE DATASET
  transaction.add(string);
  transaction.add(integer);

  transaction.commit();

  //ASSERTION
  assert(equals(transaction.dataset[1], { data: string }), 'The string is succesfully added to the Dataset');
  assert(equals(transaction.dataset[2], { data: integer }), 'The integer is succesfully added to the Dataset');

  const after = [
    { name: 'Max', description: undefined }
  ];
  console.log('TEST 4: OK');
}());
// END OF TEST //

//** TEST 5 **//
(function test5(
  DESCRIPTION = 'Check if .start(dataset) works correct with primitives'
) {

  const primitive = 1;

  const transaction = DatasetTransaction.start(primitive);
  transaction.commit();

  //ASSERTION	
  assert(equals(transaction.dataset[0], { data: 1 }), 'The primitive is succesfully added to the Dataset');
  console.log('TEST 5: OK');
}());
// END OF TEST //

//** TEST 6 **//
(function test6(
  DESCRIPTION = 'Check if .clone() works correct'
) {

  const dataset = [
    { name: 'Alex', description: { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: { city: 'Brest', sex: 'male', age: 34 } }
  ]; 

  const transaction = DatasetTransaction.start(dataset);

  const remainder = { name: 'Max', description: undefined };
  transaction.add(remainder);
  transaction.commit();

  const transactionClone = transaction.clone();
  transactionClone.commit();

  const after = [
    { name: 'Alex', description: 
      { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: 
      { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: 
      { city: 'Brest', sex: 'male', age: 34 } },
    { name: 'Max', description: undefined }
  ];

  //ASSERTION
  assert(equals(after, dataset));
  console.log('TEST 6: OK');
}());
// END OF TEST //

//** TEST 7 **//
(function test7(
  DESCRIPTION = 'Check if .delete(index) works correct'
) {

  const dataset = [
    { name: 'Alex', description: { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: { city: 'Brest', sex: 'male', age: 34 } }
  ]; 

  const transaction = DatasetTransaction.start(dataset);

  transaction.delete(1);
  transaction.commit();

  const after = [
    { name: 'Alex', description: 
      { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Ivan', description: 
      { city: 'Brest', sex: 'male', age: 34 } },
  ];
	
  //ASSERTION
  assert(equals(after, dataset));
  console.log('TEST 7: OK');
}());
// END OF TEST //

//** TEST 8 **//
(function test8(
  DESCRIPTION = 'Making an attemt to launch .start() without arguments'
) {

  //ASSERTION	
  assert.throws(function () { DatasetTransaction.start(); }, 'An argument expected', 'Launching .start() without arguments results in throwing an error');
  console.log('TEST 8: OK');	
}());
// END OF TEST //

//** TEST 9 **//
(function test9(
  DESCRIPTION = 'Making an attemt to launch .add() without arguments'
) {

  //ASSERTION	
  assert.throws(function () { DatasetTransaction.add(); }, 'An argument expected', 'Launching .add() without arguments results in throwing an error');
  console.log('TEST 9: OK');	
}());
// END OF TEST //

//** TEST 10 **//
(function test10(
  DESCRIPTION = 'Making an attemt to launch .delete() without arguments'
) {

  //ASSERTION	
  assert.throws(function () { DatasetTransaction.delete(); }, 'An argument expected', 'Launching .delete() without arguments results in throwing an error');
  console.log('TEST 10: OK');	
}());
// END OF TEST //

//** TEST 11 **//
(function test10(
  DESCRIPTION = 'Making an attemt to iterate over transaction.dataset'
) {

  const dataset = [
    { name: 'Alex', description: { city: 'Boston', sex: 'male', age: 21 } },
    { name: 'Sarah', description: { city: 'Nurnberg', sex: 'female', age: 19 } }, 
    { name: 'Ivan', description: { city: 'Brest', sex: 'male', age: 34 } }
  ]; 

  const transaction = DatasetTransaction.start(dataset);

  //ASSERTION	
  assert.throws(function () { console.log(transaction.dataset); }, 'property .length could not be found', 'iterating over transaction.dataset results in throwing an error');
  console.log('TEST 11: OK');	
}());
// END OF TEST //
