document.addEventListener("DOMContentLoaded", () => {
  // ================= AUTH =================
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "RECRUITER") {
    window.location.href = "../login.html";
    return;
  }

  // ================= TOP BAR =================
  const nameEl = document.getElementById("recruiterName");
  const avatarEl = document.getElementById("recruiterAvatar");

  if (nameEl) nameEl.textContent = currentUser.name;
  if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();

  // ================= ELEMENTS =================
  const form = document.getElementById("postJobForm");
  const skillInput = document.getElementById("skillInput");
  const addSkillBtn = document.getElementById("addSkillBtn");
  const skillContainer = document.getElementById("skillContainer");

  let skills = [];

  // ================= ADD SKILL =================
  addSkillBtn.addEventListener("click", () => {
    const skill = skillInput.value.trim();
    if (!skill) return;

    // prevent duplicates
    if (skills.includes(skill.toLowerCase())) {
      alert("Skill already added");
      return;
    }

    skills.push(skill.toLowerCase());
    renderSkills();
    skillInput.value = "";
  });

  function renderSkills() {
    skillContainer.innerHTML = "";

    skills.forEach((skill, index) => {
      const chip = document.createElement("div");
      chip.className = "skill-chip";
      chip.innerHTML = `
        ${skill}
        <span class="remove-skill" title="Remove">×</span>
      `;

      chip.querySelector(".remove-skill").addEventListener("click", () => {
        skills.splice(index, 1);
        renderSkills();
      });

      skillContainer.appendChild(chip);
    });
  }

  // ================= SUBMIT JOB =================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("jobTitle").value.trim();
    const description = document.getElementById("jobDescription").value.trim();
    const experience = document.getElementById("experience").value;
    const location = document.getElementById("location").value;

    if (!title || !description || skills.length === 0) {
      alert("Please fill all job details and add at least one skill");
      return;
    }

    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];

    const newJob = {
      id: `JOB_${Date.now()}`,
      title,
      description,
      experience,
      location,
      requiredSkills: skills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      recruiterId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    jobs.push(newJob);
    localStorage.setItem("jobs", JSON.stringify(jobs));

    alert("Job posted successfully!");

    // redirect
    window.location.href = "dashboard.html";
  });
});
