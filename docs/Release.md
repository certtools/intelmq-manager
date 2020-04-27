# Release procedure

Make sure the current state is really final ;)
You can test most of the steps described here locally before doing it real.

Assumption: You are working on branch maintenance, the next version is a bug fix release. For feature releaese it is slightly different.

## Documentation

 * CHANGELOG.MD and
 * NEWS.MD: Update the latest header, fix the order and remove empty sections if necessary.
 * `intelmq-manager/php/config.php` and `debian/patches/fix-paths.patch`: Update the version.
 * `debian/changelog`: Insert a new section for the new version with the tool `dch`.

## Commit
Commit your changes, the message should start with `REL: `. Push and create a pull request from maintenance to master. Someone else should review the changes. Eventually fix them, make sure the `REL: ` is the last commit, you can also push that one at last, after the reviews.

## Tag and release

Tag the commit with `git tag -s version HEAD`, merge it into master, push the both branches *and* the tag. The tag is just `a.b.c`, not prefixed with `v` (that was necessary only with SVN a long time ago...).

Go to https://github.com/certtools/intelmq-manager/tags and enter the release notes (changelog) for the new tag, then it's considered a release by github.

## Packages
We are currently using the public Open Build Service instance of openSUSE: http://build.opensuse.org/project/show/home:sebix:intelmq

First, test all the steps first with the [unstable-repository](http://build.opensuse.org/project/show/home:sebix:intelmq:unstable) and check that at least installations succeed.

 * Create the tarballs with the script `create-archives.sh`.
 * Update the dsc and spec files for new filenames and versions.
 * Update the .changes file
 * Build locally for all distributions.
 * Commit.

## Announcements

Announce the new version at the mailinglists intelmq-users, intelmq-dev.
For bigger releases, probably also at IHAP, Twitter, etc. Ask your favorite social media consultant.

## Prepare new version

Increase the version in `intelmq-manager/php/config.php` and declare it as alpha version.

Add a new empty changelog section:

```
### Backend

### Pages

#### Landing page

#### Configuration

#### Management

#### Monitor

#### Check

### Documentation

### Third-party libraries

### Packaging

### Known issues
```

And an empty section in the NEWS file.
