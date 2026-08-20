// Storage & Synchronized State Service for InfraVision AI (Bengaluru Focus)

const STORAGE_KEY = "infravision_ai_bengaluru_issues_v6";

// Empty initial list
const SEED_ISSUES = [];

export function getStoredIssues() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ISSUES));
    return SEED_ISSUES;
  }
  try {
    return JSON.parse(localData);
  } catch (e) {
    return [];
  }
}

export function saveStoredIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  window.dispatchEvent(new Event("infravision_data_changed"));
}

export function addIssue(newIssue) {
  const current = getStoredIssues();
  // Preserve 100% of all reported issues permanently in database & citizen history
  const updated = [newIssue, ...current];
  saveStoredIssues(updated);
  return updated;
}

export function updateIssueStatus(issueId, updates) {
  const current = getStoredIssues();
  const updated = current.map(item => {
    if (item.id === issueId) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveStoredIssues(updated);
  return updated;
}

export function clearAllIssues() {
  saveStoredIssues([]);
  return [];
}
