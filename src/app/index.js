// src/app/index.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const SimpleJsonDB = require('simple-json-db'); // Jednoduchá JSON databáze

const app = express();

// Použijeme vestavìný middleware pro parsování JSON tìla požadavkù
app.use(express.json());

// Servírujeme statické soubory z adresáøe www
app.use(express.static(path.join(__dirname, '../www')));

// Inicializace databáze v souboru data/users.json
// Pokud soubor ještì neexistuje, simple-json-db ho vytvoøí s prázdnými daty.
const db = new SimpleJsonDB(path.join(__dirname, '../data/users.json'));

// Pomocné funkce pro práci s uživateli
function getUsers() {
  // Oèekáváme, že v db budeme mít objekt s klíèem "users".
  return db.get('users') || {};
}

function saveUsers(users) {
  db.set('users', users);
}

// Registrace uživatele
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Chybí uživatelské jméno nebo heslo.' });
  }

  const users = getUsers();
  if (users[username]) {
    return res.status(400).json({ message: 'Uživatel již existuje.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    saveUsers(users);
    res.json({ message: 'Registrace probìhla úspìšnì.' });
  } catch (err) {
    res.status(500).json({ message: 'Chyba pøi registraci.' });
  }
});

// Pøihlášení uživatele
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Chybí uživatelské jméno nebo heslo.' });
  }

  const users = getUsers();
  const user = users[username];
  if (!user) {
    return res.status(400).json({ message: 'Uživatel neexistuje.' });
  }

  try {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ message: 'Pøihlášení probìhlo úspìšnì.' });
    } else {
      res.status(401).json({ message: 'Neplatné pøihlašovací údaje.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Chyba pøi pøihlašování.' });
  }
});

// Smazání uživatelského úètu
app.delete('/user', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Chybí uživatelské jméno nebo heslo.' });
  }

  const users = getUsers();
  const user = users[username];
  if (!user) {
    return res.status(400).json({ message: 'Uživatel neexistuje.' });
  }

  try {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      delete users[username];
      saveUsers(users);
      res.json({ message: 'Uživatel byl smazán.' });
    } else {
      res.status(401).json({ message: 'Neplatné pøihlašovací údaje.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Chyba pøi mazání úètu.' });
  }
});

app.get('/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});

module.exports = app;
