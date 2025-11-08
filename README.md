# Cable Calculator

[![Build and Deploy](https://github.com/matt-tibbett/cable-calculator/actions/workflows/deploy.yml/badge.svg)](https://github.com/matt-tibbett/cable-calculator/actions/workflows/deploy.yml)
![Last Commit](https://img.shields.io/github/last-commit/matt-tibbett/cable-calculator)
![GitHub release](https://img.shields.io/github/v/release/matt-tibbett/cable-calculator?include_prereleases)

![GitHub stars](https://img.shields.io/github/stars/matt-tibbett/cable-calculator?style=social)
![GitHub contributors](https://img.shields.io/github/contributors/matt-tibbett/cable-calculator)
![Status](https://img.shields.io/badge/status-active-success)
![Hosted on](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

A simple web-based tool for calculating **Zs** and **Voltage Drop (Vd)** for electrical circuits.
Supports single circuits and submain/final-circuit combinations.

---

## 🔗 Live Demo

➡️ [View the Cable Calculator on GitHub Pages](https://matt-tibbett.github.io/cable-calculator/)

---

## ⚙️ Features

* Calculates **Zs**, **R1+R2**, and **Voltage Drop (V)** and (%)
* Supports **single-circuit** or **submain + final circuit** modes
* Auto-updates results dynamically in the browser
* Dark mode UI, mobile responsive
* Works offline once loaded

---

## 🧰 Development

To run a local development server:

```bash
make serve
```

This will:

* Start a local HTTP server
* Open your browser to [http://localhost:8000](http://localhost:8000)
* Let you view the app from your phone using your static LAN IP
  (configured in the `Makefile`)

To stop the server, press **Ctrl+C**.

---

## 🚀 Deployment

This project uses **GitHub Actions** to automatically build and deploy.
Every push to the `main` branch triggers a workflow that:

1. Runs `build.py` to bundle the CSS, JS, and HTML into a single file
2. Publishes the generated `docs/index.html` to GitHub Pages

You can check the latest build status with the badge above ☝️

---

## 🧠 Notes

* The `/docs` folder is **ignored** in `.gitignore` and built automatically during deployment.
* You can still run the build manually if needed:

  ```bash
  python build.py
  ```
* Source files:

  * `index.html`
  * `style.css`
  * `script.js`
  * `build.py`
  * `Makefile`

---

## 🧑‍💻 Author

**Matt Tibbett**
📍 [GitHub Profile](https://github.com/matt-tibbett)

---

## 🪪 License

This project is released under the [MIT License](LICENSE) (add if applicable).
