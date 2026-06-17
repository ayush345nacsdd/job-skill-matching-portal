document.addEventListener("DOMContentLoaded", () => {
  // ================= AUTH =================
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../login.html";
    return;
  }

  // ================= LOGOUT =================
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  });

  // ================= USER NAME =================
  document.getElementById("applyUserName").textContent = currentUser.name;

  // ================= JOB ID =================
  const jobId = new URLSearchParams(window.location.search).get("jobId");
  if (!jobId) {
    alert("Invalid job link");
    window.location.href = "jobs.html";
    return;
  }

  // ================= DATA =================
  const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];
  let applications = JSON.parse(localStorage.getItem("applications")) || [];

  const job = jobs.find(j => j.id === jobId);
  const user = users.find(u => u.id === currentUser.id);

  if (!job || !user) {
    alert("Job not found");
    window.location.href = "jobs.html";
    return;
  }

  // ================= SKILL MATCH =================
  const userSkills = (user.skills || []).map(s => s.name.toLowerCase());
  const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase());

  let matched = [];
  let missing = [];

  requiredSkills.forEach(skill => {
    userSkills.includes(skill) ? matched.push(skill) : missing.push(skill);
  });

  const matchPercent = requiredSkills.length
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 0;

  const eligible = matchPercent >= 70;

  // ================= APPLICATION STATE =================
  let application = applications.find(
    a => a.jobId === jobId && a.jobseekerId === user.id
  );

  // ================= POPULATE UI =================
  document.getElementById("jobTitle").textContent = job.title;
  document.getElementById("jobCompany").textContent = job.company || "Company";
  document.getElementById("jobLocation").textContent = `📍 ${job.location}`;

  document.getElementById("matchPercent").textContent = `${matchPercent}%`;
  document.getElementById("matchBar").style.width = `${matchPercent}%`;

  // WHY JOB
  const whyList = document.getElementById("whyList");
  whyList.innerHTML = "";

  matched.forEach(s => {
    whyList.innerHTML += `<li>✔ Matches your skill: ${s}</li>`;
  });

  missing.forEach(s => {
    whyList.innerHTML += `<li>⚠ Missing skill: ${s}</li>`;
  });

  // SKILL TAGS
  const skillTags = document.getElementById("skillTags");
  skillTags.innerHTML = "";

  requiredSkills.forEach(s => {
    skillTags.innerHTML += `<span class="${
      matched.includes(s) ? "matched" : "missing"
    }">${s}</span>`;
  });

  document.getElementById("skillGapNote").textContent =
    missing.length ? `⚠ Missing Skills: ${missing.join(", ")}` : "";

  // EXPERIENCE
  document.getElementById("experienceRequired").textContent =
    job.experience || "Not specified";

  // REQUIREMENTS
  const reqList = document.getElementById("jobRequirements");
  reqList.innerHTML = "";
  (job.requirements || []).forEach(r => {
    reqList.innerHTML += `<li>${r}</li>`;
  });

  document.getElementById("companyOverview").textContent =
    job.companyOverview || "No description provided.";

  // ================= APPLY BUTTON =================
  const applyBtn = document.getElementById("applyBtn");

  function updateApplyButton() {
    if (!eligible) {
      applyBtn.textContent = "Improve Skills";
      applyBtn.disabled = true;
    } else if (application && application.status === "APPLIED") {
      applyBtn.textContent = "Applied";
      applyBtn.disabled = true;
    } else {
      applyBtn.textContent = "Apply";
      applyBtn.disabled = false;
    }
  }

  updateApplyButton();

  applyBtn.addEventListener("click", () => {
    if (!eligible || application) return;

    application = {
      id: "APP_" + Date.now(),
      jobId,
      jobseekerId: user.id,
      recruiterId: job.recruiterId,
      matchPercent,
      status: "APPLIED",
      appliedAt: new Date().toISOString()
    };

    applications.push(application);
    localStorage.setItem("applications", JSON.stringify(applications));

    updateApplyButton();
    alert("Application submitted successfully!");
  });
});
