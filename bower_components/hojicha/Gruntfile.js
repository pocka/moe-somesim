module.exports=function(grunt){
	grunt.initConfig({
		babel:{
			options:{
				presets:['es2015','react']
			},
			dist:{
				files:{}
			}
		},
		sass:{
			options:{
				sourcemap:'none'
			},
			dist:{
				files:{}
			}
		},
		autoprefixer:{
			dist:{
				files:{}
			}
		},
		copy:{
			dist:{
				files:{}
			}
		},
		esteWatch:{
			options:{
				dirs:['src/**/','test/src/**/'],
				livereload:{
					enable:false
				},
				ignoredFiles:['*4913','*.swp','*~','*.swx']
			},
			js:function(path){
				var files={};
				files[path.replace('src','lib')]=path;
				grunt.config(['babel','dist','files'],files);
				return 'babel';
			},
			sass:function(path){
				var files={},copy={},filename,buf,css={},dest=path.replace('src','lib').replace('sass','css');
				files[dest]=path;
				buf=path.split('/');
				filename=buf[buf.length-1];
				copy[path.replace('src','lib').replace(filename,(filename[0]!=='_'?'_':'')+filename)]=path;
				css[dest]=dest;
				grunt.config(['sass','dist','files'],files);
				grunt.config(['copy','dist','files'],copy);
				grunt.config(['autoprefixer','dist','files'],css);
				return ['sass','copy','autoprefixer'];
			},
			md:function(path){
				var files={};
				files[path.replace('src','lib')]=path;
				grunt.config(['copy','dist','files'],files);
				return 'copy';
			}
		}
	});

	grunt.loadNpmTasks('grunt-este-watch');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default',['esteWatch']);
};
