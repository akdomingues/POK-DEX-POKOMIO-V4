# ⚡ Pokômio – Advanced Interactive Pokédex

## 🧩 About the Project
Pokômio is an interactive Pokédex built with **HTML**, **CSS**, and **pure JavaScript**, allowing users to explore Pokémon in a dynamic and visually engaging way.  
Each Pokémon includes complete details, generation information, types, height, weight, description, and its full evolution chain, with all images and data fetched directly from the **PokeAPI**.

The system features **instant search**, **advanced filtering**, **detailed modals**, **persistent favorites**, and an **interactive sidebar menu**, with all preferences stored locally in the browser.

---

## 🌐 Live Demo

https://akdomingues.github.io/POK-DEX-POKOMIO-V4/

---

## 🚀 Key Features

### 🧭 Navigation & Interface
- Modern interface with a **retro aesthetic inspired by classic Pokémon games**
- Interactive sidebar menu with multiple categories:
  - 🔹 All
  - 🔹 Favorites
  - 🔹 Generations
  - 🔹 Types
  - 🔹 Evolution Stage
  - 🔹 Sort By
  - 🔹 Reset Filters

### ⭐ Favorites System
- Add or remove Pokémon from favorites using the ⭐ icon  
- Favorites are saved automatically using **localStorage**, remaining intact even after closing the browser

### 🔍 Smart Search
- Real-time search by **name or ID**

### ⚙️ Filters & Sorting

**Available filters:**
- Generation  
- Type  
- Evolution stage (Basic, Middle, Final, Single)

**Sorting options:**
- ID (default)
- Name (A–Z / Z–A)
- Height (tallest / shortest)
- Weight (heaviest / lightest)

### 🪄 Detailed Modal
- Displays image, name, type, height, weight, generation, and description  
- Shows the **full evolution chain** with clickable sprites  
- Features **dynamic type-based gradient backgrounds**

### 📱 Responsive Layout
- Fully optimized for **desktop, tablet, and mobile**
- Adaptive grid with collapsible menus

### 🔝 Extras
- Floating **Back to Top** button  
- Dynamic shadows and gradients based on Pokémon type  
- Smooth animations and transitions

---

## 🧰 Technologies Used
| Technology | Purpose |
|-----------|---------|
| **HTML5** | Structure and semantics |
| **CSS3 (with Google Fonts)** | Retro styling and responsive layout |
| **JavaScript (ES6+)** | Logic, interactivity, DOM manipulation |
| **PokeAPI** | Real-time Pokémon data, sprites, and evolution chains |
| **LocalStorage** | Persistent favorites system |

---

## 📂 Project Structure
pokomio/
├── index.html
├── style.css
├── script.js
├── pokemons.json
└── assets/
    ├── pokebola.png
    ├── lupa.png
    ├── setacima.png
    ├── star-filled.png
    └── star-empty.png

---

## 🧑‍💻 Developers
- Cauã Buch Domingues  
- João Pedro Rospirski Pegorini  

---

## 🧡 License
This project is for academic and educational purposes only.  
Developed as part of the **Software Engineering** course.
