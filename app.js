const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const greetingEl = document.getElementById("greeting");
const screensaverClockEl = document.getElementById("screensaverClock");
const weatherSummaryEl = document.getElementById("weatherSummary");
const weatherDetailEl = document.getElementById("weatherDetail");
const weatherExtraEl = document.getElementById("weatherExtra");
const refreshWeatherBtn = document.getElementById("refreshWeather");
const refreshNewsBtn = document.getElementById("refreshNews");
const newsTopBtn = document.getElementById("newsTop");
const newsNewBtn = document.getElementById("newsNew");
const newsListEl = document.getElementById("newsList");
const linkGridEl = document.getElementById("linkGrid");
const addLinkBtn = document.getElementById("addLink");
const notesEl = document.getElementById("notes");
const focusQuoteEl = document.getElementById("focusQuote");
const screensaverQuoteEl = document.getElementById("screensaverQuote");
const newQuoteBtn = document.getElementById("newQuote");
const screensaverEl = document.getElementById("screensaver");
const starsEl = document.getElementById("stars");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoListEl = document.getElementById("todoList");
const clearDoneBtn = document.getElementById("clearDone");
const connectionStateEl = document.getElementById("connectionState");
const batteryStateEl = document.getElementById("batteryState");
const streakEl = document.getElementById("streak");
const visibilityStateEl = document.getElementById("visibilityState");

const bottomDrawerEl = document.getElementById("bottomDrawer");
const drawerToggleBtn = document.getElementById("drawerToggle");
const pomodoroTimeEl = document.getElementById("pomodoroTime");
const pomodoroStartBtn = document.getElementById("pomodoroStart");
const pomodoroPauseBtn = document.getElementById("pomodoroPause");
const pomodoroResetBtn = document.getElementById("pomodoroReset");
const worldClocksEl = document.getElementById("worldClocks");
const commandForm = document.getElementById("commandForm");
const commandInput = document.getElementById("commandInput");
const commandResult = document.getElementById("commandResult");
const habitGridEl = document.getElementById("habitGrid");
const featureDeckEl = document.getElementById("featureDeck");
const featureSearchEl = document.getElementById("featureSearch");
const featureCountEl = document.getElementById("featureCount");

const quotes = [
  "The future depends on what you do today.",
  "Slow is smooth. Smooth is fast.",
  "You only need one good hour to change your day.",
  "Consistency beats intensity.",
  "Done is better than perfect, then improve.",
  "Stay curious, stay kind, keep building.",
  "Big goals are built from tiny daily promises.",
  "Protect your attention; it shapes your life.",
  "A calm plan beats anxious urgency.",
  "A clean desk helps a clean mind.",
];

const defaultLinks = [
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Calendar", url: "https://calendar.google.com" },
  { name: "GitHub", url: "https://github.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "Docs", url: "https://docs.google.com" },
  { name: "ChatGPT", url: "https://chatgpt.com" },
];

const worldClockZones = [
  { label: "UTC", zone: "UTC" },
  { label: "New York", zone: "America/New_York" },
  { label: "London", zone: "Europe/London" },
  { label: "Tokyo", zone: "Asia/Tokyo" },
];


const microFeatures = [
  ...Array.from({ length: 20 }, (_, i) => ({ id: `note_focus_${i + 1}`, label: `Focus note ${i + 1}`, type: "note", payload: `Focus sprint ${i + 1}: ship one tiny win.` })),
  ...Array.from({ length: 20 }, (_, i) => ({ id: `todo_micro_${i + 1}`, label: `Micro task ${i + 1}`, type: "todo", payload: `Micro task ${i + 1}` })),
  ...Array.from({ length: 15 }, (_, i) => ({ id: `timer_${(i + 1) * 5}`, label: `${(i + 1) * 5}m timer`, type: "timer", payload: (i + 1) * 5 })),
  ...Array.from({ length: 15 }, (_, i) => ({ id: `quote_${i + 1}`, label: `Quote boost ${i + 1}`, type: "quote" })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `theme_${i + 1}`, label: `Theme tint ${i + 1}`, type: "tint", payload: i })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `news_refresh_${i + 1}`, label: `News pulse ${i + 1}`, type: "news" })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `drawer_toggle_${i + 1}`, label: `Drawer flip ${i + 1}`, type: "drawer" })),
];

