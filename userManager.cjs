const fs = require('fs');
const path = require('path');

// File to store registered users
const USERS_FILE = path.join(__dirname, 'registered_users.json');

// Initialize users file if it doesn't exist
function initializeUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const initialUsers = [];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
    console.log('✅ Initialized registered_users.json file');
  }
}

// Read users from file
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('❌ Error reading users file:', error);
    return [];
  }
}

// Write users to file
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing users file:', error);
    return false;
  }
}

// Add a new user
function addUser(userData) {
  const users = readUsers();
  const newUser = {
    id: users.length + 1,
    email: userData.email,
    username: userData.username || userData.email,
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    organization_name: userData.organization_name || '',
    country: userData.country || '',
    is_active: true,
    is_staff: true,
    is_superuser: false,
    date_joined: new Date().toISOString(),
    last_login: null,
    password_hash: userData.password_hash || '',
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  console.log('✅ Added new user:', newUser.email);
  return newUser;
}

// Update user login time
function updateUserLogin(userId) {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].last_login = new Date().toISOString();
    writeUsers(users);
    return users[userIndex];
  }
  return null;
}

// Get user by email
function getUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email === email);
}

// Initialize the file
initializeUsersFile();

module.exports = {
  readUsers,
  writeUsers,
  addUser,
  updateUserLogin,
  getUserByEmail,
  initializeUsersFile
};
