'use strict';

var excludeLibrariesPattern = '!node_modules/**';
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['**/*.js', excludeLibrariesPattern],
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
        src: ['**/*.js', excludeLibrariesPattern, '!Gruntfile.js'],
        options: {
          breakOnErrors: true,
          errorsOnly: false, // show only maintainability errors
          cyclomatic: [3, 7, 12],
          halstead: [8, 13, 20],
          maintainability: 100
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-complexity');

  grunt.registerTask('default', ['jshint', 'complexity']);
};
