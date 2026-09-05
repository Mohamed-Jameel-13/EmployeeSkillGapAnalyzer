// Proficiency level mapping (Exact 1-5 scale from project specification)
export const PROFICIENCY_LEVELS = {
  1: { label: "Beginner", level: 1, color: "emerald" },
  2: { label: "Basic", level: 2, color: "blue" },
  3: { label: "Intermediate", level: 3, color: "indigo" },
  4: { label: "Advanced", level: 4, color: "purple" },
  5: { label: "Expert", level: 5, color: "amber" }
};

export function getProficiencyLabel(level) {
  const num = parseInt(level, 10);
  return PROFICIENCY_LEVELS[num]?.label || "Beginner";
}

export function isValidProficiency(level) {
  const num = parseInt(level, 10);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}