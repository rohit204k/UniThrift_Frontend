import subprocess


def release_dev():
    """Release beta version. For DEV environment"""

    cmd1 = ['cz', 'bump', '-pr', 'beta']
    cmd2 = ['git', 'push', '--follow-tags']
    # Run the bump command
    subprocess.run(cmd1, check=True)
    subprocess.run(cmd2, check=True)


def release_uat():
    """Release release candidate version. For UAT environment."""

    cmd1 = ['cz', 'bump', '-pr', 'rc']
    cmd2 = ['git', 'push', '--follow-tags']
    # Run the bump command
    subprocess.run(cmd1, check=True)
    subprocess.run(cmd2, check=True)


def release_prod():
    """Release production version. For PROD environment."""

    cmd1 = ['cz', 'bump']
    cmd2 = ['git', 'push', '--follow-tags']
    # Run the bump command
    subprocess.run(cmd1, check=True)
    subprocess.run(cmd2, check=True)
