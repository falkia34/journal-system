# Roles & Permissions

## Role Definitions

| Role | Description |
|------|-------------|
| **Administrator** | System management: journals, issues, users, all submissions |
| **Editor** | Editorial workflow: manage submissions, assign reviewers, make decisions |
| **Reviewer** | Peer review: view assigned submissions, write feedback |
| **Author** | Submit articles: create/manage own submissions, view feedback |

## Permission Matrix

### Journals

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| List all journals | ✅ | ✅ | 👁️ | 👁️ |
| View journal detail | ✅ | ✅ | 👁️ | 👁️ |
| Create journal | ✅ | ❌ | ❌ | ❌ |
| Update journal | ✅ | ❌ | ❌ | ❌ |
| Delete journal | ✅ | ❌ | ❌ | ❌ |

### Issues

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| List issues | ✅ | ✅ | ❌ | ❌ |
| View issue | ✅ | ✅ | ❌ | ❌ |
| Create issue | ✅ | ✅ | ❌ | ❌ |
| Update issue | ✅ | ✅ | ❌ | ❌ |
| Delete issue | ✅ | ❌ | ❌ | ❌ |

### Submissions

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| List all submissions | ✅ | ✅ | assigned only | own only |
| View submission | ✅ | ✅ | assigned | own |
| Create submission | ❌ | ❌ | ❌ | ✅ |
| Update submission | ✅ | ❌ | ❌ | own (Draft) |
| Delete submission | ✅ | ❌ | ❌ | own (Draft) |
| Withdraw submission | ❌ | ❌ | ❌ | own |

### Revisions

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| View revisions | ✅ | ✅ | assigned | own |
| Submit revision | ❌ | ❌ | ❌ | ✅ |
| Update revision stage | ❌ | ✅ | ❌ | ❌ |

### Decisions

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| View decision | ✅ | ✅ | ❌ | own |
| Create decision | ❌ | ✅ | ❌ | ❌ |

### Feedback

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| View feedback | ✅ | ✅ | own | own submission |
| Create feedback | ❌ | ❌ | ✅ | ❌ |
| Update feedback | ❌ | ❌ | own | ❌ |
| Delete feedback | ❌ | ❌ | own (draft) | ❌ |

### Participants

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| View participants | ✅ | ✅ | ❌ | ❌ |
| Assign participant | ❌ | ✅ | ❌ | ❌ |
| Remove participant | ❌ | ✅ | ❌ | ❌ |

### Publications

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| View publications | ✅ | ✅ | ❌ | ❌ |
| Create publication | ✅ | ✅ | ❌ | ❌ |
| Update publication | ✅ | ✅ | ❌ | ❌ |
| Delete publication | ✅ | ❌ | ❌ | ❌ |

### Users

| Action | Administrator | Editor | Reviewer | Author |
|--------|:---:|:---:|:---:|:---:|
| List users | ✅ | ❌ | ❌ | ❌ |
| View user | ✅ | ❌ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ | ❌ |
| Update user | ✅ | ❌ | ❌ | own profile |
| Delete user | ✅ | ❌ | ❌ | ❌ |

✅ = Full access | 👁️ = Read-only | ❌ = No access | "own" = Only own resources

## Role Selector

Users with multiple roles see a **role selector** in the navbar. Selecting a role:

1. Sets `activeRole` in the Zustand store
2. Navigates to the role's root route (`/admin`, `/editor`, `/reviewer`, `/author`)
3. Updates the sidebar menu to show the active role's navigation items

The active role persists across navigation within the same route group.
