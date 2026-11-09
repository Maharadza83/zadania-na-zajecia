/**
 * Znajduje wszystkie pary (i < j), dla których arr[i] + arr[j] === targetSum.
 * Zwraca te same pary, w tej samej kolejności co wersja O(n²),
 * ale w czasie O(n + k), gdzie k to liczba znalezionych par.
 *
 * @param {number[]} arr
 * @param {number} targetSum
 * @returns {Array<[number, number]>}
 */
function findPairs(arr, targetSum) {
  // wartość -> liczba wystąpień w dalszej części tablicy (na prawo od bieżącego indeksu)
  const remaining = new Map();
  for (const value of arr) {
    remaining.set(value, (remaining.get(value) || 0) + 1);
  }

  const pairs = [];
  for (const value of arr) {
    // bieżący element nie może być w parze sam ze sobą – usuwamy go z "prawej strony"
    remaining.set(value, remaining.get(value) - 1);

    const complement = targetSum - value;
    const count = remaining.get(complement) || 0;
    for (let c = 0; c < count; c++) {
      pairs.push([value, complement]);
    }
  }
  return pairs;
}

/**
 * Wariant zwracający tylko unikalne pary wartości (bez powtórzeń),
 * gdy liczy się "jakie wartości", a nie "które indeksy". Czas O(n).
 *
 * @param {number[]} arr
 * @param {number} targetSum
 * @returns {Array<[number, number]>}
 */
function findUniquePairs(arr, targetSum) {
  const seen = new Set();
  const found = new Set();
  const pairs = [];
  for (const value of arr) {
    const complement = targetSum - value;
    if (seen.has(complement)) {
      const a = Math.min(value, complement);
      const b = Math.max(value, complement);
      const key = `${a},${b}`;
      if (!found.has(key)) {
        found.add(key);
        pairs.push([a, b]);
      }
    }
    seen.add(value);
  }
  return pairs;
}

module.exports = { findPairs, findUniquePairs };

// Porównanie z oryginałem: node find-pairs-optimized.js
if (require.main === module) {
  const original = require('./find-pairs');
  const tests = [
    [[1, 2, 3, 4, 5], 6],
    [[3, 3, 3], 6],
    [[1, 5, 7, -1, 5], 6],
    [[], 4],
    [[2, 4, 3, 1, 5, 0, 6], 6]
  ];
  for (const [arr, target] of tests) {
    const a = JSON.stringify(original(arr, target));
    const b = JSON.stringify(findPairs(arr, target));
    console.log(`${a === b ? 'OK  ' : 'FAIL'} findPairs(${JSON.stringify(arr)}, ${target}) = ${b}`);
  }
  console.log('Unikalne pary [1,5,7,-1,5], 6:', JSON.stringify(findUniquePairs([1, 5, 7, -1, 5], 6)));
}
