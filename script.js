document.addEventListener('DOMContentLoaded', () => {
  // Функция для предотвращения выбора прошлых дат
  const today = new Date().toISOString().split('T')[0]; // Текущая дата
  document.getElementById('dateInput').setAttribute('min', today); // Устанавливаем минимальную дату

  // Подсказки для полей ввода
  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');
  const pickupSuggestions = document.getElementById('pickup-suggestions');
  const dropoffSuggestions = document.getElementById('dropoff-suggestions');

  function setupSuggestions(inputElement, suggestionsElement) {
    inputElement.addEventListener('input', async function () {
      const value = this.value;
      if (value.length < 3) {
        suggestionsElement.style.display = 'none';
        return;
      }

      const suggestions = await getSuggestions(value);
      suggestionsElement.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
      suggestionsElement.style.display = 'block';
    });

    suggestionsElement.addEventListener('click', function (e) {
      if (e.target.tagName === 'LI') {
        inputElement.value = e.target.innerText;
        suggestionsElement.style.display = 'none';
      }
    });
  }

  function getSuggestions(query) {
    return [
      `${query} 1`,
      `${query} 2`,
      `${query} 3`,
      `${query} 4`,
    ]; // Заглушка для реальных подсказок
  }

  setupSuggestions(pickupInput, pickupSuggestions);
  setupSuggestions(dropoffInput, dropoffSuggestions);

  // Скрытие и показ модальных окон
  const costPopup = document.getElementById('costPopup');
  const closeCostBtn = document.getElementById('closeCostBtn');
  closeCostBtn.addEventListener('click', () => {
    costPopup.style.display = 'none';
  });

  // Обработка отображения стоимости
  const showPricesBtn = document.getElementById('showPricesBtn');
  showPricesBtn.addEventListener('click', () => {
    // Показать стоимость
    const costText = 'Стоимость поездки: 1000 руб.'; // Заглушка для стоимости
    document.getElementById('costText').textContent = costText;
    costPopup.style.display = 'block';
  });
});