let inactivityTimeout;
const inactivityMs = 45_000;
let currentPosition = null;
let newsMode = "top";
let streakSeconds = 0;
let drawerOpen = false;
let pomodoroSeconds = 25 * 60;
let pomodoroInterval = null;
let activeFeatures = loadState("bento_active_features", []);

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let links = loadState("bento_links", defaultLinks);
let todos = loadState("bento_todos", []);
let habit = loadState("bento_habit_week", Array(7).fill(false));

function pickQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  focusQuoteEl.textContent = `"${quote}"`;
  screensaverQuoteEl.textContent = `"${quote}"`;
}

function renderLinks() {
  linkGridEl.innerHTML = "";

  links.forEach((link, idx) => {
    const a = document.createElement("a");
    a.className = "link-chip";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noreferrer noopener";

    const label = document.createElement("span");
    label.textContent = link.name;

    const kill = document.createElement("span");
    kill.className = "kill-link";
    kill.textContent = "×";
    kill.title = "Remove link";
    kill.addEventListener("click", (event) => {
      event.preventDefault();
      links = links.filter((_, linkIndex) => linkIndex !== idx);
      saveState("bento_links", links);
      renderLinks();
    });

    a.append(label, kill);
    linkGridEl.appendChild(a);
  });
}

function addLink() {
  const name = prompt("Link label:");
  if (!name) return;
  let url = prompt("Link URL (include https://):");
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  links.push({ name: name.trim(), url: url.trim() });
  saveState("bento_links", links);
  renderLinks();
}

function renderGreeting(hour) {
  if (hour < 12) greetingEl.textContent = "Good morning ☀️";
  else if (hour < 18) greetingEl.textContent = "Good afternoon 🌤️";
  else greetingEl.textContent = "Good evening 🌙";
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
  renderGreeting(now.getHours());

  renderWorldClocks();
}

const weatherCodeLabel = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  61: "Rain",
  71: "Snow",
  95: "Thunderstorm",
};

async function loadWeather(lat, lon) {
  try {
    weatherSummaryEl.textContent = "Fetching weather…";
    weatherDetailEl.textContent = "";
    weatherExtraEl.textContent = "";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&hourly=precipitation_probability&forecast_days=1&temperature_unit=celsius&wind_speed_unit=kmh`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API failed");

    const data = await res.json();
    const c = data.current;
    const codeLabel = weatherCodeLabel[c.weather_code] || `Code ${c.weather_code}`;

    const summary = `${Math.round(c.temperature_2m)}°C • feels ${Math.round(c.apparent_temperature)}°C`;
    weatherSummaryEl.textContent = summary;
    weatherDetailEl.textContent = `${codeLabel} • Wind ${Math.round(c.wind_speed_10m)} km/h`;

    const chance = Math.max(...(data.hourly.precipitation_probability || [0]));
    weatherExtraEl.textContent = `Humidity ${Math.round(c.relative_humidity_2m)}% • Rain chance ${chance}%`;
  } catch (_e) {
    weatherSummaryEl.textContent = "Weather unavailable";
    weatherDetailEl.textContent = "Check network and retry.";
    weatherExtraEl.textContent = "";
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
      currentPosition = position.coords;
      loadWeather(currentPosition.latitude, currentPosition.longitude);
    },
    () => {
      weatherSummaryEl.textContent = "Location blocked";
      weatherDetailEl.textContent = "Enable location access to load weather.";
    }
  );

  refreshWeatherBtn.onclick = () => {
    if (currentPosition) {
      loadWeather(currentPosition.latitude, currentPosition.longitude);
      return;
    }

    initWeather();
  };
}

async function loadNews(mode = newsMode) {
  newsMode = mode;
  newsTopBtn.classList.toggle("active-chip", mode === "top");
  newsNewBtn.classList.toggle("active-chip", mode === "new");
  newsListEl.innerHTML = "<li>Loading stories…</li>";

  try {
    const endpoint = mode === "new"
      ? "https://hn.algolia.com/api/v1/search_by_date?tags=story"
      : "https://hn.algolia.com/api/v1/search?tags=front_page";

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("News API failed");

    const data = await res.json();
    const items = data.hits.filter((item) => item.title).slice(0, 10);
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

function renderTodos() {
  todoListEl.innerHTML = "";
  todos.forEach((todo, idx) => {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => {
      todos[idx].done = checkbox.checked;
      saveState("bento_todos", todos);
      renderTodos();
    });

    const text = document.createElement("span");
    text.textContent = todo.text;

    li.append(checkbox, text);
    todoListEl.appendChild(li);
  });
}

function initTodos() {
  renderTodos();
  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    todos.unshift({ text, done: false, at: Date.now() });
    todoInput.value = "";
    saveState("bento_todos", todos);
    renderTodos();
  });

  clearDoneBtn.addEventListener("click", () => {
    todos = todos.filter((todo) => !todo.done);
    saveState("bento_todos", todos);
    renderTodos();
  });
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
  ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "pointerdown"].forEach((eventName) => {
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

function initConnectionInfo() {
  const update = () => {
    connectionStateEl.textContent = `Connection: ${navigator.onLine ? "online" : "offline"}`;
  };

  update();
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
}

async function initBatteryInfo() {
  if (!("getBattery" in navigator)) {
    batteryStateEl.textContent = "Battery: unsupported in this browser";
    return;
  }

  const battery = await navigator.getBattery();
  const updateBattery = () => {
    const percentage = Math.round(battery.level * 100);
    const charging = battery.charging ? "charging" : "not charging";
    batteryStateEl.textContent = `Battery: ${percentage}% (${charging})`;
  };

  updateBattery();
  battery.addEventListener("levelchange", updateBattery);
  battery.addEventListener("chargingchange", updateBattery);
}

function initVisibilityState() {
  const update = () => {
    visibilityStateEl.textContent = `Tab: ${document.hidden ? "background" : "active"}`;
  };

  update();
  document.addEventListener("visibilitychange", update);
}

function initStreak() {
  setInterval(() => {
    if (document.hidden || screensaverEl.classList.contains("active")) return;
    streakSeconds += 1;
    streakEl.textContent = `Focus streak: ${Math.floor(streakSeconds / 60)} minutes`;
  }, 1000);
}

function initStars() {
  for (let i = 0; i < 120; i += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2.5}s`;
    starsEl.appendChild(star);
  }
}

