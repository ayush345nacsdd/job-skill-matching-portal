document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH (STRICT) ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.role !== "JOBSEEKER") {
    window.location.href = "../login.html";
    return;
  }

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  });

  /* ================= DATA ================= */
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  let applications = JSON.parse(localStorage.getItem("applications")) || [];

  const user = users.find(u => String(u.id) === String(currentUser.id));
  if (!user) return;

  /* ================= NORMALIZE STRUCTURE ================= */
  if (!Array.isArray(user.skills)) user.skills = [];
  if (!user.documents) user.documents = { resume: null };
  if (typeof user.experienceYears !== "number") user.experienceYears = 0;

  /* ================= NORMALIZE APPLICATION STATUS ================= */
  applications = applications.map(app => ({
    ...app,
    status: app.status || "APPLIED"
  }));
  localStorage.setItem("applications", JSON.stringify(applications));

  /* ================= USER INFO ================= */
  document.getElementById("dashboardUserName").textContent = user.name;
  document.getElementById("welcomeName").textContent = user.name;

  /* ============================================================
     SKILL SCORE (NEW LOGIC — SAME AS PROFILE)
     ============================================================ */

  function calculateSkillScore(u) {
    if (!u) return 0;

    // Skills → max 60
    const skillPoints = Math.min((u.skills?.length || 0) * 12, 60);

    // Experience → max 30
    const experiencePoints = Math.min(
      Number(u.experienceYears || 0) * 10,
      30
    );

    // Resume → 10
    const resumePoints = u.documents?.resume ? 10 : 0;

    return Math.min(skillPoints + experiencePoints + resumePoints, 100);
  }

  const skillScore = calculateSkillScore(user);

  document.getElementById("dashboardSkillScore").textContent = skillScore;
  document.getElementById("skillScoreText").textContent = skillScore;

  const experienceEl = document.getElementById("experienceLevel");
  if (skillScore >= 70) {
    experienceEl.textContent = "Advanced";
  } else if (skillScore >= 40) {
    experienceEl.textContent = "Intermediate";
  } else {
    experienceEl.textContent = "Beginner";
  }

  /* ============================================================
     JOB MATCH FUNCTION (SKILL-BASED)
     ============================================================ */

  const userSkillNames = user.skills.map(s => s.name.toLowerCase());

  function calculateMatch(requiredSkills = []) {
    if (!requiredSkills.length || !userSkillNames.length) return 0;

    const lowerReq = requiredSkills.map(s => s.toLowerCase());
    const matched = lowerReq.filter(skill =>
      userSkillNames.includes(skill)
    );

    return Math.round((matched.length / lowerReq.length) * 100);
  }

  /* ============================================================
     APPLICATIONS (SOURCE OF TRUTH)
     ============================================================ */

  const myApplications = applications.filter(
    a => String(a.jobseekerId) === String(user.id)
  );

  /* ============================================================
     RECOMMENDED JOBS
     ============================================================ */

  const recommendedBox = document.getElementById("recommendedJobs");
  recommendedBox.innerHTML = "";

  const appliedJobIds = myApplications.map(a => String(a.jobId));

  const rankedJobs = jobs
    .filter(job => job.status === "ACTIVE")
    .filter(job => !appliedJobIds.includes(String(job.id)))
    .map(job => ({
      ...job,
      matchPercent: calculateMatch(job.requiredSkills || [])
    }))
    .filter(job => job.matchPercent >= 50)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 3);

  if (!rankedJobs.length) {
    recommendedBox.innerHTML =
      "<p>No suitable job recommendations yet.</p>";
  }

  rankedJobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    card.innerHTML = `
      <div class="job-info">
        <h3>${job.title}</h3>
        <p class="company">${job.company || "Company"}</p>
        <p class="location">📍 ${job.location}</p>

        <div class="match-bar">
          <div class="match-fill" style="width:${job.matchPercent}%"></div>
          <span class="match-text">${job.matchPercent}%</span>
        </div>
      </div>

      <button class="apply-btn">View & Apply</button>
    `;

    card.querySelector(".apply-btn").onclick = () => {
      window.location.href = `apply-job.html?jobId=${job.id}`;
    };

    recommendedBox.appendChild(card);
  });

  /* ============================================================
     APPLICATIONS SUMMARY
     ============================================================ */

  const appList = document.getElementById("applicationList");
  appList.innerHTML = "";

  if (!myApplications.length) {
    appList.innerHTML = "<p>No applications yet.</p>";
    return;
  }

  const statusPriority = {
    SELECTED: 1,
    APPLIED: 2,
    REJECTED: 3
  };

  const sortedApplications = myApplications
    .map(app => {
      const job = jobs.find(j => String(j.id) === String(app.jobId));
      return job ? { ...app, job } : null;
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        (statusPriority[a.status] || 4) -
        (statusPriority[b.status] || 4)
    );

  sortedApplications.slice(0, 3).forEach(app => {
    const item = document.createElement("div");
    item.className = `application-item status-${app.status.toLowerCase()}`;

    item.innerHTML = `
      <span>${app.job.title}</span>
      <span class="status">${app.status}</span>
    `;

    appList.appendChild(item);
  });

});
