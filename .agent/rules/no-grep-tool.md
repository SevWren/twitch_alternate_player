---
trigger: always_on
---

# No Grep on Windows

**Rule:** Do not use the `grep` command.
**Reason:** It is not supported on the user's Windows system.
**Alternative:** Use `findstr` (native Windows) or the `grep_search` tool provided in the toolkit.