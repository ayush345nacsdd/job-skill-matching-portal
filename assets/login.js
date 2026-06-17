/**************** LOGIN ROLE SELECTION ****************/
function setLoginRole(role) {
  localStorage.setItem("loginRole", role);
  window.location.href = "login-form.html";
}

/**************** DEMO ADMIN SEED ****************/
function seedAdminIfNotExists() {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const adminExists = users.some(u => u.role === "ADMIN");

  if (!adminExists) {
    users.push({
      id: "admin-001",
      name: "System Admin",
      email: "admin@gmail.com",
      password: "admin123",
      role: "ADMIN"
    });

    localStorage.setItem("users", JSON.stringify(users));
  }
}

/**************** LOGIN FORM LOGIC ****************/
document.addEventListener("DOMContentLoaded", () => {
  seedAdminIfNotExists(); // ⭐ critical line

  const form = document.getElementById("loginForm");
  if (!form) return;

  const selectedRole = localStorage.getItem("loginRole");

  if (!selectedRole) {
    alert("Please select a role first");
    window.location.href = "login.html";
    return;
  }

  const title = document.getElementById("loginRoleTitle");
  if (title) title.textContent = `${selectedRole} Login`;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u =>
      u.email === email &&
      u.password === password &&
      u.role === selectedRole
    );

    if (!user) {
      alert("Invalid credentials or role mismatch");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role
    }));

    localStorage.removeItem("loginRole");

    if (user.role === "JOBSEEKER") {
      window.location.href = "jobseeker/dashboard.html";
    } else if (user.role === "RECRUITER") {
      window.location.href = "recruiter/dashboard.html";
    } else if (user.role === "ADMIN") {
      window.location.href = "admin/dashboard.html";
    }
  });
});
