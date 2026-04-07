const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const screensaverClockEl = document.getElementById("screensaverClock");
const weatherSummaryEl = document.getElementById("weatherSummary");
const weatherDetailEl = document.getElementById("weatherDetail");
const refreshWeatherBtn = document.getElementById("refreshWeather");
const refreshNewsBtn = document.getElementById("refreshNews");
const newsListEl = document.getElementById("newsList");
const linkGridEl = document.getElementById("linkGrid");
const notesEl = document.getElementById("notes");
const focusQuoteEl = document.getElementById("focusQuote");
const screensaverQuoteEl = document.getElementById("screensaverQuote");
const screensaverEl = document.getElementById("screensaver");

const quotes = [
  "The future depends on what you do today.",
  "Slow is smooth. Smooth is fast.",
  "You only need one good hour to change your day.",
  "Consistency beats intensity.",
  "Done is better than perfect, then improve.",
  "Stay curious, stay kind, keep building.",
];

const quickLinks = [
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Calendar", url: "https://calendar.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "Docs", url: "https://docs.google.com" },
  { name: "ChatGPT", url: "https://chatgpt.com" },
];

let inactivityTimeout;
const inactivityMs = 45_000;

function pickQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  focusQuoteEl.textContent = `"${quote}"`;
  screensaverQuoteEl.textContent = `"${quote}"`;
}

function renderLinks() {
  linkGridEl.innerHTML = "";
  quickLinks.forEach((link) => {
    const a = document.createElement("a");
    a.className = "link-chip";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noreferrer noopener";
    a.textContent = link.name;
    linkGridEl.appendChild(a);
  });
}

function tickClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  clockEl.textContent = time;
  screensaverClockEl.textContent = time;
  dateEl.textContent = date;
}

async function loadWeather(lat, lon) {
  try {
    weatherSummaryEl.textContent = "Fetching weather…";
    weatherDetailEl.textContent = "";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API failed");

    const data = await res.json();
    const c = data.current;

    const summary = `${Math.round(c.temperature_2m)}°F • feels ${Math.round(c.apparent_temperature)}°F`;
    weatherSummaryEl.textContent = summary;
    weatherDetailEl.textContent = `Wind ${Math.round(c.wind_speed_10m)} mph • code ${c.weather_code}`;
  } catch (_e) {
    weatherSummaryEl.textContent = "Weather unavailable";
    weatherDetailEl.textContent = "Check network and retry.";
  }
}

function initWeather() {
  if (!navigator.geolocation) {
    weatherSummaryEl.textContent = "Geolocation unavailable";
    weatherDetailEl.textContent = "Cannot auto-detect weather without location.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      loadWeather(latitude, longitude);
      refreshWeatherBtn.onclick = () => loadWeather(latitude, longitude);
    },
    () => {
      weatherSummaryEl.textContent = "Location blocked";
      weatherDetailEl.textContent = "Enable location access to load weather.";
    }
  );
}

async function loadNews() {
  newsListEl.innerHTML = "<li>Loading top stories…</li>";

  try {
    const res = await fetch("https://hn.algolia.com/api/v1/search?tags=front_page");
    if (!res.ok) throw new Error("News API failed");

    const data = await res.json();
    const items = data.hits.slice(0, 8);
    newsListEl.innerHTML = "";

    items.forEach((story) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = story.url || `https://news.ycombinator.com/item?id=${story.objectID}`;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = story.title;
      li.appendChild(link);
      newsListEl.appendChild(li);
    });
  } catch (_e) {
    newsListEl.innerHTML = "<li>Could not load news right now.</li>";
  }
}

function setScreensaver(active) {
  screensaverEl.classList.toggle("active", active);
  screensaverEl.setAttribute("aria-hidden", String(!active));
}

function resetInactivityTimer() {
  setScreensaver(false);
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    pickQuote();
    setScreensaver(true);
  }, inactivityMs);
}

function initInactivity() {
  ["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();
}

function initNotes() {
  const saved = localStorage.getItem("bento_notes");
  if (saved) notesEl.value = saved;

  notesEl.addEventListener("input", () => {
    localStorage.setItem("bento_notes", notesEl.value);
  });
}

function init() {
  pickQuote();
  renderLinks();
  tickClock();
  setInterval(tickClock, 1000);

  initWeather();
  loadNews();
  refreshNewsBtn.onclick = loadNews;

  initInactivity();
  initNotes();
}

init();
