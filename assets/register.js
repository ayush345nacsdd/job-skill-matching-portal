// register.js

/*************** REGISTER ROLE SELECTION (register.html) ****************/
function setRegisterRole(role) {
  // ❌ ADMIN registration not allowed
  if (role === "ADMIN") {
    alert("Admin registration is disabled");
    return;
  }

  localStorage.setItem("registerRole", role);
  window.location.href = "register-form.html";
}

/*************** REGISTER FORM LOGIC (register-form.html) ****************/
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const role = localStorage.getItem("registerRole");

  /* ===== SAFETY CHECK ===== */
  if (!role || role === "ADMIN") {
    alert("Invalid registration role");
    window.location.href = "register.html";
    return;
  }

  /* ===== UPDATE TITLE ===== */
  const title = document.getElementById("registerRoleTitle");
  if (title) {
    title.textContent = `Register as ${role}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    /* ===== VALIDATION ===== */
    if (!name || !email || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    /* ===== PREVENT DUPLICATE EMAIL ===== */
    if (users.some(u => u.email === email)) {
      alert("Email already registered");
      return;
    }

    /* ===== CREATE USER OBJECT ===== */
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // demo only
      role,
      skills: [],
      documents: {
        resume: null
      }
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    /* ===== AUTO LOGIN ===== */
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: newUser.id,
        role: newUser.role,
        name: newUser.name
      })
    );

    localStorage.removeItem("registerRole");
    form.reset();

    alert("Registration successful!");

    /* ===== REDIRECT ===== */
    if (role === "JOBSEEKER") {
      window.location.href = "jobseeker/dashboard.html";
    } else if (role === "RECRUITER") {
      window.location.href = "recruiter/dashboard.html";
    }
  });
});
