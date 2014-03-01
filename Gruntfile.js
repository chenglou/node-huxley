'use strict';

var spawn = require('child_process').spawn;
var tests = require('./tests');
var excludeLibrariesPattern = '!node_modules/**';
var allJSFilesPattern = '**/*.js';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: [allJSFilesPattern, excludeLibrariesPattern],
      options: {
        bitwise: true,
        camelcase: true,
        devel: true,
        eqeqeq: true,
        eqnull: true,
        globalstrict: true,
        immed: true,
        indent: 2,
        newcap: true,
        noarg: true,
        node: true,
        quotmark: 'single',
        sub: true,
        trailing: true,
        undef: true
      },
    },

    // TODO: get sensitive defaults, if these (taken from grunt-complexity
    // README) aren't
    complexity: {
      generic: {
        src: [allJSFilesPattern, excludeLibrariesPattern, '!Gruntfile.js'],
        options: {
          breakOnErrors: true,
          errorsOnly: false, // show only maintainability errors
          cyclomatic: [3, 7, 12],
          halstead: [8, 13, 20],
          maintainability: 100
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: 'tests/webroot'
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['jshint', 'complexity']);


  grunt.registerTask('testPasses', tests.testPasses);
  grunt.registerTask('testFails', tests.testFails);
  grunt.registerTask('selenium', function(grunt) {
    var done = this.async();
    // this is the same selenium wrapper than in README. It conveniently
    // includes the .jar file and exposes a command to start it
    var selenium = spawn('./node_modules/selenium-server/bin/selenium');
    selenium.stderr.once('data', function() {
      done(false);
    });
    selenium.stdout.once('data', function() {
      done();
    });
  });

  grunt.registerTask(
    'test', ['connect:server', 'selenium', 'testPasses', 'testFails']
  );
  grunt.registerTask(
    'test:passes', ['connect:server', 'selenium', 'testPasses']
  );
  grunt.registerTask(
    'test:fails', ['connect:server', 'selenium', 'testFails']
  );
};
