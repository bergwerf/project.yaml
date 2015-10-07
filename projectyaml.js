#!/usr/bin/env node

var fs               = require('fs');
var YAML             = require('yamljs');
var commandLineArgs  = require("command-line-args");

var cli = commandLineArgs([
    {
        name: "indent",
        type: Number
    }
]);

var options = cli.parse();
options.indent = (options.indent !== undefined) ? options.indent : 2;
var indent = options.indent == 0 ? '\t' : Array(options.indent + 1).join(' ');

/*
Full which object:
```
{
    name:          'name',
    version:       'version',
    copyright:     'copyright',
    author:        'author',
    contributors:  'contributors'
    description:   'description',
    license:       'license',
    category:      'category',
    homepage:      'homepage',
    repository: {
        type:      'type',
        url:       'url'
    },
    bugs: {
        url:       'url',
        email:     'email'
    }
}
```
*/
function copyValues(src, dest, which)
{
    for (var key in which)
    {
        if (which[key] !== false && src[key])
        {
            if (which[key] instanceof Object)
            {
                dest[key] = dest[key] || {};
                copyValues(src[key], dest[key], which[key]);
            }
            else
            {
                dest[which[key]] = src[key];
            }
        }
    }
}

YAML.load('project.yaml', function(project)
{
    if (!(project instanceof Object))
    {
        return;
    }

    /*
    package.json
    */
    fs.readFile('package.json', function (err, buffer)
    {
        if (!err)
        {
            var data = JSON.parse(buffer);
            copyValues(project, data, {
                name:         'name',
                version:      'version',
                copyright:    false,
                author:       'author',
                contributors: 'contributors',
                description:  'description',
                license:      'license',
                category:     false,
                homepage:     'homepage',
                repository: {
                    type:     'type',
                    url:      'url'
                },
                bugs: {
                    url:      'url',
                    email:    'email'
                }
            });
            fs.writeFile('package.json', new Buffer(JSON.stringify(data, null,
                indent) + '\n', 'utf8'));
        }
    });

    /*
    bower.json
    */
    fs.readFile('bower.json', function (err, buffer)
    {
        if (!err)
        {
            var data = JSON.parse(buffer);
            var bowerProject = project;
            if (bowerProject.contributors &&
                bowerProject.contributors.length > 0)
            {
                bowerProject.contributors.unshift(bowerProject.author);
            }
            copyValues(bowerProject, data, {
                name:         'name',
                version:      false,
                copyright:    false,
                author:       false,
                contributors: 'authors',
                description:  'description',
                license:      'license',
                category:     false,
                homepage:     'homepage',
                repository: {
                    type:     'type',
                    url:      'url'
                },
                bugs:         false
            });
            fs.writeFile('bower.json', new Buffer(JSON.stringify(data, null,
                indent) + '\n', 'utf8'));
        }
    });

    /*
    pubspec.yaml
    */
    YAML.load('pubspec.yaml', function(data)
    {
        if (data instanceof Object)
        {
            var pubProject = project;
            var singleAuthor = true;
            if (pubProject.contributors &&
                pubProject.contributors.length > 0)
            {
                singleAuthor = false;
                pubProject.contributors.unshift(pubProject.author);
            }

            copyValues(pubProject, data, {
                name:         'name',
                version:      'version',
                copyright:    false,
                author:       singleAuthor ? 'author' : false,
                contributors: singleAuthor ? false : 'authors',
                description:  'description',
                license:      false,
                category:     false,
                homepage:     'homepage',
                repository:   false,
                bugs:         false
            });
            fs.writeFile('pubspec.yaml', new Buffer(YAML.stringify(data, null,
                indent) + '\n', 'utf8'));
        }
    });
});
