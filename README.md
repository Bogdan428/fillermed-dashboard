# FillerMed Dashboard

Un dashboard medical modern pentru gestionarea pacienților și programărilor, perfect pentru receptionistă.

## 🚀 Caracteristici

- **Gestionare Pacienți**: Adăugare, editare, ștergere pacienți
- **Programări**: Planificare și gestionare programări
- **Dashboard Live**: Statistici în timp real
- **Interfață Modernă**: Design responsive cu Tailwind CSS
- **Baza de Date SQLite**: Nu necesită server extern
- **Funcționează Offline**: Perfect pentru laptop de receptionistă

## 📋 Cerințe

- Windows 10/11
- Node.js (versiunea 16 sau mai nouă)
- Browser modern (Chrome, Firefox, Edge)

## 🛠️ Instalare

### Metoda 1: Instalare Automată (Recomandată)

1. **Descarcă și instalează Node.js** de la [nodejs.org](https://nodejs.org/)
2. **Duble-click pe `install.bat`** - va instala toate dependențele automat
3. **Duble-click pe `start.bat`** - va porni aplicația

### Metoda 2: Instalare Manuală

```bash
# Instalează dependențele
npm install

# Pornește aplicația
npm start
```

## 🎯 Utilizare

1. **Pornește aplicația** cu `start.bat`
2. **Deschide browser-ul** la `http://localhost:3000`
3. **Adaugă pacienți** folosind butonul "Add New Patient"
4. **Programează întâlniri** cu "Schedule Appointment"
5. **Vezi statisticile** pe dashboard-ul principal

## 📁 Structura Aplicației

```
dashboard/
├── server.js              # Server Node.js
├── database.sqlite        # Baza de date (se creează automat)
├── index.html            # Dashboard principal
├── patients.html         # Gestionare pacienți
├── appointments.html     # Gestionare programări
├── reports.html          # Rapoarte
├── assets/
│   ├── css/              # Stiluri
│   └── js/
│       ├── api.js        # Client API
│       ├── script.js     # Funcționalități UI
│       └── tailwind-modal.js
├── install.bat           # Script instalare
├── start.bat            # Script pornire
└── package.json         # Dependențe
```

## 🔧 API Endpoints

### Pacienți
- `GET /api/patients` - Lista pacienți
- `POST /api/patients` - Adaugă pacient
- `PUT /api/patients/:id` - Actualizează pacient
- `DELETE /api/patients/:id` - Șterge pacient

### Programări
- `GET /api/appointments` - Lista programări
- `GET /api/appointments/date/:date` - Programări pentru o dată
- `POST /api/appointments` - Adaugă programare
- `PUT /api/appointments/:id` - Actualizează programare
- `DELETE /api/appointments/:id` - Șterge programare

### Dashboard
- `GET /api/dashboard/stats` - Statistici dashboard

## 💾 Baza de Date

Aplicația folosește **SQLite** - o bază de date ușoară care:
- Nu necesită instalare separată
- Stochează datele într-un singur fișier (`database.sqlite`)
- Funcționează offline
- Se creează automat la prima pornire

## 🔒 Siguranță

- Toate datele sunt stocate local pe laptop
- Nu se trimit date către servere externe
- Backup-ul se face prin copierea fișierului `database.sqlite`

## 🆘 Suport

Pentru probleme sau întrebări:
1. Verifică că Node.js este instalat corect
2. Asigură-te că portul 3000 nu este folosit de altă aplicație
3. Verifică log-urile în terminal pentru erori

## 📝 Notițe pentru Receptionistă

- **Adaugă pacienți noi** înainte de a programa întâlniri
- **Verifică programările zilnice** pe dashboard
- **Actualizează statusul** programărilor după confirmare
- **Fă backup regulat** copiind fișierul `database.sqlite`

---

**FillerMed Dashboard** - Gestionare medicală simplă și eficientă! 🏥