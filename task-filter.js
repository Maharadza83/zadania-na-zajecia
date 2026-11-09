/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} status
 */

/**
 * Zwraca tytuły zadań o statusie "completed", posortowane rosnąco według id.
 *
 * @param {Task[]} tasks - tablica zadań
 * @returns {string[]} tytuły ukończonych zadań
 */
function getCompletedTaskTitles(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Argument tasks musi być tablicą');
  }

  return tasks
    .filter(task => task.status === 'completed')
    .sort((a, b) => a.id - b.id)
    .map(task => task.title);
}

module.exports = getCompletedTaskTitles;

// Przykład użycia: node task-filter.js
if (require.main === module) {
  const tasks = [
    { id: 3, title: 'Napisać testy', status: 'completed' },
    { id: 1, title: 'Skonfigurować CI', status: 'completed' },
    { id: 2, title: 'Przygotować Dockerfile', status: 'in-progress' },
    { id: 5, title: 'Wdrożyć na staging', status: 'pending' },
    { id: 4, title: 'Code review', status: 'completed' }
  ];

  console.log(getCompletedTaskTitles(tasks));
  // [ 'Skonfigurować CI', 'Napisać testy', 'Code review' ]
}
