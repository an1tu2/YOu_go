// script.js — пример основного кода JS (подключается с defer)
let currentSection = 'home';
let myMap;
let pickupPlacemark, dropoffPlacemark;

// Координаты по умолчанию (Екатеринбург)
const defaultCityCoords = [56.838011, 60.597465];
const defaultZoom = 10;

// Инициализация карты
document.addEventListener('DOMContentLoaded', () => {
  try {
    ymaps.ready(initMap);
  } catch (error) {
    console.error('Ошибка при инициализации Яндекс.Карт:', error);
  }

  // Бургер-меню
  const burgerBtn = document.getElementById('burgerBtn');
  const nav = document.getElementById('nav');
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    nav.classList.toggle('active');
  });

  // Переключение страниц
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      if (targetId !== currentSection) {
        switchSection(targetId);
      }
    });
  });

  // Кнопка "Показать цены"
  document.getElementById('showPricesBtn').addEventListener('click', async () => {
    const pickup = document.getElementById('pickup').value.trim();
    const dropoff = document.getElementById('dropoff').value.trim();
    if (!pickup || !dropoff) {
      alert('Введите корректные адреса "Откуда" и "Куда".');
      return;
    }
    try {
      const pickupCoords = await geocodeAddress(pickup);
      const dropoffCoords = await geocodeAddress(dropoff);
      if (pickupCoords && dropoffCoords) {
        pickupPlacemark.geometry.setCoordinates(pickupCoords);
        dropoffPlacemark.geometry.setCoordinates(dropoffCoords);
        myMap.setBounds(myMap.geoObjects.getBounds(), { checkZoomRange: true });
        const distanceKm = ymaps.coordSystem.geo.getDistance(pickupCoords, dropoffCoords) / 1000;
        const price = Math.round(distanceKm * 100);
        document.getElementById('priceResult').textContent = `Примерная стоимость: ~${price} руб.`;
      } else {
        alert('Не удалось определить координаты. Попробуйте снова.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при геокодировании.');
    }
  });

  // Оформление посылки
  const showParcelFormBtn = document.getElementById('showParcelFormBtn');
  const parcelFormContainer = document.getElementById('parcelFormContainer');
  const cancelParcelBtn = document.getElementById('cancelParcelBtn');
  const sendParcelBtn = document.getElementById('sendParcelBtn');

  showParcelFormBtn.addEventListener('click', () => {
    document.getElementById('priceResult').textContent = '';
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
    try {
      const pPickupCoords = await geocodeAddress(pPickup);
      const pDropoffCoords = await geocodeAddress(pDropoff);
      if (pPickupCoords && pDropoffCoords) {
        alert('Посылка успешно оформлена!');
        parcelFormContainer.style.display = 'none';
      } else {
        alert('Не удалось определить координаты для посылки.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при оформлении посылки.');
    }
  });
});

/** Переключение секций с анимацией */
function switchSection(targetId) {
  const oldSection = document.getElementById(currentSection);
  const newSection = document.getElementById(targetId);
  oldSection.classList.add('fade-out');

  const handleOldAnimation = () => {
    oldSection.removeEventListener('animationend', handleOldAnimation);
    oldSection.classList.remove('active', 'fade-out');

    newSection.classList.add('active', 'fade-in');
    const handleNewAnimation = () => {
      newSection.removeEventListener('animationend', handleNewAnimation);
      newSection.classList.remove('fade-in');
    };
    newSection.addEventListener('animationend', handleNewAnimation);

    currentSection = targetId;
  };
  oldSection.addEventListener('animationend', handleOldAnimation);
}

/** Инициализация карты */
function initMap() {
  myMap = new ymaps.Map('map', {
    center: defaultCityCoords,
    zoom: defaultZoom,
    controls: []
  });
  myMap.setType('yandex#hybrid');
  pickupPlacemark = new ymaps.Placemark(defaultCityCoords, { hintContent: 'Екатеринбург (Откуда)' }, { preset: 'islands#yellowIcon' });
  dropoffPlacemark = new ymaps.Placemark(defaultCityCoords, { hintContent: 'Екатеринбург (Куда)' }, { preset: 'islands#orangeIcon' });
  myMap.geoObjects.add(pickupPlacemark);
  myMap.geoObjects.add(dropoffPlacemark);
}

/** Геокодирование адреса */
async function geocodeAddress(address) {
  try {
    const result = await ymaps.geocode(address, { results: 1 });
    if (result.geoObjects.getLength()) {
      return result.geoObjects.get(0).geometry.getCoordinates();
    }
  } catch (error) {
    console.error('Геокодирование не удалось:', error);
  }
  return null;
}

/** Подсказки адреса (можно добавить debounce) */
function setupSuggestions(inputId, listId) {
  // Аналогично предыдущим примерам, при вводе обращаемся к ymaps.suggest(...)
  // ...
}
