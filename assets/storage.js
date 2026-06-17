// storage.js

// USERS (temporary until backend)
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// SESSION (minimal data only)
function setCurrentUser(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.name
    })
  );
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function clearSession() {
  localStorage.removeItem("currentUser");
}
