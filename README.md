One project.yaml to rule them all!
==================================
This command-line tool provides the ability to define project information such
as the project name, version, description and license only once in a
project.yaml. Running the `projectyaml` command will sync these values with
other configuration files such as `package.json`, `bower.json` and
`pubspec.yaml`. This is a fail-silent tool.

Install
-------
```
npm install --global project.yaml
```

Use
---
```
projectyaml
```

Supported values
----------------
```
name:        My Project
version:     1.0.0
copyright:   2015
author:      John Doe
contributors:
    - Joe Bloggs
    - Joe Bloggs <joe@bloggs.com>
    - Joe Bloggs <joe@bloggs.com> (http://joebloggs.com)
description: Awesome project!
license:     AGPL-3.0
category:    Science
homepage:    http://example.com
repository:
    type:    git
    url:     https://github.com/username/repository.git
bugs:
    url:     https://github.com/username/repository/issues
    email:   bugs@example.com
```

Notes
-----
- The `author` will be recognized as primary author and maintainer and should
  not be repeated in the contributors array.

Supported third-party files
---------------------------
- [package.json](https://docs.npmjs.com/files/package.json)
- [bower.json](https://github.com/bower/spec/blob/master/json.md)
- [pubspec.yaml](https://www.dartlang.org/tools/pub/pubspec.html)
