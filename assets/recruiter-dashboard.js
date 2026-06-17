document.addEventListener("DOMContentLoaded", () => {

  /* ================= AUTH ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "RECRUITER") {
    window.location.href = "../login.html";
    return;
  }

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  });

  /* ================= USER INFO ================= */
  document.getElementById("recruiterName").textContent = currentUser.name;
  document.getElementById("welcomeRecruiterName").textContent = currentUser.name;
  document.getElementById("recruiterAvatar").textContent =
    currentUser.name.charAt(0).toUpperCase();

  document.getElementById("postJobBtn").onclick = () => {
    window.location.href = "post-job.html";
  };

  /* ================= DATA ================= */
  const users = JSON.parse(localStorage.getItem("users")) || [];
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  let applications = JSON.parse(localStorage.getItem("applications")) || [];

  /* ================= NORMALIZE STATUS ================= */
  jobs = jobs.map(job => ({ ...job, status: job.status || "ACTIVE" }));
  applications = applications.map(app => ({ ...app, status: app.status || "APPLIED" }));

  localStorage.setItem("jobs", JSON.stringify(jobs));
  localStorage.setItem("applications", JSON.stringify(applications));

  /* ================= FILTER RECRUITER JOBS ================= */
  const recruiterJobs = jobs.filter(
    job => String(job.recruiterId) === String(currentUser.id)
  );

  const jobTable = document.getElementById("recruiterJobTable");
  jobTable.innerHTML = "";

  if (!recruiterJobs.length) {
    jobTable.innerHTML = "<p>No jobs posted yet.</p>";
    return;
  }

  /* ================= SKILL MATCH ================= */
  function calculateMatch(requiredSkills = [], seekerSkills = []) {
    if (!requiredSkills.length) return 0;

    const required = requiredSkills.map(s => s.toLowerCase());
    const seeker = seekerSkills.map(s => s.name.toLowerCase());

    const matched = required.filter(skill => seeker.includes(skill));
    return Math.round((matched.length / required.length) * 100);
  }

  /* ================= UPDATE APPLICATION ================= */
  function updateApplicationStatus(jobId, seekerId, status) {
    applications = applications.map(app =>
      String(app.jobId) === String(jobId) &&
      String(app.jobseekerId) === String(seekerId)
        ? { ...app, status }
        : app
    );
    localStorage.setItem("applications", JSON.stringify(applications));
  }

  /* ================= UPDATE JOB STATUS ================= */
  function updateJobStatus(jobId, status) {
    jobs = jobs.map(job =>
      String(job.id) === String(jobId)
        ? { ...job, status }
        : job
    );
    localStorage.setItem("jobs", JSON.stringify(jobs));
    location.reload();
  }

  /* ================= DELETE JOB (CASCADE) ================= */
  function deleteJob(jobId) {
    if (!confirm("Are you sure you want to delete this job?")) return;

    jobs = jobs.filter(job => String(job.id) !== String(jobId));
    applications = applications.filter(
      app => String(app.jobId) !== String(jobId)
    );

    localStorage.setItem("jobs", JSON.stringify(jobs));
    localStorage.setItem("applications", JSON.stringify(applications));
    location.reload();
  }

  /* ================= RENDER JOBS ================= */
  recruiterJobs.forEach(job => {

    const jobApplications = applications.filter(
      app => String(app.jobId) === String(job.id)
    );

    const avgMatch = jobApplications.length
      ? Math.round(
          jobApplications.reduce((sum, app) => {
            const seeker = users.find(
              u => String(u.id) === String(app.jobseekerId)
            );
            return seeker
              ? sum + calculateMatch(job.requiredSkills, seeker.skills || [])
              : sum;
          }, 0) / jobApplications.length
        )
      : 0;

    const jobCard = document.createElement("div");
    jobCard.className = "job-card";

    jobCard.innerHTML = `
      <div class="job-row">
        <div class="job-main">
          <h3>${job.title}</h3>
          <span class="badge status-${job.status.toLowerCase()}">${job.status}</span>
        </div>

        <div class="job-meta">
          <span>📍 ${job.location}</span>
          <span>${jobApplications.length} Applicants</span>
        </div>

        <div class="job-score">⭐ ${avgMatch}%</div>
        <div class="job-actions"></div>
      </div>

      <div class="job-ranking hidden">
        <h3 class="ranking-title"></h3>
        <div class="ranked-candidates-list"></div>
        <button class="btn-outline close-ranking-btn">Close</button>
      </div>
    `;

    const actions = jobCard.querySelector(".job-actions");
    const rankingBox = jobCard.querySelector(".job-ranking");
    const rankingTitle = jobCard.querySelector(".ranking-title");
    const rankingList = jobCard.querySelector(".ranked-candidates-list");

    /* ===== VIEW RANKED CANDIDATES ===== */
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn-outline";
    viewBtn.textContent = "View Ranked Candidates";

    viewBtn.onclick = () => {
      rankingBox.classList.toggle("hidden");
      rankingTitle.textContent = `Candidates for ${job.title}`;
      rankingList.innerHTML = "";

      if (rankingBox.classList.contains("hidden")) return;
      if (!jobApplications.length) {
        rankingList.innerHTML = "<p>No applications yet.</p>";
        return;
      }
      if (job.status === "CLOSED") {
        rankingList.innerHTML = "<p>Job is closed. Decisions are final.</p>";
        return;
      }

      const rankedCandidates = jobApplications
        .map(app => {
          const seeker = users.find(
            u => String(u.id) === String(app.jobseekerId)
          );
          return seeker
            ? {
                id: seeker.id,
                name: seeker.name,
                score: calculateMatch(job.requiredSkills, seeker.skills || []),
                status: app.status
              }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      rankedCandidates.forEach((candidate, index) => {
        const row = document.createElement("div");
        row.className = "candidate-card";

        row.innerHTML = `
          <span>${index + 1}</span>
          <span>${candidate.name}</span>
          <span>${candidate.score}%</span>

          <div class="candidate-actions">
            <button class="btn-outline view-profile-btn">View Profile</button>

            ${
              candidate.status === "APPLIED"
                ? `
                  <button class="btn-success select-btn">Select</button>
                  <button class="btn-danger reject-btn">Reject</button>
                `
                : `<span class="badge status-${candidate.status.toLowerCase()}">
                    ${candidate.status}
                   </span>`
            }
          </div>
        `;

        /* ✅ OPEN EXISTING PROFILE PAGE (READ-ONLY) */
        row.querySelector(".view-profile-btn").addEventListener("click", () => {
          window.location.href =
            `../jobseeker/profile.html?userId=${candidate.id}&mode=readonly`;
        });

       row.querySelector(".select-btn")?.addEventListener("click", () => {
       updateApplicationStatus(job.id, candidate.id, "SELECTED");
       location.reload(); // refresh to reflect status badge
       });

        row.querySelector(".reject-btn")?.addEventListener("click", () => {
          updateApplicationStatus(job.id, candidate.id, "REJECTED");
          location.reload();
        });

        rankingList.appendChild(row);
      });
    };

    actions.appendChild(viewBtn);

    /* ===== JOB CONTROLS ===== */
    if (job.status === "ACTIVE") {
      const pauseBtn = document.createElement("button");
      pauseBtn.className = "btn-warning";
      pauseBtn.textContent = "Pause";
      pauseBtn.onclick = () => updateJobStatus(job.id, "PAUSED");
      actions.appendChild(pauseBtn);
    }

    if (job.status === "PAUSED") {
      const resumeBtn = document.createElement("button");
      resumeBtn.className = "btn-success";
      resumeBtn.textContent = "Resume";
      resumeBtn.onclick = () => updateJobStatus(job.id, "ACTIVE");
      actions.appendChild(resumeBtn);
    }

    if (job.status !== "CLOSED") {
      const closeBtn = document.createElement("button");
      closeBtn.className = "btn-danger";
      closeBtn.textContent = "Close";
      closeBtn.onclick = () => updateJobStatus(job.id, "CLOSED");
      actions.appendChild(closeBtn);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteJob(job.id);
    actions.appendChild(deleteBtn);

    jobCard.querySelector(".close-ranking-btn").onclick = () => {
      rankingBox.classList.add("hidden");
    };

    jobTable.appendChild(jobCard);
  });

});