function initShortcuts() {
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "q" && event.altKey) pickQuote();
    if (event.key.toLowerCase() === "n" && event.altKey) notesEl.focus();
    if (event.key.toLowerCase() === "r" && event.altKey) loadNews(newsMode);
    if (event.key.toLowerCase() === "d" && event.altKey) toggleDrawer();
    if (event.key === "Escape") setScreensaver(false);
  });
}

function toggleDrawer(force) {
  drawerOpen = typeof force === "boolean" ? force : !drawerOpen;
  bottomDrawerEl.classList.toggle("open", drawerOpen);
  drawerToggleBtn.setAttribute("aria-expanded", String(drawerOpen));
  drawerToggleBtn.textContent = drawerOpen ? "▼ Close utility drawer" : "▲ Open utility drawer";
}

function formatTimer(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function renderPomodoro() {
  pomodoroTimeEl.textContent = formatTimer(pomodoroSeconds);
}

function initPomodoro() {
  renderPomodoro();

  pomodoroStartBtn.addEventListener("click", () => {
    if (pomodoroInterval) return;

    pomodoroInterval = setInterval(() => {
      if (pomodoroSeconds <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        commandResult.textContent = "Pomodoro complete. Stretch and breathe.";
        return;
      }

      pomodoroSeconds -= 1;
      renderPomodoro();
    }, 1000);
  });

  pomodoroPauseBtn.addEventListener("click", () => {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
  });

  pomodoroResetBtn.addEventListener("click", () => {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroSeconds = 25 * 60;
    renderPomodoro();
  });
}

function renderWorldClocks() {
  worldClocksEl.innerHTML = "";
  const now = new Date();

  worldClockZones.forEach((entry) => {
    const li = document.createElement("li");
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: entry.zone,
    });

    li.textContent = `${entry.label}: ${time}`;
    worldClocksEl.appendChild(li);
  });
}

function executeCommand(input) {
  const [cmd, ...rest] = input.trim().split(/\s+/);
  if (!cmd) return;

  if (cmd === "quote") {
    pickQuote();
    commandResult.textContent = "New quote generated.";
    return;
  }

  if (cmd === "note") {
    const text = rest.join(" ");
    if (!text) {
      commandResult.textContent = "Usage: note your text";
      return;
    }

    notesEl.value = `${notesEl.value}\n${text}`.trim();
    localStorage.setItem("bento_notes", notesEl.value);
    commandResult.textContent = "Added note line.";
    return;
  }

  if (cmd === "timer") {
    const mins = Number(rest[0]);
    if (!Number.isFinite(mins) || mins <= 0) {
      commandResult.textContent = "Usage: timer 15";
      return;
    }

    pomodoroSeconds = Math.floor(mins * 60);
    renderPomodoro();
    commandResult.textContent = `Timer set for ${mins} minutes.`;
    return;
  }

  if (cmd === "drawer") {
    toggleDrawer();
    commandResult.textContent = "Drawer toggled.";
    return;
  }

  if (cmd === "clear") {
    notesEl.value = "";
    localStorage.setItem("bento_notes", "");
    commandResult.textContent = "Notes cleared.";
    return;
  }

  commandResult.textContent = "Unknown command. Try: note, quote, timer, drawer, clear";
}

