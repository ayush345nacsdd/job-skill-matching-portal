// assets/auth-guard.js
function requireRole(requiredRole) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.role !== requiredRole) {
    alert("Unauthorized access");
    window.location.href = "../login.html";
  }
}
