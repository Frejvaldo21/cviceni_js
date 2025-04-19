// src/app/index.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const SimpleJsonDB = require('simple-json-db'); // Jednoduch� JSON datab�ze

const app = express();

// Pou�ijeme vestav�n� middleware pro parsov�n� JSON t�la po�adavk�
app.use(express.json());

// Serv�rujeme statick� soubory z adres��e www
app.use(express.static(path.join(__dirname, '../www')));

// Inicializace datab�ze v souboru data/users.json
// Pokud soubor je�t� neexistuje, simple-json-db ho vytvo�� s pr�zdn�mi daty.
const db = new SimpleJsonDB(path.join(__dirname, '../data/users.json'));

// Pomocn� funkce pro pr�ci s u�ivateli
function getUsers() {
  // O�ek�v�me, �e v db budeme m�t objekt s kl��em "users".
  return db.get('users') || {};
}

function saveUsers(users) {
  db.set('users', users);
}

// Registrace u�ivatele
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Chyb� u�ivatelsk� jm�no nebo heslo.' });
  }

  const users = getUsers();
  if (users[username]) {
    return res.status(400).json({ message: 'U�ivatel ji� existuje.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    saveUsers(users);
    res.json({ message: 'Registrace prob�hla �sp�n�.' });
  } catch (err) {
    res.status(500).json({ message: 'Chyba p�i registraci.' });
  }
});

// P�ihl�en� u�ivatele
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Chyb� u�ivatelsk� jm�no nebo heslo.' });
  }

  const users = getUsers();
  const user = users[username];
  if (!user) {
    return res.status(400).json({ message: 'U�ivatel neexistuje.' });
  }

  try {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ message: 'P�ihl�en� prob�hlo �sp�n�.' });
    } else {
      res.status(401).json({ message: 'Neplatn� p�ihla�ovac� �daje.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Chyba p�i p�ihla�ov�n�.' });
  }
});

// Smaz�n� u�ivatelsk�ho ��tu
app.delete('/user', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Chyb� u�ivatelsk� jm�no nebo heslo.' });
  }

  const users = getUsers();
  const user = users[username];
  if (!user) {
    return res.status(400).json({ message: 'U�ivatel neexistuje.' });
  }

  try {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      delete users[username];
      saveUsers(users);
      res.json({ message: 'U�ivatel byl smaz�n.' });
    } else {
      res.status(401).json({ message: 'Neplatn� p�ihla�ovac� �daje.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Chyba p�i maz�n� ��tu.' });
  }
});

app.get('/users', (req, res) => {
    const users = getUsers();
    res.json(users);
});

module.exports = app;
