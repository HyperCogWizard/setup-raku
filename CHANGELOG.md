# Changelog

## Unreleased

* Validate the `raku-version` input and report available versions when no build matches
* Reuse a previously installed rakudo from the tool cache instead of downloading again
* Handle releases without a build revision when naming the cache directory
* Add `zef-modules` input to install Raku modules with zef
* Add `enable-zef-cache` input to cache the zef module cache between runs
* Add `raku-version` and `raku-path` outputs
* Verify that zef works after setup
* Expand the dogfood workflow to macOS and the `latest` version, and smoke test `raku` and `zef`

## v1.14.0 - 2026-08-06

* Update npm dependencies (https://github.com/Raku/setup-raku/pull/60, https://github.com/Raku/setup-raku/pull/61, https://github.com/Raku/setup-raku/pull/62)

## v1.13.0 - 2026-07-04

* Update npm dependencies and checkout action references (https://github.com/Raku/setup-raku/pull/58)

## v1.12.0 - 2026-06-07

* Update npm dependencies (https://github.com/Raku/setup-raku/pull/55)

## v1.11.0 - 2026-02-28

* Modernize toolchain: deps refresh, esbuild + Vitest (https://github.com/Raku/setup-raku/pull/47)

## v1.10.0 - 2025-08-17

* Use node24 (https://github.com/Raku/setup-raku/pull/42)

## v1.9.0 - 2025-04-14

* Update node module dependencies (https://github.com/Raku/setup-raku/pull/40)

## v1.8.0 - 2024-03-27

* Support macos arm64 (https://github.com/Raku/setup-raku/pull/34)

## v1.7.0 - 2023-09-06

* Use node20 (https://github.com/Raku/setup-raku/pull/29)

## v1.6.0 - 2022-08-19

* Update node module dependencies

## v1.5.0 - 2022-03-25

* Use node16

## v1.4.0 - 2020-12-09

* Show `raku -V`

## v1.3.0 - 2020-11-23

* Show real version in "Downloading rakudo ..." log
* Follow rakudo 2020.11's top directory name change

## v1.2.0 - 2020-10-06

* Update node module dependencies

## v1.1.0 - 2020-07-30

* Change how to select "latest" rakudo

## v1.0.0 - 2020-07-06

* Initial version
