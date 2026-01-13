# Copilot Instructions

## Commit Message Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format using the Angular preset:

```text
<type>[(optional scope)]: <summary>

[optional body]

[optional footer]
```

### Commit Types

Use the following commit types:

| Type | Description | Release Type | Changelog Section |
| -- | -- | -- | -- |
| `feat` | A new feature | Minor | Features |
| `fix` | A bug fix | Patch | Bug Fixes |
| `docs` | Documentation updates | Patch | Documentation |
| `style` | Changes to the appearance of the project/UI | Patch | Styles |
| `deps` | A dependency update | Patch | Dependencies |
| `chore` | Any sort of change that does not affect the deployed project | None | N/A |
| `ci` | Changes to CI configuration files and scripts | None | N/A |
| `perf` | A code change that improves performance | None | N/A |
| `refactor` | A code change that neither fixes a bug nor adds a feature | None | N/A |
| `test` | Adding missing tests or correcting existing tests | None | N/A |

### Commit Summary Guidelines

- Use imperative, present tense ("fix" not "fixed" or "fixes")
- Use lowercase (do not capitalize the first word)
- Do not use punctuation at the end
- Keep it concise and descriptive

### Examples

Good commit messages:
```text
fix: return empty string for null date values
feat(search): add autocomplete to search input
docs: update installation instructions
test: add tests for date formatting
chore: remove unused dependencies
ci: update GitHub Actions workflow
```

Bad commit messages:
```text
Fix null dates
Fixed the bug
Update stuff
WIP
Initial commit
```

### Scope

Scopes are optional and provide context. Use them when changes are isolated to a specific area:

```text
feat(app): add new app feature
fix(api): correct endpoint validation
test(utils): add date formatting tests
```

## Reference

For more details, see the [release-composite-action README](https://github.com/agrc/release-composite-action/blob/main/README.md#commits).
