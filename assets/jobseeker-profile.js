document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../login.html";
    return;
  }

  /* ================= URL PARAMS ================= */
  const params = new URLSearchParams(window.location.search);
  const viewedUserId = params.get("userId");
  const mode = params.get("mode"); // readonly for recruiter

  /* ================= DATA ================= */
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  let profileUser;
  let userIndex = -1;

  /* ================= PROFILE OWNER ================= */
  if (mode === "readonly") {
    if (currentUser.role !== "RECRUITER") {
      window.location.href = "../login.html";
      return;
    }

    profileUser = users.find(u => String(u.id) === String(viewedUserId));
    if (!profileUser) {
      window.location.href = "../recruiter/dashboard.html";
      return;
    }
  } else {
    if (currentUser.role !== "JOBSEEKER") {
      window.location.href = "../login.html";
      return;
    }

    userIndex = users.findIndex(u => String(u.id) === String(currentUser.id));
    if (userIndex === -1) return;
    profileUser = users[userIndex];
  }

  /* ================= INIT STRUCTURE ================= */
  if (!Array.isArray(profileUser.skills)) profileUser.skills = [];
  if (!profileUser.documents) profileUser.documents = { resume: null };
  if (typeof profileUser.experienceYears !== "number") {
    profileUser.experienceYears = 0;
  }

  /* ================= BASIC INFO ================= */
  document.getElementById("profileUserName").textContent = profileUser.name;
  document.getElementById("fullName").textContent = profileUser.name;
  document.getElementById("email").textContent = `📧 ${profileUser.email}`;
  document.getElementById("location").textContent =
    `📍 ${profileUser.location || "Not set"}`;

  const editNameInput = document.getElementById("editName");
  const editLocationInput = document.getElementById("editLocation");

  editNameInput.value = profileUser.name;
  editLocationInput.value = profileUser.location || "";

  /* 🔒 HARD LOCK INPUTS FOR READONLY MODE */
  if (mode === "readonly") {
    editNameInput.disabled = true;
    editLocationInput.disabled = true;
  }

  /* ================= EXPERIENCE ================= */
  const experienceInput = document.getElementById("experienceYears");

  if (experienceInput) {
    experienceInput.value = profileUser.experienceYears;

    if (mode !== "readonly") {
      experienceInput.onchange = () => {
        const years = Number(experienceInput.value);
        profileUser.experienceYears = isNaN(years) ? 0 : years;
        saveUser();
        updateSkillScoreUI();
      };
    } else {
      experienceInput.disabled = true;
    }
  }

  /* ================= SKILL SCORE LOGIC ================= */
  function calculateTotalSkillScore() {
    const skillPoints = Math.min(profileUser.skills.length * 12, 60);
    const experiencePoints = Math.min(profileUser.experienceYears * 10, 30);
    const resumePoints = profileUser.documents.resume ? 10 : 0;
    return Math.min(skillPoints + experiencePoints + resumePoints, 100);
  }

  function updateSkillScoreUI() {
    const score = calculateTotalSkillScore();

    document.getElementById("profileSkillScore").textContent = score;
    document.querySelector(".skill-score-card strong").textContent = score;

    const badge = document.getElementById("experienceLevel");
    if (score >= 70) {
      badge.textContent = "Advanced";
      badge.className = "badge advanced";
    } else if (score >= 40) {
      badge.textContent = "Intermediate";
      badge.className = "badge intermediate";
    } else {
      badge.textContent = "Beginner";
      badge.className = "badge beginner";
    }
  }

  /* ================= SKILLS ================= */
  const skillsSection = document.querySelector(".skills-section");

  function renderSkills() {
    skillsSection.querySelectorAll(".skill-item").forEach(el => el.remove());

    profileUser.skills.forEach((skill, index) => {
      const item = document.createElement("div");
      item.className = "skill-item";

      item.innerHTML = `
        <div class="skill-row">
          <span class="skill-name">${skill.name}</span>
          ${
            mode !== "readonly"
              ? `<button class="remove-skill btn-outline">Remove</button>`
              : ""
          }
        </div>
      `;

      if (mode !== "readonly") {
        item.querySelector(".remove-skill").onclick = () => {
          profileUser.skills.splice(index, 1);
          saveUser();
          renderSkills();
        };
      }

      skillsSection.appendChild(item);
    });

    updateSkillScoreUI();
  }

  /* ================= ADD SKILL ================= */
  const addSkillBtn = document.querySelector('[data-action="add-skill"]');

  if (mode !== "readonly") {
    addSkillBtn.onclick = () => {
      const skillName = prompt("Enter skill name:");
      if (!skillName) return;

      if (
        profileUser.skills.some(
          s => s.name.toLowerCase() === skillName.toLowerCase()
        )
      ) {
        alert("Skill already exists");
        return;
      }

      profileUser.skills.push({ name: skillName });
      saveUser();
      renderSkills();
    };
  } else {
    addSkillBtn.style.display = "none";
  }

  /* ================= RESUME ================= */
  const resumeInput = document.getElementById("resumeUpload");
  const resumeDisplay = document.getElementById("resumeDisplay");

  function renderResume() {
    resumeDisplay.innerHTML = "";

    if (!profileUser.documents.resume) {
      resumeDisplay.innerHTML = "<p>No resume uploaded.</p>";
      updateSkillScoreUI();
      return;
    }

    const r = profileUser.documents.resume;
    const div = document.createElement("div");
    div.className = "document-item";

    div.innerHTML = `
      <a href="${r.data}" target="_blank" download="${r.name}">📄 ${r.name}</a>
      ${
        mode !== "readonly"
          ? `<button class="btn-danger btn-sm">Delete</button>`
          : ""
      }
    `;

    if (mode !== "readonly") {
      div.querySelector("button").onclick = () => {
        if (!confirm("Delete resume?")) return;
        profileUser.documents.resume = null;
        saveUser();
        renderResume();
      };
    }

    resumeDisplay.appendChild(div);
    updateSkillScoreUI();
  }

  if (mode !== "readonly") {
    resumeInput.onchange = () => {
      const file = resumeInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        profileUser.documents.resume = {
          name: file.name,
          type: file.type,
          data: reader.result
        };
        saveUser();
        renderResume();
      };
      reader.readAsDataURL(file);
    };
  } else {
    resumeInput.style.display = "none";
  }

  /* ================= SAVE ================= */
  function saveUser() {
    if (userIndex !== -1) {
      users[userIndex] = profileUser;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  /* ================= UPDATE PROFILE ================= */
  const updateBtn = document.getElementById("updateProfileBtn");
  if (mode !== "readonly") {
    updateBtn.onclick = () => {
      if (!editNameInput.value.trim()) {
        alert("Name cannot be empty");
        return;
      }

      profileUser.name = editNameInput.value.trim();
      profileUser.location = editLocationInput.value.trim();
      saveUser();
      alert("Profile updated");
      location.reload();
    };
  } else {
    updateBtn.style.display = "none";
  }

  /* ================= INIT ================= */
  renderSkills();
  renderResume();
  updateSkillScoreUI();

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  };

});
