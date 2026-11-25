# Releasing

Releases are made by [release-please](https://github.com/googleapis/release-please) and
staged on npm by GitHub Actions (`.github/workflows/release-please.yml`). A staged package
becomes installable after a package owner approves it with 2FA
([staged publishing](https://docs.npmjs.com/staged-publishing)).
Nobody publishes from a local machine.

## One-time setup

- **npm Trusted Publisher.** On npmjs.com: package `@kinescope/player-iframe-api-loader` →
  Settings → Trusted Publisher → GitHub Actions:
  - organization: `kinescope`
  - repository: `player-iframe-api-loader`
  - workflow filename: `release-please.yml`
  - allowed actions: leave only `npm stage publish` (always on). Do **not** enable
    `npm publish` or `npm dist-tag`: the workflow only stages, the tag is set when staging.

  If the values do not match the workflow run exactly, staging fails with `E404`.
  After the first successful release remove the old `NPM_TOKEN` repository secret
  and, in the package settings, disallow publishing with tokens.

- **2FA** for the owners who approve releases; approving needs npm CLI >= 11.15.0
  if done from the command line.

## Release

1. Merge changes into `main` with [Conventional Commits](https://www.conventionalcommits.org/)
   messages (`fix:`, `feat:`, `BREAKING CHANGE:` in the body). CI must be green.

   release-please keeps a release PR open. It bumps the version and adds a `CHANGELOG.md`
   section from the commits. While the version is `0.x`, a breaking change bumps the minor
   version (`bump-minor-pre-major`). Edit the PR if the changelog needs it.

2. Merge the release PR. release-please creates the tag `vX.Y.Z` and the GitHub Release.
   The workflow then:
   - builds and checks the package in the `build` job: lint, typecheck, tests, build,
     publint and are-the-types-wrong;
   - stages the tarball in the `stage` job, with `latest`, or `next` for a version with a
     prerelease part.

3. Approve the staged package. The stage id is in the summary of the workflow run.
   - npmjs.com → the package → **Staged Packages** → **Approve** (asks for 2FA), or
   - `npm stage approve <stage-id>` (asks for 2FA).

   Before approving you can inspect it: `npm stage view <stage-id>`,
   `npm stage download <stage-id>`. A wrong package: `npm stage reject <stage-id>`.

4. Check the result: `npm view @kinescope/player-iframe-api-loader dist-tags`, and the
   provenance badge on the npm package page.

## If publishing fails

Nothing is published until a staged package is approved.

- The cause is outside the repository (e.g. Trusted Publisher settings): fix it and
  re-run the failed jobs of the workflow run. A staged but rejected package can be staged
  again the same way.
- The fix needs a new commit: delete the GitHub Release and its tag, fix in `main`, and
  let release-please create the release again. The same version can be reused only if it
  has not reached npm: a version published to npm can never be published again, even after
  unpublishing.