function initCommandForm() {
  commandForm.addEventListener("submit", (event) => {
    event.preventDefault();
    executeCommand(commandInput.value);
    commandInput.value = "";
  });
}

function renderHabit() {
  habitGridEl.innerHTML = "";
  ["M", "T", "W", "T", "F", "S", "S"].forEach((day, idx) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `habit-cell ${habit[idx] ? "done" : ""}`;
    cell.textContent = day;
    cell.title = habit[idx] ? "Done" : "Mark complete";

    cell.addEventListener("click", () => {
      habit[idx] = !habit[idx];
      saveState("bento_habit_week", habit);
      renderHabit();
    });

    habitGridEl.appendChild(cell);
  });
}

function initDrawer() {
  drawerToggleBtn.addEventListener("click", () => toggleDrawer());
}


function addTodoItem(text) {
  todos.unshift({ text, done: false, at: Date.now() });
  saveState("bento_todos", todos);
  renderTodos();
}

function setTint(seed) {
  const hue = (seed * 23) % 360;
  document.documentElement.style.setProperty("--accent", `hsl(${hue} 90% 78%)`);
}

function runMicroFeature(feature) {
  if (feature.type === "note") {
    notesEl.value = `${notesEl.value}
${feature.payload}`.trim();
    localStorage.setItem("bento_notes", notesEl.value);
    commandResult.textContent = `${feature.label} appended to notes.`;
    return;
  }

  if (feature.type === "todo") {
    addTodoItem(feature.payload);
    commandResult.textContent = `${feature.label} added to micro tasks.`;
    return;
  }

  if (feature.type === "timer") {
    pomodoroSeconds = feature.payload * 60;
    renderPomodoro();
    commandResult.textContent = `Timer set to ${feature.payload} minutes.`;
    return;
  }

  if (feature.type === "quote") {
    pickQuote();
    commandResult.textContent = `${feature.label} refreshed quote.`;
    return;
  }

  if (feature.type === "tint") {
    setTint(feature.payload);
    commandResult.textContent = `${feature.label} changed accent tint.`;
    return;
  }

  if (feature.type === "news") {
    loadNews(newsMode);
    commandResult.textContent = `${feature.label} refreshed news.`;
    return;
  }

  if (feature.type === "drawer") {
    toggleDrawer();
    commandResult.textContent = `${feature.label} toggled drawer.`;
  }
}

function renderFeatureDeck() {
  const query = featureSearchEl.value.trim().toLowerCase();
  featureDeckEl.innerHTML = "";

  const filtered = microFeatures.filter((f) => f.label.toLowerCase().includes(query));
  filtered.forEach((feature) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `feature-pill ${activeFeatures.includes(feature.id) ? "active" : ""}`;
    btn.textContent = feature.label;

    btn.addEventListener("click", () => {
      if (!activeFeatures.includes(feature.id)) {
        activeFeatures.push(feature.id);
      }
      saveState("bento_active_features", activeFeatures);
      runMicroFeature(feature);
      renderFeatureDeck();
      updateFeatureCount();
    });

    featureDeckEl.appendChild(btn);
  });
}

function updateFeatureCount() {
  featureCountEl.textContent = `${activeFeatures.length} used`;
}

function initFeatureDeck() {
  featureSearchEl.addEventListener("input", renderFeatureDeck);
  renderFeatureDeck();
  updateFeatureCount();
}

function init() {
  pickQuote();
  renderLinks();
  renderHabit();
  tickClock();
  setInterval(tickClock, 1000);

  initWeather();
  loadNews("top");
  newsTopBtn.onclick = () => loadNews("top");
  newsNewBtn.onclick = () => loadNews("new");
  refreshNewsBtn.onclick = () => loadNews(newsMode);

  newQuoteBtn.onclick = pickQuote;
  addLinkBtn.onclick = addLink;

  initTodos();
  initInactivity();
  initNotes();
  initConnectionInfo();
  initBatteryInfo();
  initVisibilityState();
  initStreak();
  initStars();
  initShortcuts();
  initDrawer();
  initPomodoro();
  initCommandForm();
  initFeatureDeck();
  renderWorldClocks();
}

init();
