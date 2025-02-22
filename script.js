// Используем IIFE для инкапсуляции кода
(function() {
  let currentSection = 'home';
  let myMap, pickupPlacemark, dropoffPlacemark;
  let selectedDate = null;
  let selectedTime = null;

  document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    initNavigation();
    if (typeof ymaps !== 'undefined') {
      ymaps.ready(initMap);
    } else {
      alert('Ошибка: не удалось загрузить Яндекс.Карты. Проверьте API-ключ или соединение.');
    }
    initSuggestions();
    initParcelForm();
    initPriceCalculation();
    initDateTimeOverlays();
    initTripDetails();
  });

  // Инициализация бургер-меню
  function initBurger() {
    const burgerBtn = document.getElementById('burgerBtn');
    const nav = document.getElementById('nav');
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }

  // Навигация по разделам
  function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
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

  // Инициализация Яндекс.Карты
  function initMap() {
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
  }

  // Подсказки для полей ввода
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
        list.innerHTML = '';
        if (!suggestions || !suggestions.length) {
          list.style.display = 'none';
          return;
        }
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

  // Геокодирование адреса
  async function geocodeRealAddress(address) {
    try {
      const geo = await ymaps.geocode(address, { results: 1 });
      if (geo.geoObjects.getLength()) {
        return geo.geoObjects.get(0).geometry.getCoordinates();
      } else {
        alert('Адрес не найден: ' + address);
        return null;
      }
    } catch (err) {
      console.error('Ошибка геокодирования:', err);
      alert('Произошла ошибка при геокодировании.');
      return null;
    }
  }

  // Отображение всплывающего окна стоимости
  function showCostOverlay(text) {
    const costOverlay = document.getElementById('costOverlay');
    const costText = document.getElementById('costText');
    costText.textContent = text;
    costOverlay.classList.add('active');
  }

  // Обработка формы заказа такси (показ цены)
  function initPriceCalculation() {
    const showPricesBtn = document.getElementById('showPricesBtn');
    showPricesBtn.addEventListener('click', async () => {
      const from = document.getElementById('pickup').value.trim();
      const to = document.getElementById('dropoff').value.trim();
      if (!from || !to) {
        alert('Укажите адреса (Откуда / Куда)!');
        return;
      }
      const c1 = await geocodeRealAddress(from);
      const c2 = await geocodeRealAddress(to);
      if (c1 && c2) {
        pickupPlacemark.geometry.setCoordinates(c1);
        dropoffPlacemark.geometry.setCoordinates(c2);
        myMap.setBounds(myMap.geoObjects.getBounds(), { checkZoomRange: true });
        const dist = ymaps.coordSystem.geo.getDistance(c1, c2) / 1000;
        const price = Math.round(dist * 100);
        showCostOverlay(`Стоимость поездки: ${price} руб.`);
      }
    });
  }

  // Обработка формы посылки
  function initParcelForm() {
    const showParcelBtn = document.getElementById('showParcelBtn');
    const parcelForm = document.getElementById('parcelFormContainer');
    const cancelParcelBtn = document.getElementById('cancelParcelBtn');
    const sendParcelBtn = document.getElementById('sendParcelBtn');
    showParcelBtn.addEventListener('click', () => { parcelForm.style.display = 'block'; });
    cancelParcelBtn.addEventListener('click', () => { parcelForm.style.display = 'none'; });
    sendParcelBtn.addEventListener('click', async () => {
      const fromAddr = document.getElementById('parcel-pickup').value.trim();
      const toAddr = document.getElementById('parcel-dropoff').value.trim();
      const weight = parseFloat(document.getElementById('parcel-weight').value.trim() || '0');
      if (!fromAddr || !toAddr || !weight) {
        alert('Заполните все поля!');
        return;
      }
      const fromCoords = await geocodeRealAddress(fromAddr);
      const toCoords = await geocodeRealAddress(toAddr);
      if (fromCoords && toCoords) {
        const distKm = ymaps.coordSystem.geo.getDistance(fromCoords, toCoords) / 1000;
        const cost = Math.round(distKm * 80 + weight * 5);
        showCostOverlay(`Стоимость посылки: ${cost} руб.`);
      }
    });
  }

  // Обработка модальных окон выбора даты и времени
  function initDateTimeOverlays() {
    const dateOverlay = document.getElementById('dateOverlay');
    const timeOverlay = document.getElementById('timeOverlay');
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    const dateNextBtn = document.getElementById('dateNextBtn');
    const timeOkBtn = document.getElementById('timeOkBtn');
    const openDateBtn = document.getElementById('openDateBtn');

    if (openDateBtn) {
      openDateBtn.addEventListener('click', () => { dateOverlay.classList.add('active'); });
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

  // Обработка деталей поездки
  function initTripDetails() {
    const trips = document.querySelectorAll('.trip-item');
    const tripDetailOverlay = document.getElementById('tripDetailOverlay');
    const tripDetailText = document.getElementById('tripDetailText');
    const closeTripDetailBtn = document.getElementById('closeTripDetailBtn');
    trips.forEach(t => {
      t.addEventListener('click', () => {
        const detail = t.dataset.detail || 'Нет данных...';
        tripDetailText.textContent = detail;
        tripDetailOverlay.classList.add('active');
      });
    });
    closeTripDetailBtn.addEventListener('click', () => { tripDetailOverlay.classList.remove('active'); });
  }
})();
