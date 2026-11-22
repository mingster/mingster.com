# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the labels this repo uses. The full set (state, P0 to P3, size, role, hold and status labels) is in `~/dotfiles/docs/agents/labels.md`.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `blocked`            | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `owner`              | Requires the owner                       |
| `wontfix`                  | (close the issue)    | Will not be actioned                     |

Every open issue carries one state label (or a hold label) and one P label; P2 is the default.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.
