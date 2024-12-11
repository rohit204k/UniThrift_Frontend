## CI/CD Workflow using GitHub Actions

### Overview

Continuous Integration and Continuous Deployment (CI/CD) is an essential practice in modern software development. It ensures that code is integrated, tested, and deployed in a streamlined manner.

### Key Points

1. **GitHub Actions Environment Variables**:
    - GitHub Actions provides built-in environment variables such as `GITHUB_REF`.
    - `GITHUB_REF` indicates the reference that triggered the workflow run (e.g., a branch or a tag).

2. **Tag-based Workflows**:
    - Trigger workflows only when a specific tag is pushed.
    - Useful for release workflows where deployments are tied to versioned tags.

3. **Docker Image Tagging with Git Tags**:
    - Use Git tags as Docker image tags for consistency.
    - It ensures that deployed containers match the exact code version.

4. **Branch Verification**:
    - Ensure that a tag is pushed to a specific branch (e.g., `production`).
    - Adds a safety check to avoid deploying non-production-ready code.

5. **Bash Parameter Expansion in Actions**:
    - Used to extract tag names from `GITHUB_REF` (e.g., `${GITHUB_REF#refs/tags/}`).
    - Allows for versatile string manipulation directly in the CI/CD script.

### Benefits of This Workflow

- **Consistency**: Tying Docker tags to Git tags ensures a 1:1 mapping between deployed code and its version.
- **Safety**: By tying actions to specific branches, accidental deployments from non-production branches can be avoided.
<!-- - **Automation**: Automated testing and deployment ensure quicker feedback loops and faster releases. -->
- **Reproducibility**: Versioned Docker images allow for easy rollback and traceability.
