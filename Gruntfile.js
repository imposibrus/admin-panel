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
      }/*,*/
      //clientjade: {
      //  files: ['views/*.jade', 'views/**/*.jade'],
      //  tasks: 'clientjade:compile'
      //}
    }/*,
    clientjade: {
      compile: {
        src: [
          'views/index.jade',
          'views/users.jade',
          'views/navigation.jade',
          'views/search.jade'
        ],
        dest: 'public/js/templates.js'
      }
    }*/

  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  //grunt.loadNpmTasks('clientjade');
  grunt.registerTask('default', ['watch']);

};
