 document.addEventListener("DOMContentLoaded", () => { 

  /* ================= AUTH (STRICT) ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.role !== "JOBSEEKER") {
    window.location.href = "../login.html";
    return;
  }

  /* ================= USER NAME ================= */
  document.getElementById("jobUserName").textContent = currentUser.name;

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  });

  /* ================= DATA ================= */
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  const applications = JSON.parse(localStorage.getItem("applications")) || [];

  const jobSeeker = users.find(
    u => String(u.id) === String(currentUser.id)
  );
  if (!jobSeeker) return;

  const userSkills = (jobSeeker.skills || []).map(s =>
    s.name.toLowerCase()
  );

  /* ================= DOM ================= */
  const jobList = document.getElementById("jobList");
  const shownCountEl = document.getElementById("shownCount");
  const totalCountEl = document.getElementById("totalCount");

  const searchInput = document.getElementById("searchTitle");
  const filterSkill = document.getElementById("filterSkill");
  const filterLocation = document.getElementById("filterLocation");
  const searchBtn = document.getElementById("searchBtn");

  /* ================= HELPERS ================= */
  function calculateMatch(requiredSkills = []) {
    if (!requiredSkills.length) {
      return { percent: 0, matched: [], missing: [] };
    }

    const lowerReq = requiredSkills.map(s => s.toLowerCase());

    const matched = lowerReq.filter(skill =>
      userSkills.includes(skill)
    );

    const missing = lowerReq.filter(
      skill => !userSkills.includes(skill)
    );

    return {
      percent: Math.round((matched.length / lowerReq.length) * 100),
      matched,
      missing
    };
  }

  function getApplication(jobId) {
    return applications.find(
      a =>
        String(a.jobId) === String(jobId) &&
        String(a.jobseekerId) === String(currentUser.id)
    );
  }

  /* ================= FILTER OPTIONS ================= */
  function populateFilters() {
    const skillsSet = new Set();
    const locationsSet = new Set();

    jobs.forEach(job => {
      (job.requiredSkills || []).forEach(skill =>
        skillsSet.add(skill)
      );
      if (job.location) locationsSet.add(job.location);
    });

    skillsSet.forEach(skill => {
      filterSkill.innerHTML += `<option value="${skill}">${skill}</option>`;
    });

    locationsSet.forEach(loc => {
      filterLocation.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
  }

  /* ================= RENDER JOBS ================= */
  function renderJobs(jobArray) {
    jobList.innerHTML = "";

    totalCountEl.textContent = jobArray.length;
    shownCountEl.textContent = jobArray.length;

    if (!jobArray.length) {
      jobList.innerHTML = "<p>No jobs found.</p>";
      return;
    }

    jobArray.forEach(job => {
      const { percent, matched, missing } =
        calculateMatch(job.requiredSkills || []);

      const application = getApplication(job.id);
      const appStatus = application?.status || null;

      const canApply =
        job.status === "ACTIVE" &&
        !appStatus &&
        percent >= 70;

      const card = document.createElement("div");
      card.className = "job-card";

      card.innerHTML = `
        <div class="job-left">
          <h3>${job.title}</h3>
          <p class="company">${job.company || "Company"}</p>
          <p class="location">📍 ${job.location}</p>

          <div class="job-status-bar status-${job.status.toLowerCase()}">
            Job Status: ${job.status}
            ${
              appStatus
                ? `<span class="app-status ${appStatus.toLowerCase()}">${appStatus}</span>`
                : ""
            }
          </div>

          <div class="skill-tags">
            ${(job.requiredSkills || []).map(s => `<span>${s}</span>`).join("")}
          </div>

          <div class="why-job">
            ${
              percent >= 70
                ? `✔ Matched skills: ${matched.join(", ")}`
                : `⚠ Missing skills: ${missing.join(", ")}`
            }
          </div>

          <!-- Recruiter Profile Action -->
          <div class="job-actions">
            <button
              class="btn-secondary view-recruiter-btn"
              data-recruiter-id="${job.recruiterId}">
              View Recruiter Profile
            </button>
          </div>
        </div>

        <div class="job-right">
          <div class="match-info">
            <span>Skill Match</span>
            <strong>${percent}%</strong>
            <div class="match-bar">
              <div class="match-fill" style="width:${percent}%"></div>
            </div>
          </div>

          <button class="apply-btn ${canApply ? "" : "disabled"}">
            ${
              appStatus
                ? appStatus
                : job.status !== "ACTIVE"
                ? "Closed"
                : percent >= 70
                ? "Apply"
                : "Improve Skills"
            }
          </button>
        </div>
      `;

      /* ===== Apply Logic (unchanged) ===== */
      const applyBtn = card.querySelector(".apply-btn");
      if (canApply) {
        applyBtn.addEventListener("click", () => {
          window.location.href = `apply-job.html?jobId=${job.id}`;
        });
      }

      /* ===== View Recruiter Profile (NEW) ===== */
      const viewRecruiterBtn = card.querySelector(".view-recruiter-btn");
      viewRecruiterBtn.addEventListener("click", () => {
        window.location.href =
          `../recruiter/profile.html?recruiterId=${job.recruiterId}&mode=readonly`;
      });

      jobList.appendChild(card);
    });
  }

  /* ================= SEARCH & FILTER ================= */
  function applyFilters() {
    let filtered = [...jobs];

    const searchText = searchInput.value.toLowerCase().trim();
    if (searchText) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchText)
      );
    }

    if (filterSkill.value) {
      filtered = filtered.filter(job =>
        (job.requiredSkills || []).includes(filterSkill.value)
      );
    }

    if (filterLocation.value) {
      filtered = filtered.filter(
        job => job.location === filterLocation.value
      );
    }

    filtered.sort(
      (a, b) =>
        calculateMatch(b.requiredSkills).percent -
        calculateMatch(a.requiredSkills).percent
    );

    renderJobs(filtered);
  }

  /* ================= EVENTS ================= */
  searchBtn.addEventListener("click", applyFilters);
  filterSkill.addEventListener("change", applyFilters);
  filterLocation.addEventListener("change", applyFilters);

  /* ================= INIT ================= */
  populateFilters();
  applyFilters();

});
