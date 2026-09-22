# setup raku [![](https://github.com/Raku/setup-raku/workflows/test/badge.svg)](https://github.com/Raku/setup-raku/actions)

This action sets up a Raku environment for use in [GitHub Actions](https://docs.github.com/en/actions).

# Usage

See [action.yml](action.yml) for the details.

Basic:

```yaml
jobs:
  raku:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: Raku/setup-raku@v1  # By default, this sets up the latest rakudo
```

Matrix:

```yaml
jobs:
  raku:
    strategy:
      matrix:
        os:
          - ubuntu-latest
          - macos-latest
          - windows-latest
        raku-version:
          - "2020.06"
          - "2020.05.1"
          - "2020.02.1"
          - "2020.01"
          - "2019.11"
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v7
      - uses: Raku/setup-raku@v1
        with:
          raku-version: ${{ matrix.raku-version }}
```

Install Raku modules with zef:

```yaml
      - uses: Raku/setup-raku@v1
        with:
          zef-modules: "Test::META Cro::Core"
```

Cache the zef module cache between runs (keyed on `META6.json`):

```yaml
      - uses: Raku/setup-raku@v1
        with:
          zef-modules: "Test::META Cro::Core"
          enable-zef-cache: "true"
```

Use the resolved version in later steps:

```yaml
      - uses: Raku/setup-raku@v1
        id: raku
      - run: echo "installed raku ${{ steps.raku.outputs.raku-version }} at ${{ steps.raku.outputs.raku-path }}"
```

# Inputs

| Name | Description | Default |
| ---- | ----------- | ------- |
| `raku-version` | Version to use. Examples: `2020.06`, `2020.05.1`, `latest` | `latest` |
| `zef-modules` | Space or comma separated list of Raku modules to install with zef | (none) |
| `enable-zef-cache` | Cache the zef module cache directory between runs | `false` |

# Outputs

| Name | Description |
| ---- | ----------- |
| `raku-version` | The resolved raku version that was installed |
| `raku-path` | Path to the installed rakudo distribution |

# FAQ

## What raku-versions are available?

Try this command:

```console
curl -s https://rakudo.org/dl/rakudo | jq -r '. [] | select( .platform != "src" ) | .ver' | sort -r | uniq
```

# License

MIT
