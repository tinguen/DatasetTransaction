# Atomic transaction container for struct or object
## DatasetTransaction(coursework)
### Examples
#### Create DatasetTransaction
```js
const data = [
  { college: 'MIT', rank: 1},
  { college: 'Oxford', rank: 6},
  { college: 'KPI', rank: 550 },
  { college: 'KNU', rank: Infinity }
];
const dt = DatasetTransaction.start(data);
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 550 },
//   { college: 'KNU', rank: Infinity }
// ]
```
### Commit changes to original data
```js
dt.dataset[2].rank = 1;
console.log(data);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 550 },
//   { college: 'KNU', rank: Infinity }
// ]
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
dt.commit();
console.log(data);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
```
### Rollback changes before the commit
```js
dt.dataset[3].rank = 1;
console.log(data);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: 1 }
// ]
dt.rollback();
console.log(data);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
```
### Add to the end of DatasetTransaction
```js
dt.add({ college: 'MSU', rank: 95 });
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity },
//   { college: 'MSU', rank: 95 }
// ]
```
### Remove an item by index position
```js
dt.delete(4);
console.log(dt.dataset);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
```
### Clone the transaction
```js
const cloned = dt.clone();
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'KPI', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
console.log(cloned.dataset);
cloned.dataset[2].college = 'Harvard';
dt.dataset[2].college = 'NAU';
dt.commit();      // latest commit changes the original data
cloned.commit(); //  
console.log(data);
// [
//   { college: 'MIT', rank: 1},
//   { college: 'Oxford', rank: 6},
//   { college: 'Harvard', rank: 1 },
//   { college: 'KNU', rank: Infinity }
// ]
```

