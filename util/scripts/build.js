var browserify = require('browserify')
var program = require('commander')
var fs = require('fs')
var uglifyJs = require('uglify-js')
var through = require('through')

var uglifyJsOptions = {
	mangle: true,
	comment: true,
	compress: {
		dead_code: true,
		conditionals: true,
		comparisons: true,
		evaluate: true,
		booleans: true,
		loops: true,
		join_vars: true,
		if_return: true,
		cascade: true,
		warnings: false,
	}
}

program
	.usage('[options] <input>')
	.option('-v, --verbose', 'Verbose output.')
	.option('-o, --output', 'Output file path. If not specified, it will output to stdout.')
	.option('-c, --compress', 'Compress and uglify output.')
	.parse(process.argv)

var input = program.args[0]

if (!input){
	console.error(program.help())
}

var inputPath = fs.realpathSync(input)

bundle(inputPath).then((_) => {

	var err = _.err, contents = _.contents

	if (err){
		console.error(err.stack || err.message)
		return -1
	}

	console.error('Build Complete !')

	var result = program.compress ? minify(contents) : contents

	var outputPath = program.output ? fs.realpathSync(program.output) : null

	if (!outputPath){
		console.log(result)
	} else {
		fs.writeFileSync(outputPath, result)
	}
}).catch(err => {
	console.error(err)
})

function addDekuElement(file){
	const ext = file.split('.').slice(-1)[0]

	if (ext !== 'tsx'){
		return through()
	}

	var data = 'var $$element=require("deku").element;'

	return through(function write(buffer){
		data += buffer
	}, function end(){
		this.queue(data)
		this.queue(null)
	})
}

function bundle(path){
	return new Promise((resolve, reject) => {
		browserify()
			.plugin('tsify')
			.transform(addDekuElement)
			.transform('babelify', {
				plugins: [
					['transform-react-jsx', {
						pragma: '$$element'
					}]
				],
				extensions: ['.tsx']
			})
			.plugin('bundle-collapser/plugin')
			.add(path)
			.bundle((err, buf) => resolve({ err, contents: (buf || '').toString() }))
	})
}

function minify(code){
	return uglifyJs.minify(code, Object.assign({
		fromString: true
	}, uglifyJsOptions)).code
}
