#!/usr/bin/env node

var fs               = require('fs');
var clone            = require('clone');
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
        if (which[key] !== false && src[key] !== undefined)
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

function matchValues(src, dest, which)
{
    for (var key in which)
    {
        if (which[key] !== false && src[key] !== undefined)
        {
            if (which[key] instanceof Object)
            {
                dest[key] = dest[key] || {};
                var ret = matchValues(src[key], dest[key], which[key]);
                if (!ret) return false;
            }
            else
            {
                if (dest[which[key]] === undefined ||
                    JSON.stringify(dest[which[key]]) != JSON.stringify(src[key]))
                {
                    return false;
                }
            }
        }
    }
    return true;
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
            var bowerProject = clone(project);
            if (bowerProject.contributors !== undefined &&
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
    Because YAML files are often formated by hand, pubspec.yaml is not
    overwritten by projectyaml. Instead it is matched againts the project.yaml
    and an error is raised if there are any inaccuracies.
    */
    YAML.load('pubspec.yaml', function(data)
    {
        if (data instanceof Object)
        {
            var pubProject = clone(project);
            var singleAuthor = true;
            if (pubProject.contributors !== undefined &&
                pubProject.contributors.length > 0)
            {
                singleAuthor = false;
                pubProject.contributors.unshift(pubProject.author);
            }

            if (!matchValues(pubProject, data, {
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
            }))
            {
                console.log("pubspec.yaml does not match project.yaml");
                process.exit(1);
            }
        }
    });
});
