import toml


def generate_requirements():
    """
    Generate requirements.txt file with direct dependencies from pyproject.toml.
    """
    # Load the pyproject.toml content
    with open('pyproject.toml') as file:  # pylint: disable=unspecified-encoding
        content = toml.load(file)

    # Extract the direct dependencies
    dependencies = content.get('tool', {}).get('poetry', {}).get('dependencies', {})

    # Exclude python version specification
    if 'python' in dependencies:
        del dependencies['python']

    # Write the direct dependencies to requirements.txt
    with open('requirements.txt', 'w') as file:  # pylint: disable=unspecified-encoding
        for package, version in dependencies.items():
            # Handle the case where the version is specified as a dictionary
            if isinstance(version, dict):
                version_str = version.get('version')
                if extras := version.get('extras'):
                    extras_str = ','.join(extras)
                    file.write(f'{package}[{extras_str}]=={version_str}\n')
                else:
                    file.write(f'{package}=={version_str}\n')
            else:
                file.write(f'{package}=={version}\n')

    print('Updated requirements.txt with direct dependencies only!')
