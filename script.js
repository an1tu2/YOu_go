/* Общие стили и переменные */
:root {
  --accent: #ff9800;
  --dark-bg: rgba(0,0,0,0.8);
  --text-color: #fff;
  --subtext-color: #ccc;
  --overlay-bg: rgba(0,0,0,0.7);
  --transition-fast: 0.2s;
  --transition-slow: 0.7s;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background: #000;
  font-family: Arial, sans-serif;
  color: var(--text-color);
  overflow-x: hidden;
  position: relative;
}

/* Шапка и навигация */
header {
  background: var(--dark-bg);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 30px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  border-bottom: 1px solid var(--accent);
}
.logo {
  font-size: 1.8rem;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--accent);
}
nav {
  display: flex;
  align-items: center;
}
nav ul {
  display: flex;
  gap: 20px;
  list-style: none;
}
nav ul li a {
  color: var(--text-color);
  text-decoration: none;
  font-size: 1rem;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: background var(--transition-fast);
}
nav ul li a:hover {
  background: #222;
  border-color: var(--accent);
}
.burger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
}
.burger span {
  width: 100%;
  height: 3px;
  background: var(--accent);
  transition: 0.3s;
}
.burger.active span:nth-child(1) {
  transform: translateY(11px) rotate(45deg);
}
.burger.active span:nth-child(2) {
  opacity: 0;
}
.burger.active span:nth-child(3) {
  transform: translateY(-11px) rotate(-45deg);
}

/* Основной контент */
main {
  margin-top: 70px;
  padding: 20px;
  min-height: 80vh;
}
section.page {
  display: none;
  padding: 20px 0;
}
section.page.active {
  display: block;
}

/* Футер */
footer {
  background: var(--dark-bg);
  border-top: 1px solid var(--accent);
  color: #aaa;
  text-align: center;
  padding: 15px;
}

/* Элементы главной страницы */
.login-reminder {
  background: rgba(255,255,255,0.05);
  border-left: 4px solid var(--accent);
  padding: 10px;
  margin-bottom: 20px;
  color: var(--subtext-color);
  max-width: 600px;
}
.login-reminder strong {
  color: var(--accent);
}
.hero {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.hero-left {
  flex: 1 1 350px;
}
.hero-left h1 {
  color: var(--accent);
  font-size: 2rem;
  margin-bottom: 10px;
}
.form-group {
  margin-bottom: 15px;
  position: relative;
}
.form-group label {
  color: var(--accent);
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 2px solid #555;
  background: transparent;
  color: var(--text-color);
  transition: border-color 0.2s;
  font-size: 1rem;
}
.form-group input::placeholder {
  color: #999;
}
.form-group input:focus {
  border-color: var(--accent);
}
.hero-left button {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  margin: 5px 5px 5px 0;
  cursor: pointer;
  transition: 0.2s;
}
.hero-left button:hover {
  opacity: 0.8;
}

/* Карта */
.map-container {
  flex: 1 1 450px;
  height: 400px;
  border: 2px solid var(--accent);
  position: relative;
  overflow: hidden;
}
#map {
  width: 100%;
  height: 100%;
}

/* Подсказки */
.suggestions-list {
  position: absolute;
  background: #222;
  border: 1px solid #444;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  display: none;
  z-index: 1500;
}
.suggestions-list li {
  padding: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.suggestions-list li:hover {
  background: #333;
}

/* Форма посылки */
#parcelFormContainer {
  display: none;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 10px;
  margin-top: 15px;
}
#parcelFormContainer h2 {
  font-size: 1.2rem;
  color: var(--accent);
  margin-bottom: 10px;
}

/* Модальные окна */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  z-index: 2000;
  justify-content: center;
  align-items: center;
}
.overlay.active {
  display: flex;
}
.overlay-content {
  background: #222;
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 20px;
  max-width: 350px;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  animation: fadeIn 0.5s ease forwards;
}
@keyframes fadeIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
.overlay-content h2 {
  color: var(--accent);
  margin-bottom: 10px;
  font-size: 1.2rem;
}
.overlay-content input {
  width: 80%;
  margin-bottom: 10px;
  font-size: 1rem;
  text-align: center;
  border: none;
  border-bottom: 2px solid #555;
  background: transparent;
  color: var(--text-color);
}
.overlay-content input:focus {
  border-color: var(--accent);
  outline: none;
}
.overlay-content button {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 5px;
  font-size: 1rem;
}
.overlay-content button:hover {
  opacity: 0.8;
}

/* Всплывающее окно для стоимости */
.cost-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  z-index: 3000;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.cost-overlay.active {
  display: flex;
}
.cost-popup {
  background: #111;
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 25px 40px;
  color: var(--accent);
  font-size: 1.2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
  animation: fadeIn 0.5s ease forwards;
}
.cost-popup .close-cost {
  display: block;
  margin: 10px auto 0;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 1rem;
}
.cost-popup .close-cost:hover {
  opacity: 0.8;
}

/* Секция "Поездки и отзывы" */
#trips-reviews h2 {
  text-align: center;
  color: var(--accent);
  margin-bottom: 20px;
}
.trips-list, .reviews-list {
  background: rgba(255,255,255,0.05);
  border: 1px solid #444;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}
.trip-item, .review-item {
  background: #222;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}
.trip-item:hover, .review-item:hover {
  background: #333;
}
.trip-detail-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  z-index: 4000;
  justify-content: center;
  align-items: center;
}
.trip-detail-overlay.active {
  display: flex;
}
.trip-detail-content {
  background: #222;
  border: 2px solid var(--accent);
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: left;
  animation: fadeIn 0.5s ease forwards;
}
.trip-detail-content h3 {
  color: var(--accent);
  margin-bottom: 10px;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .burger { display: flex; }
  nav ul {
    display: none;
    flex-direction: column;
    gap: 10px;
  }
  nav.active ul { display: flex; }
  .hero { flex-direction: column; }
  .map-container { height: 300px; }
}
