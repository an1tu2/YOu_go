(function() {
  // Глобальные переменные (минимум)
  let currentSection = 'home';
  let myMap, pickupPlacemark, dropoffPlacemark;
  let selectedDate = null;
  let selectedTime = null;

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

    // Ограничение даты: нельзя выбрать прошедшую дату
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('dateInput');
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

  // ====== Навигация между секциями ======
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

  // ====== Яндекс.Карта ======
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

  // ====== Дата и время (модальные окна) ======
  function initDateTimeOverlays() {
    const openDateBtn = document.getElementById('openDateBtn');
    const dateOverlay = document.getElementById('dateOverlay');
    const timeOverlay = document.getElementById('timeOverlay');
    const dateNextBtn = document.getElementById('dateNextBtn');
    const timeOkBtn = document.getElementById('timeOkBtn');
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');

    openDateBtn.addEventListener('click', () => {
      dateOverlay.classList.add('active');
    });
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

  // ====== Окно со стоимостью ======
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

  // ====== Детали поездки ======
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

    // Кнопка "Далее (показать ещё)"
    const moreTripsBtn = document.getElementById('moreTripsBtn');
    moreTripsBtn.addEventListener('click', () => {
      loadMoreTrips();
    });
  }

  // Пример функции, которая добавляет ещё поездки
  function loadMoreTrips() {
    const tripsList = document.getElementById('tripsList');
    const newTrip = document.createElement('div');
    newTrip.classList.add('trip-item');
    newTrip.dataset.detail = '№4 / 12.02.2025 / Пример Адреса → Пример Адреса';
    newTrip.innerHTML = `<strong>№4 — 12.02.2025</strong><br/>
                         Пример Адреса → Пример Адреса`;
    tripsList.insertBefore(newTrip, tripsList.lastElementChild);

    // Навешиваем обработчик для вновь созданной поездки
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
      // Геокодируем
      const fromCoords = await geocodeRealAddress(pPickup);
      const toCoords = await geocodeRealAddress(pDropoff);
      if (fromCoords && toCoords) {
        const distKm = ymaps.coordSystem.geo.getDistance(fromCoords, toCoords) / 1000;
        const cost = Math.round(distKm * 80 + parseFloat(pWeight) * 5);
        showCostOverlay(`Стоимость посылки: ${cost} руб.`);
      }
    });
  }

  // ====== Показать цены (для такси) ======
  function initShowPrices() {
    const showPricesBtn = document.getElementById('showPricesBtn');
    showPricesBtn.addEventListener('click', async () => {
      const pickup = document.getElementById('pickup').value.trim();
      const dropoff = document.getElementById('dropoff').value.trim();
      if (!pickup || !dropoff) {
        alert('Укажите адреса (Откуда / Куда).');
        return;
      }
      // Геокодируем
      const fromCoords = await geocodeRealAddress(pickup);
      const toCoords = await geocodeRealAddress(dropoff);
      if (fromCoords && toCoords) {
        pickupPlacemark.geometry.setCoordinates(fromCoords);
        dropoffPlacemark.geometry.setCoordinates(toCoords);
        myMap.setBounds(myMap.geoObjects.getBounds(), { checkZoomRange: true });
        const distKm = ymaps.coordSystem.geo.getDistance(fromCoords, toCoords) / 1000;
        const price = Math.round(distKm * 100);
        showCostOverlay(`Стоимость поездки: ${price} руб.`);
      }
    });
  }

  // ====== Подсказки (заглушка или реальный вызов ymaps.suggest) ======
  function initSuggestions() {
    // Пример: для pickup, dropoff, parcel-pickup, parcel-dropoff
    setupFakeSuggestions('pickup', 'pickup-suggestions');
    setupFakeSuggestions('dropoff', 'dropoff-suggestions');
    setupFakeSuggestions('parcel-pickup', 'parcel-pickup-suggestions');
    setupFakeSuggestions('parcel-dropoff', 'parcel-dropoff-suggestions');
  }

  // Фейковые подсказки (заглушка). Замените на ymaps.suggest(...) при желании
  function setupFakeSuggestions(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    input.addEventListener('input', debounce(() => {
      const val = input.value.trim();
      if (val.length < 2) {
        list.style.display = 'none';
        list.innerHTML = '';
        return;
      }
      // Подставим фейковые результаты
      const fakeResults = fakeSuggestAddresses(val);
      if (!fakeResults.length) {
        list.style.display = 'none';
        list.innerHTML = '';
        return;
      }
      list.innerHTML = fakeResults.map(item => `<li>${item}</li>`).join('');
      list.style.display = 'block';
    }, 300));

    list.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        input.value = e.target.innerText;
        list.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.style.display = 'none';
      }
    });
  }

  // Фейковая функция, возвращающая «подсказки»
  function fakeSuggestAddresses(query) {
    // В реальном проекте вызывайте ymaps.suggest(query)
    // Здесь просто имитируем
    const base = [
      'Ирбит, ул. Ленина',
      'Ирбит, ул. Лесная',
      'Ирбит, ул. Левая',
      'Екатеринбург, Волгоградская',
      'Екатеринбург, Академика Бардина',
      'Екатеринбург, Серафимы Дерябиной'
    ];
    return base.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  }

})();
