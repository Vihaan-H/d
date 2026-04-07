# Liquid Glass Bento Dashboard

A richer single-page bento dashboard with:

- Animated liquid-glass visual style
- Live clock/date + contextual greeting
- Weather in **Celsius** (°C) with humidity, wind, and rain chance
- News feed with Top + New modes
- Editable quick links (add/remove, persisted)
- Micro-task checklist (persisted)
- Notes saved in localStorage
- System tile (connection, battery, focus streak, tab visibility)
- Inactivity screensaver with rotating quotes, twinkling stars, and animated non-static backgrounds
- **Bottom utility drawer** with:
  - **Power Deck with 100 micro-features** (searchable quick actions for note templates, todo injection, timer presets, quote boosts, tint shifts, news pulses, and drawer flips)
  - Pomodoro timer
  - World clocks
  - Mini command runner
  - Weekly habit tracker
- Keyboard shortcuts:
  - `Alt+Q` new quote
  - `Alt+N` focus notes
  - `Alt+R` refresh news
  - `Alt+D` toggle drawer

## Mini Commands

- `quote`
- `note your text`
- `timer 15`
- `drawer`
- `clear`

## Run

Open `index.html` directly, or serve locally:

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.
