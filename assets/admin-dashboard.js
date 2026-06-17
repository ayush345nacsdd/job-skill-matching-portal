document.addEventListener("DOMContentLoaded", () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
  const applications = JSON.parse(localStorage.getItem("applications")) || [];

  // ================= STATS =================
  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const totalApplications = applications.length;

  document.getElementById("totalUsers").textContent = totalUsers;
  document.getElementById("totalJobs").textContent = totalJobs;
  document.getElementById("totalApplications").textContent = totalApplications;

  // ================= USER DISTRIBUTION =================
  const jobSeekers = users.filter(u => u.role === "JOBSEEKER").length;
  const recruiters = users.filter(u => u.role === "RECRUITER").length;

  const maxUsers = Math.max(jobSeekers, recruiters, 1);

  const jobSeekerBar = document.getElementById("jobSeekerBar");
  const recruiterBar = document.getElementById("recruiterBar");

  jobSeekerBar.textContent = jobSeekers;
  recruiterBar.textContent = recruiters;

  jobSeekerBar.style.width = `${(jobSeekers / maxUsers) * 100}%`;
  recruiterBar.style.width = `${(recruiters / maxUsers) * 100}%`;

  // ================= JOBS VS APPLICATIONS =================
  const maxJA = Math.max(totalJobs, totalApplications, 1);

  const jobsBar = document.getElementById("jobsBar");
  const applicationsBar = document.getElementById("applicationsBar");

  jobsBar.textContent = totalJobs;
  applicationsBar.textContent = totalApplications;

  jobsBar.style.width = `${(totalJobs / maxJA) * 100}%`;
  applicationsBar.style.width = `${(totalApplications / maxJA) * 100}%`;

  // ================= USER TABLE =================
  const userTableBody = document.getElementById("userTableBody");
  userTableBody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
    `;
    userTableBody.appendChild(tr);
  });

  // ================= JOB TABLE =================
  const jobTableBody = document.getElementById("jobTableBody");
  jobTableBody.innerHTML = "";

  jobs.forEach(job => {
    const recruiter = users.find(u => u.id === job.recruiterId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${job.id}</td>
      <td>${job.title}</td>
      <td>${recruiter ? recruiter.name : "Unknown"}</td>
      <td><span class="status active">Active</span></td>
    `;
    jobTableBody.appendChild(tr);
  });
});
