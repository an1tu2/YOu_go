// Используем ES-модульный подход через IIFE для изоляции кода
(function() {
  let currentSection = 'home';
  let myMap, pickupPlacemark, dropoffPlacemark;
  let selectedDate = null;
  let selectedTime = null;

  // Адреса, для которых стоимость = 0 (бесплатные адреса)
  const freeAddresses = [
    'Екатеринбург, Волгоградская 185',
    'Екатеринбург, Волгоградская 187',
    'Екатеринбург, Волгоградская 189'
  ];

  // Счётчик для кнопки "Далее"
  let tripsLoadCount = 0;
  const maxTripsLoad = 2;

  document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    initNavigation();
    initMapYandex();
    initDateTimeOverlays();
    initCostOverlay();
    initTripDetails();
    initParcelForm();
    initShowPrices();
    initSuggestions();

    // Ограничение выбора даты: нельзя выбирать дату, которая уже прошла
    const dateInput = document.getElementById('dateInput');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  });

  // ====== Бургер-меню ======
  function initBurger() {
    const burgerBtn = document.getElementById('burgerBtn');
    const nav = document.getElementById('nav');
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }

  // ====== Навигация ======
  function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        switchSection(targetId);
        document.getElementById('burgerBtn').classList.remove('active');
        document.getElementById('nav').classList.remove('active');
      });
    });
  }
  function switchSection(targetId) {
    const oldSec = document.getElementById(currentSection);
    const newSec = document.getElementById(targetId);
    if (oldSec) oldSec.classList.remove('active');
    if (newSec) newSec.classList.add('active');
    currentSection = targetId;
  }

  // ====== Инициализация Яндекс.Карты ======
  function initMapYandex() {
    if (typeof ymaps === 'undefined') {
      console.error('Yandex Maps API не загрузился');
      return;
    }
    ymaps.ready(() => {
      myMap = new ymaps.Map('map', {
        center: [56.838011, 60.597465],
        zoom: 9,
        controls: []
      });
      myMap.setType('yandex#hybrid');

      pickupPlacemark = new ymaps.Placemark(
        [56.838011, 60.597465],
        { hintContent: 'Точка отправления' },
        { preset: 'islands#redIcon' }
      );
      dropoffPlacemark = new ymaps.Placemark(
        [56.838011, 60.597465],
        { hintContent: 'Точка прибытия' },
        { preset: 'islands#blueIcon' }
      );
      myMap.geoObjects.add(pickupPlacemark);
      myMap.geoObjects.add(dropoffPlacemark);
    });
  }

  // ====== Модальные окна для даты и времени ======
  function initDateTimeOverlays() {
    const openDateBtn = document.getElementById('openDateBtn');
    const dateOverlay = document.getElementById('dateOverlay');
    const timeOverlay = document.getElementById('timeOverlay');
    const dateNextBtn = document.getElementById('dateNextBtn');
    const timeOkBtn = document.getElementById('timeOkBtn');
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');

    // Если кнопка для открытия даты не найдена, можно добавить её в разметку
    if (openDateBtn) {
      openDateBtn.addEventListener('click', () => {
        dateOverlay.classList.add('active');
      });
    } else {
      // Альтернативно, открываем дату сразу, если кнопка отсутствует
      dateOverlay.classList.add('active');
    }

    dateNextBtn.addEventListener('click', () => {
      if (!dateInput.value) {
        alert('Выберите дату!');
        return;
      }
      selectedDate = dateInput.value;
      dateOverlay.classList.remove('active');
      timeOverlay.classList.add('active');
    });

    timeOkBtn.addEventListener('click', () => {
      if (!timeInput.value) {
        alert('Выберите время!');
        return;
      }
      selectedTime = timeInput.value;
      timeOverlay.classList.remove('active');
      alert(`Вы выбрали: ${selectedDate} / ${selectedTime}`);
    });
  }

  // ====== Всплывающее окно стоимости ======
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

  // ====== Детали поездки и кнопка "Далее" ======
  function initTripDetails() {
    const trips = document.querySelectorAll('.trip-item');
    const tripDetailOverlay = document.getElementById('tripDetailOverlay');
    const tripDetailText = document.getElementById('tripDetailText');
    const closeTripDetailBtn = document.getElementById('closeTripDetailBtn');

    trips.forEach(trip => {
      trip.addEventListener('click', () => {
        const detail = trip.dataset.detail || 'Нет данных...';
        tripDetailText.textContent = detail;
        tripDetailOverlay.classList.add('active');
      });
    });
    closeTripDetailBtn.addEventListener('click', () => {
      tripDetailOverlay.classList.remove('active');
    });

    const moreTripsBtn = document.getElementById('moreTripsBtn');
    moreTripsBtn.addEventListener('click', () => {
      loadMoreTrips();
    });
  }

  function loadMoreTrips() {
    if (tripsLoadCount >= maxTripsLoad) {
      alert('Больше поездок нет!');
      return;
    }
    tripsLoadCount++;
    const tripsList = document.getElementById('tripsList');
    const newTrip = document.createElement('div');
    newTrip.classList.add('trip-item');
    newTrip.dataset.detail = `№${tripsLoadCount + 3} / 12.02.2025 / Пример Адреса → Пример Адреса`;
    newTrip.innerHTML = `<strong>№${tripsLoadCount + 3} — 12.02.2025</strong><br/>
                         Пример Адреса → Пример Адреса`;
    tripsList.insertBefore(newTrip, tripsList.lastElementChild);

    newTrip.addEventListener('click', () => {
      const detail = newTrip.dataset.detail;
      document.getElementById('tripDetailText').textContent = detail;
      document.getElementById('tripDetailOverlay').classList.add('active');
    });
  }

  // ====== Форма посылки ======
  function initParcelForm() {
    const showParcelBtn = document.getElementById('showParcelBtn');
    const parcelFormContainer = document.getElementById('parcelFormContainer');
    const cancelParcelBtn = document.getElementById('cancelParcelBtn');
    const sendParcelBtn = document.getElementById('sendParcelBtn');

    showParcelBtn.addEventListener('click', () => {
      parcelFormContainer.style.display = 'block';
    });
    cancelParcelBtn.addEventListener('click', () => {
      parcelFormContainer.style.display = 'none';
    });
    sendParcelBtn.addEventListener('click', async () => {
      const pPickup = document.getElementById('parcel-pickup').value.trim();
      const pDropoff = document.getElementById('parcel-dropoff').value.trim();
      const pWeight = document.getElementById('parcel-weight').value.trim();
      if (!pPickup || !pDropoff || !pWeight) {
        alert('Заполните все поля для посылки.');
        return;
      }
      const fromCoords = await geocodeRealAddress(pPickup);
      const toCoords = await geocodeRealAddress(pDropoff);
      if (fromCoords && toCoords) {
        if (isFreeAddress(pPickup) || isFreeAddress(pDropoff)) {
          showCostOverlay(`Бесплатная доставка!`);
        } else {
          const distKm = ymaps.coordSystem.geo.getDistance(fromCoords, toCoords) / 1000;
          const cost = Math.round(distKm * 80 + parseFloat(pWeight) * 5);
          showCostOverlay(`Стоимость посылки: ${cost} руб.`);
        }
      }
    });
  }

  // ====== Показать цены для такси ======
  function initShowPrices() {
    const showPricesBtn = document.getElementById('showPricesBtn');
    showPricesBtn.addEventListener('click', async () => {
      const pickup = document.getElementById('pickup').value.trim();
      const dropoff = document.getElementById('dropoff').value.trim();
      if (!pickup || !dropoff) {
        alert('Укажите адреса (Откуда / Куда).');
        return;
      }
      const fromCoords = await geocodeRealAddress(pickup);
      const toCoords = await geocodeRealAddress(dropoff);
      if (fromCoords && toCoords) {
        pickupPlacemark.geometry.setCoordinates(fromCoords);
        dropoffPlacemark.geometry.setCoordinates(toCoords);
        myMap.setBounds(myMap.geoObjects.getBounds(), { checkZoomRange: true });
        if (isFreeAddress(pickup) || isFreeAddress(dropoff)) {
          showCostOverlay(`Поездка бесплатная!`);
        } else {
          const distKm = ymaps.coordSystem.geo.getDistance(fromCoords, toCoords) / 1000;
          const price = Math.round(distKm * 100);
          showCostOverlay(`Стоимость поездки: ${price} руб.`);
        }
      }
    });
  }

  // ====== Подсказки через ymaps.suggest ======
  function initSuggestions() {
    setupYmapsSuggestions('pickup', 'pickup-suggestions');
    setupYmapsSuggestions('dropoff', 'dropoff-suggestions');
    setupYmapsSuggestions('parcel-pickup', 'parcel-pickup-suggestions');
    setupYmapsSuggestions('parcel-dropoff', 'parcel-dropoff-suggestions');
  }

  function setupYmapsSuggestions(inputId, listId) {
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
        console.error('Ошибка при вызове ymaps.suggest:', err);
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

  // ====== Геокодирование реального адреса ======
  async function geocodeRealAddress(address) {
    if (typeof ymaps === 'undefined') return null;
    try {
      const result = await ymaps.geocode(address, { results: 1 });
      if (result.geoObjects.getLength()) {
        return result.geoObjects.get(0).geometry.getCoordinates();
      } else {
        alert(`Адрес не найден: ${address}`);
        return null;
      }
    } catch (err) {
      console.error('Ошибка геокодирования:', err);
      alert('Произошла ошибка при геокодировании.');
      return null;
    }
  }

  // ====== Проверка бесплатных адресов ======
  function isFreeAddress(addr) {
    return freeAddresses.some(freeAddr => addr.toLowerCase().includes(freeAddr.toLowerCase()));
  }
})();
