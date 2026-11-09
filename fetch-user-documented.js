/**
 * Dane użytkownika zwracane przez {@link fetchUserData}.
 *
 * @typedef {Object} UserData
 * @property {string} name - Imię i nazwisko (nazwa) użytkownika.
 * @property {string} email - Adres e-mail użytkownika.
 * @property {Date} lastLogin - Data i godzina ostatniego logowania.
 */

/**
 * Pobiera dane użytkownika z API i zwraca je w uproszczonej postaci.
 *
 * Wysyła żądanie `GET https://api.example.com/users/{userId}`. Jeśli serwer
 * odpowie kodem innym niż 2xx lub wystąpi błąd sieci, błąd jest logowany
 * w konsoli, a funkcja zwraca `null` (nie odrzuca obietnicy).
 *
 * @async
 * @param {string|number} userId - Identyfikator użytkownika.
 * @returns {Promise<UserData|null>} Obietnica z danymi użytkownika
 *   albo `null`, gdy pobranie się nie powiodło.
 *
 * @example
 * fetchUserData(42).then(user => {
 *   if (user) {
 *     console.log(`${user.name} <${user.email}>`);
 *     console.log('Ostatnie logowanie:', user.lastLogin.toLocaleString());
 *   }
 * });
 */
function fetchUserData(userId) {
  return fetch(`https://api.example.com/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      return {
        name: data.name,
        email: data.email,
        lastLogin: new Date(data.lastLoginTimestamp)
      };
    })
    .catch(error => {
      console.error('Fetch error:', error);
      return null;
    });
}
