module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        connect: {
            all: {
                options: {
                    port: 3000,
                    base: 'build',
                    hostname: "localhost",
                    keepalive: true
                }
            }
        },
        open: {
            all: {
                path: 'http://localhost:<%= connect.all.options.port%>'
            }
        },
        bower_concat: {
            all: {
                dest: 'src/js/_bower.js',
                cssDest: 'src/css/_bower.css',
                bowerOptions: {
                    relative: false
                },
                mainFiles: {
                    bootstrap: [
                        'dist/css/bootstrap.css',
                        'dist/css/bootstrap-theme.css',
                        'dist/js/bootstrap.js',
                        
                    ]
                }
            }
        },
        concat: {
            main: {
                src: [
                    'src/js/Alert.js',
                    'src/js/TreeNodeView.js',
                    'src/js/TreeNode.js',
                    'src/js/TreeView.js',
                    'src/js/VM.js',
                    'src/js/script.js'
                ],
                dest: 'src/js/scripts.js'
            },
            dev: {
                src: [
                    'src/js/Alert.js',
                    'src/js/TreeNodeView.js',
                    'src/js/TreeNode.js',
                    'src/js/TreeView.js',
                    'src/js/VM.js',
                    'src/js/script.js'
                ],
                dest: 'tests/js/scripts.js'
            }
        },
        uglify: {
            main: {
                files: {
                    'build/js/scripts.min.js': '<%= concat.main.dest %>',
                    'build/js/_bower.min.js': '<%= bower_concat.all.dest %>'
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'src/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'build/css',
                    ext: '.min.css'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'bower_components/bootstrap/dist/fonts/', src: ['**'], dest: 'build/fonts/', filter: 'isFile'}
                ]
            },
            dev: {
                files: [
                    {expand: true, cwd: 'src/tests/', src: ['tests.js'], dest: 'tests/js/', filter: 'isFile'},
                    {expand: true, cwd: 'src/js/', src: ['_bower.js'], dest: 'tests/js/', filter: 'isFile'},
                    {expand: true, cwd: 'bower_components/qunit/qunit/', src: ['**'], dest: 'tests/qunit/', filter: 'isFile'}
                ]
            }
        }
    });
    
    grunt.registerTask('build_dev', [
        'bower_concat',
        'concat:dev',
        'copy:dev'
    ]);
    
    grunt.registerTask('build', [
        'build_dev',
        'copy:main',
        'concat:main',
        'cssmin',
        'uglify'

    ]);

    grunt.registerTask('start-server', [
        'build',
        'open',
        'connect'
    ]);
};