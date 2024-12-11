# Branching and Tagging Strategy for Software Releases

## Introduction

Our software development process uses three primary branches (`develop`, `uat`, and `production`) to manage the progression of code changes from development to release. This document outlines our strategy for tagging different versions in each stage, ensuring clear, organized, and version-tracked releases.

## Branch Descriptions

- `develop`: This is the initial development branch where all the new features and non-emergency bug fixes are merged. Each merge can consider incrementing the version's minor or patch number, depending on the change's scope.

- `uat` (User Acceptance Testing): This branch is for pre-releases, a staging area for features that have passed initial testing and are ready for client review.

- `production`: This branch reflects the code that is currently in production or ready to be shipped to production. Only code that has been tested and approved in the previous stages reaches this point.

## Tagging Mechanism

We use a system of semantic versioning to tag our software, with specific conventions for each stage of development.

### Development Stage (`develop` branch)

- Tags indicate incremental changes and are suffixed with a beta version (e.g., `v0.2.0b0`, `v0.2.0b1`, etc.).
- The `b` in the tag indicates a "beta" version, signifying that the features are still in active development and not ready for production.

### User Acceptance Testing Stage (`uat` branch)

- As features are promoted to the `uat` branch, tags signify a release candidate with the `rc` suffix (e.g., `v0.2.0rc0`, `v0.2.0rc1`, etc.).
- The `rc` denotes "release candidate," indicating that the version is potentially shippable to production, pending final testing.

### Production Stage (`production` branch)

- When merging into `production`, the version tag loses all suffixes, marking a final version (e.g., `v0.2.0`).
- This tag indicates that the code is considered stable and tested, representing the actual production release.

## Workflow Summary

1. Developers merge their tested changes into the `develop` branch, tagging the merge with an incremented beta version.
2. After team review and when deemed ready, the `develop` branch is merged into the `uat` branch, initiating user acceptance testing. This merge is tagged as a release candidate.
3. Upon successful UAT, the code is merged into the `production` branch with a production tag, indicating that this codebase represents a stable version of the software.

## Advantages

- **Clarity**: Each tag stage (beta, release candidate, and production) clearly indicates the software's stability level and readiness for the production environment.
- **Traceability**: Developers can easily trace features and bug fixes back to specific versions, thanks to the explicit versioning strategy.
- **Rollback readiness**: In case of issues in production, developers can quickly identify the version to rollback to, ensuring system stability.

## Conclusion

This structured approach to branching and tagging ensures a smooth transition of code from development to production. By adhering to these guidelines, teams maintain an organized, transparent, and efficient release process.
