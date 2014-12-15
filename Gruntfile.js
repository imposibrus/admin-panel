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
      }/*,*/
      //clientjade: {
      //  files: ['views/*.jade', 'views/**/*.jade'],
      //  tasks: 'clientjade:compile'
      //}
    },
    stylus: {
      compile: {
        options: {
          compress: false
        },
        files: {
          'public/css/main.css': ['public/css/main.styl'],
          'public/css/admin.css': ['public/css/admin.styl']
        }
      }
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
  grunt.registerTask('default', ['stylus', 'watch']);

};
