# NBL SYSTEM CODES

This document is for people working inside the New Beansland codebase.

The public website has residents and public offices. The code underneath the website uses a second layer of NBL names. These are **internal architecture codenames**, not a second public character roster.

If you see one of these names in code, do not replace it with a generic label until you understand the responsibility it represents.

## BEANS

**BEANS** is the umbrella vocabulary for the site's internal NBL architecture. Individual systems below describe a specific responsibility.

| Code | Internal responsibility | Plain-language equivalent |
| --- | --- | --- |
| LOCKE | Keeps boundaries, doors, exits and language honest. | access / navigation / boundary handling |
| STILL | Keeps the visual record of what has been seen. | visual archive / media record |
| TA | Checks claims against the record and follows the rails. | verification / provenance / audit |
| TB | Builds, tests, organizes and protects working systems. | implementation / system assembly |
| TEST | Separates fact, metaphor, memory and mythology before assumptions harden. | continuity / reasoning check |
| TS | Records, preserves, continues and remembers. | archive / history / continuity record |
| NTB | Carries the signal outward while keeping the front door open. | delivery / outward communication |
| ECHO | Remembers, connects and builds across systems. | integration / continuity bridge |
| TM | Tests rules, edge cases, wording and unintended consequences. | rules / policy / exception testing |

## Important distinction

TM is also the code shorthand for **Tobias “T.M.” Mansfield, Rules Examiner**. He is a public New Beansland resident. The other internal codes are not automatically public website personnel.

Do not expose internal architecture simply because it exists in the code.

## Working rule

Public visitors should experience New Beansland.

Developers should be able to inspect the code and understand why a system has an NBL name.

The code name is not decoration. It should map to a real responsibility.

**PLAYHOUSE THINKS. FOUNDER DECIDES. PRODUCTION PUBLISHES.**
