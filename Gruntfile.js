/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! Fantasy Technology - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* http://ft-ru.ru/\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
      'Vadim Petrov; Licensed MIT */\n\n\n'
    },
    watch: {
      csslive: {
        files: ['public/css/*.css'],
        options: {
          livereload: true
        }
      },
      live: {
        files: ['public/js/*.js', 'public/js/**/*.js', 'views/*.jade', 'views/**/*.jade'],
        options: {
          livereload: true
        }
      },
      stylus: {
        files: ['public/css/*.styl'],
        tasks: 'stylus:compile'
      }
    },
    stylus: {
      compile: {
        options: {
          compress: false
        },
        files: {
          'public/css/admin.css': ['public/css/admin.styl']
        }
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.registerTask('default', ['stylus', 'watch']);

};
