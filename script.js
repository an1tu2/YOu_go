// Пример "брутальной" логики с подсказками, расчетом цены и т.д.
// Внимание: Это демо. Для реального проекта нужно всё протестировать.
// Можете разбивать на модули (ES-модули) и т.д.

(function() {
  // Глобальные (внутри IIFE) переменные
  let currentSection = 'home';
  let myMap;
  let pickupPlacemark, dropoffPlacemark;

  // Список "бесплатных" адресов
  const freeAddresses = [
    'Екатеринбург, Волгоградская 185',
    'Екатеринбург, Волгоградская 187',
    'Екатеринбург, Волгоградская 189'
  ];

  // Счётчик для кнопки "Далее (показать ещё)"
  let tripsLoadCount = 0;
  const maxTripsLoad = 2; // Покажем ещё 2 раза, затем скажем "Больше поездок нет!"

  // При загрузке DOM
  document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    initNavLinks();
    initMap();
    initSuggestions();
    initDateTimeOverlay();
    initCostOverlay();
    initParcelForm();
    initShowPrices();

    // Нельзя выбрать прошедшую дату
    const dateInput = document.getElementById('dateInput');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Кнопка "Далее (показать ещё)" в поездках
    const moreTripsBtn = document.getElementById('moreTripsBtn');
    moreTripsBtn.addEventListener('click', loadMoreTrips);
  });

  // =========================
  // БУРГЕР-МЕНЮ
  // =========================
  function initBurger() {
    const burgerBtn = document.getElementById('burgerBtn');
    const nav = document.getElementById('nav');
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }

  // =========================
  // НАВИГАЦИЯ ПО СЕКЦИЯМ
  // =========================
  function initNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        switchSection(targetId);
      });
    });
  }
  function switchSection(targetId) {
    const oldSection = document.getElementById(currentSection);
    const newSection = document.getElementById(targetId);
    if (oldSection) oldSection.classList.remove('active');
    if (newSection) newSection.classList.add('active');
    currentSection = targetId;
  }

  // =========================
  // ЯНДЕКС.КАРТА
  // =========================
  function initMap() {
    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API не загрузился');
      return;
    }
    ymaps.ready(() => {
      // Создаём карту
      myMap = new ymaps.Map('map', {
        center: [56.838011, 60.597465],
        zoom: 9,
        controls: []
      });
      myMap.setType('yandex#hybrid');

      // Инициируем метки (пока по умолчанию на центр)
      pickupPlacemark = new ymaps.Placemark(
        [56.838011, 60.597465],
        { hintContent: 'Откуда' },
        { preset: 'islands#redIcon' }
      );
      dropoffPlacemark = new ymaps.Placemark(
        [56.838011, 60.597465],
        { hintContent: 'Куда' },
        { preset: 'islands#blueIcon' }
      );
      myMap.geoObjects.add(pickupPlacemark);
      myMap.geoObjects.add(dropoffPlacemark);
    });
  }

  // =========================
  // ПОДСКАЗКИ (ymaps.suggest)
  // =========================
  function initSuggestions() {
    setupSuggestions('pickup', 'pickup-suggestions');
    setupSuggestions('dropoff', 'dropoff-suggestions');
    setupSuggestions('parcel-pickup', 'parcel-pickup-suggestions');
    setupSuggestions('parcel-dropoff', 'parcel-dropoff-suggestions');
  }
  function setupSuggestions(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    input.addEventListener('input', debounce(async () => {
      const val = input.value.trim();
      if (val.length < 3) {
        list.style.display = 'none';
        list.innerHTML = '';
        return;
      }
      try {
        const suggestions = await ymaps.suggest(val);
        if (!suggestions || !suggestions.length) {
          list.style.display = 'none';
          list.innerHTML = '';
          return;
        }
        list.innerHTML = '';
        suggestions.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.value;
          li.addEventListener('click', () => {
            input.value = item.value;
            list.style.display = 'none';
          });
          list.appendChild(li);
        });
        list.style.display = 'block';
      } catch (err) {
        console.error('Ошибка suggest:', err);
      }
    }, 300));

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.style.display = 'none';
      }
    });
  }
  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // =========================
  // ДАТА/ВРЕМЯ (модальные окна)
  // =========================
  function initDateTimeOverlay() {
    const openDateBtn = document.getElementById('openDateBtn');
    const dateOverlay = document.getElementById('dateOverlay');
    const timeOverlay = document.getElementById('timeOverlay');
    const dateNextBtn = document.getElementById('dateNextBtn');
    const timeOkBtn = document.getElementById('timeOkBtn');

    openDateBtn.addEventListener('click', () => {
      dateOverlay.classList.add('active');
    });

    dateNextBtn.addEventListener('click', () => {
      const dateValue = document.getElementById('dateInput').value;
      if (!dateValue) {
        alert('Выберите дату!');
        return;
      }
      // Запоминаем выбранную дату
      selectedDate = dateValue;
      dateOverlay.classList.remove('active');
      timeOverlay.classList.add('active');
    });

    timeOkBtn.addEventListener('click', () => {
      const timeValue = document.getElementById('timeInput').value;
      if (!timeValue) {
        alert('Выберите время!');
        return;
      }
      selectedTime = timeValue;
      timeOverlay.classList.remove('active');
      alert(`Вы выбрали дату: ${selectedDate}, время: ${selectedTime}`);
    });
  }

  // =========================
  // ОКНО СТОИМОСТИ
  // =========================
  function initCostOverlay() {
    const costOverlay = document.getElementById('costOverlay');
    const closeCostBtn = document.getElementById('closeCostBtn');
    closeCostBtn.addEventListener('click', () => {
      costOverlay.classList.remove('active');
    });
  }
  function showCostOverlay(text) {
    const costOverlay = document.getElementById('costOverlay');
    const costText = document.getElementById('costText');
    costText.textContent = text;
    costOverlay.classList.add('active');
  }

  // =========================
  // ФОРМА ПОСЫЛКИ
  // =========================
  function initParcelForm() {
    const showParcelFormBtn = document.getElementById('showParcelFormBtn');
    const parcelFormContainer = document.getElementById('parcelFormContainer');
    const cancelParcelBtn = document.getElementById('cancelParcelBtn');
    const sendParcelBtn = document.getElementById('sendParcelBtn');

    showParcelFormBtn.addEventListener('click', () => {
      document.getElementById('priceResult')?.textContent = '';
      parcelFormContainer.style.display = 'block';
    });
    cancelParcelBtn.addEventListener('click', () => {
      parcelFormContainer.style.display = 'none';
    });
    sendParcelBtn.addEventListener('click', async () => {
      const fromAddr = document.getElementById('parcel-pickup').value.trim();
      const toAddr = document.getElementById('parcel-dropoff').value.trim();
      const weight = parseFloat(document.getElementById('parcel-weight').value.trim() || '0');

      if (!fromAddr || !toAddr || !weight) {
        alert('Заполните все поля для посылки.');
        return;
      }
      // Геокодируем
      const fromCoords = await geocodeAddress(fromAddr);
      const toCoords = await geocodeAddress(toAddr);
      if (fromCoords && toCoords) {
        // Проверим "бесплатные" адреса
        if (isFreeAddress(fromAddr) || isFreeAddress(toAddr)) {
          showCostOverlay('Бесплатная доставка!');
        } else {
          const distKm = ymaps.coordSystem.geo.getDistance(fromCoords, toCoords) / 1000;
          const cost = Math.round(distKm * 80 + weight * 5);
          showCostOverlay(`Стоимость посылки: ${cost} руб.`);
        }
      }
    });
  }

  // =========================
  // КНОПКА "ПОКАЗАТЬ ЦЕНЫ" (такси)
  // =========================
  function initShowPrices() {
    const showPricesBtn = document.getElementById('showPricesBtn');
    showPricesBtn.addEventListener('click', async () => {
      const pickupValue = document.getElementById('pickup').value.trim();
      const dropoffValue = document.getElementById('dropoff').value.trim();
      if (!pickupValue || !dropoffValue) {
        alert('Введите корректные адреса "Откуда" и "Куда".');
        return;
      }
      const pickupCoords = await geocodeAddress(pickupValue);
      const dropoffCoords = await geocodeAddress(dropoffValue);
      if (pickupCoords && dropoffCoords) {
        pickupPlacemark.geometry.setCoordinates(pickupCoords);
        dropoffPlacemark.geometry.setCoordinates(dropoffCoords);
        myMap.setBounds(myMap.geoObjects.getBounds(), { checkZoomRange: true });
        // Если один из адресов бесплатный, стоимость = 0
        if (isFreeAddress(pickupValue) || isFreeAddress(dropoffValue)) {
          showCostOverlay('Поездка бесплатная!');
        } else {
          const distanceKm = ymaps.coordSystem.geo.getDistance(pickupCoords, dropoffCoords) / 1000;
          const price = Math.round(distanceKm * 100); // 100 руб/км
          showCostOverlay(`Примерная стоимость поездки: ~${price} руб.`);
        }
      }
    });
  }

  // =========================
  // ДОБАВЛЕНИЕ ПОЕЗДОК (кнопка "Далее")
  // =========================
  function loadMoreTrips() {
    if (tripsLoadCount >= maxTripsLoad) {
      alert('Больше поездок нет!');
      return;
    }
    tripsLoadCount++;
    const tripsList = document.getElementById('tripsList');
    const newTrip = document.createElement('div');
    newTrip.classList.add('trip-item');
    newTrip.dataset.detail = `12.02.2025: Пример Адреса → Пример Адреса`;
    newTrip.innerHTML = `№${tripsLoadCount + 3} — 12.02.2025<br/>
                         Пример Адреса → Пример Адреса`;
    // Добавляем перед кнопкой
    tripsList.insertBefore(newTrip, tripsList.lastElementChild);

    newTrip.addEventListener('click', () => {
      document.getElementById('tripDetailText').textContent = newTrip.dataset.detail;
      document.getElementById('tripDetailOverlay').classList.add('active');
    });
  }

  // =========================
  // ГЕОКОДИРОВАНИЕ (через ymaps.geocode)
  // =========================
  async function geocodeAddress(address) {
    try {
      const result = await ymaps.geocode(address, { results: 1 });
      if (result.geoObjects.getLength()) {
        return result.geoObjects.get(0).geometry.getCoordinates();
      } else {
        alert(`Адрес "${address}" не найден.`);
        return null;
      }
    } catch (err) {
      console.error(err);
      alert('Произошла ошибка при геокодировании. Убедитесь, что адрес введён корректно.');
      return null;
    }
  }

  // =========================
  // Проверка "бесплатных" адресов
  // =========================
  function isFreeAddress(addr) {
    return freeAddresses.some(freeAddr =>
      addr.toLowerCase().includes(freeAddr.toLowerCase())
    );
  }
})();
