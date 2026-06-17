// assets/recruiter-profile.js
// Production-grade, backend-ready, role-safe

document.addEventListener("DOMContentLoaded", () => {
  /* ================= AUTH ================= */
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../login.html";
    return;
  }

  /* ================= URL PARAMS ================= */
  const params = new URLSearchParams(window.location.search);
  const recruiterIdFromURL = params.get("recruiterId");
  const mode = params.get("mode"); // "readonly" ONLY for jobseeker

  /* ================= DATA ================= */
  const recruiterProfiles =
    JSON.parse(localStorage.getItem("recruiterProfiles")) || [];

  let profile = null;
  let profileIndex = -1;

  /* ======================================================
     ACCESS DECISION
     ====================================================== */

  /* ---------- JOBSEEKER READ-ONLY VIEW ---------- */
  if (mode === "readonly") {
    if (currentUser.role !== "JOBSEEKER") {
      window.location.href = "../login.html";
      return;
    }

    if (!recruiterIdFromURL) {
      window.location.href = "../login.html";
      return;
    }

    profile = recruiterProfiles.find(
      p => String(p.recruiterId) === String(recruiterIdFromURL)
    );

    if (!profile) {
      alert("Recruiter profile not found");
      window.history.back();
      return;
    }

    // Hide recruiter-only UI completely
    document
      .querySelectorAll(".recruiter-only")
      .forEach(el => el.remove());
  }

  /* ---------- RECRUITER EDIT VIEW ---------- */
  else {
    if (currentUser.role !== "RECRUITER") {
      window.location.href = "../login.html";
      return;
    }

    // Recruiter must NOT open someone else’s profile
    if (
      recruiterIdFromURL &&
      String(recruiterIdFromURL) !== String(currentUser.id)
    ) {
      window.location.href = "../login.html";
      return;
    }

    profileIndex = recruiterProfiles.findIndex(
      p => String(p.recruiterId) === String(currentUser.id)
    );

    if (profileIndex === -1) {
      profile = {
        recruiterId: currentUser.id,
        recruiterName: currentUser.name,
        recruiterEmail: currentUser.email || "",
        recruiterTitle: "",

        company: {
          name: "",
          industry: "",
          size: "",
          location: "",
          website: "",
          description: ""
        },

        hiring: {
          teams: "",
          workMode: "",
          techStack: "",
          process: ""
        },

        createdAt: new Date().toISOString()
      };

      recruiterProfiles.push(profile);
      profileIndex = recruiterProfiles.length - 1;
      localStorage.setItem(
        "recruiterProfiles",
        JSON.stringify(recruiterProfiles)
      );
    } else {
      profile = recruiterProfiles[profileIndex];
    }
  }

  /* ================= TOP BAR ================= */
  const recruiterNameEl = document.getElementById("recruiterName");
  if (recruiterNameEl) {
    recruiterNameEl.textContent =
      profile.recruiterName || "Recruiter";
  }

  /* ================= FORM FILL ================= */
  const setVal = (id, val = "") => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal("recruiterFullName", profile.recruiterName);
  setVal("recruiterEmail", profile.recruiterEmail);
  setVal("recruiterTitle", profile.recruiterTitle);

  setVal("companyName", profile.company.name);
  setVal("companyIndustry", profile.company.industry);
  setVal("companySize", profile.company.size);
  setVal("companyLocation", profile.company.location);
  setVal("companyWebsite", profile.company.website);
  setVal("companyDescription", profile.company.description);

  setVal("hiringTeams", profile.hiring.teams);
  setVal("workMode", profile.hiring.workMode);
  setVal("techStack", profile.hiring.techStack);
  setVal("hiringProcess", profile.hiring.process);

  /* ================= READ-ONLY MODE ================= */
  if (mode === "readonly") {
    document
      .querySelectorAll("input, textarea, select, button")
      .forEach(el => {
        if (el.id !== "logoutBtn") el.disabled = true;
      });

    const saveBtn = document.getElementById("saveRecruiterProfile");
    if (saveBtn) saveBtn.style.display = "none";

    const note = document.createElement("p");
    note.textContent =
      "This recruiter profile is read-only for jobseekers.";
    note.style.color = "#666";
    note.style.marginBottom = "12px";

    document
      .querySelector(".dashboard-content")
      .prepend(note);
  }

  /* ================= SAVE PROFILE (RECRUITER ONLY) ================= */
  const saveBtn = document.getElementById("saveRecruiterProfile");

  if (saveBtn && currentUser.role === "RECRUITER") {
    saveBtn.addEventListener("click", () => {
      profile.recruiterName =
        document.getElementById("recruiterFullName").value.trim();

      profile.recruiterTitle =
        document.getElementById("recruiterTitle").value.trim();

      profile.company = {
        name: document.getElementById("companyName").value.trim(),
        industry: document
          .getElementById("companyIndustry")
          .value.trim(),
        size: document.getElementById("companySize").value,
        location: document
          .getElementById("companyLocation")
          .value.trim(),
        website: document
          .getElementById("companyWebsite")
          .value.trim(),
        description: document
          .getElementById("companyDescription")
          .value.trim()
      };

      profile.hiring = {
        teams: document
          .getElementById("hiringTeams")
          .value.trim(),
        workMode: document.getElementById("workMode").value,
        techStack: document
          .getElementById("techStack")
          .value.trim(),
        process: document
          .getElementById("hiringProcess")
          .value.trim()
      };

      recruiterProfiles[profileIndex] = profile;
      localStorage.setItem(
        "recruiterProfiles",
        JSON.stringify(recruiterProfiles)
      );

      alert("Recruiter profile saved successfully");
    });
  }

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html";
  });
});
