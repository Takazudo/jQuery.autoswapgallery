module.exports = (grunt) ->
  
  grunt.task.loadTasks 'gruntcomponents/tasks'
  grunt.task.loadNpmTasks 'grunt-contrib-coffee'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'

  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')
    banner: """
/*! <%= pkg.name %> (<%= pkg.repository.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 * License: MIT */

"""

    growl:

      ok:
        title: 'COMPLETE!!'
        msg: '＼(^o^)／'

    coffee:

      autoswapgallery:
        src: [ 'jquery.autoswapgallery.coffee' ]
        dest: 'jquery.autoswapgallery.js'

    concat:

      banner:
        options:
          banner: '<%= banner %>'
        src: [ '<%= coffee.autoswapgallery.dest %>' ]
        dest: '<%= coffee.autoswapgallery.dest %>'
        
    uglify:

      options:
        banner: '<%= banner %>'
      autoswapgallery:
        src: '<%= concat.banner.dest %>'
        dest: 'jquery.autoswapgallery.min.js'

    watch:

      autoswapgallery:
        files: '<%= coffee.autoswapgallery.src %>'
        tasks: [
          'default'
        ]

  grunt.registerTask 'default', [
    'coffee'
    'concat'
    'uglify'
    'growl:ok'
  ]

