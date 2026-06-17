// skill-matching.js

// Calculate skill match percentage
function calculateSkillMatch(jobSkills, userSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  if (!userSkills || userSkills.length === 0) return 0;

  const matched = jobSkills.filter(skill =>
    userSkills.includes(skill)
  );

  return Math.round((matched.length / jobSkills.length) * 100);
}

// Rank candidates for a job
function rankCandidates(job, applications, users) {
  const ranked = [];

  applications
    .filter(app => app.jobId === job.id)
    .forEach(app => {
      const user = users.find(u => u.id === app.jobseekerId);
      if (!user) return;

      const userSkillNames = (user.skills || []).map(s => s.name);

      const matchPercent = calculateSkillMatch(
        job.requiredSkills,
        userSkillNames
      );

      ranked.push({
        userId: user.id,
        name: user.name,
        matchPercent,
        status: matchPercent >= 75 ? "SHORTLISTED" : "APPLIED"
      });
    });

  // sort descending
  ranked.sort((a, b) => b.matchPercent - a.matchPercent);

  return ranked;
}
