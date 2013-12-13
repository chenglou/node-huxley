'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['**/*.js'],
      options: {
        ignores: ['node_modules/**/*.js'],
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
};
