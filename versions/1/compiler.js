var fs = require('fs'),
	compiler = exports,
	uniqueId = 0,
	referenceTable = {}

function unique(name) { return '_u' + (uniqueId++) + (name ? '_' + name : '') }

function boxComment(msg) {
	var arr = []
	arr.length = msg.length + 2
	return '/*' + arr.join('*') + "**\n"
		+ ' * ' + msg + " *\n"
		+ ' *' + arr.join('*') + "**/\n"
}

compiler.compile = function(ast) {
	return "(function(){\n"
		+ boxComment("Fun compiled at " + new Date().getTime())
		+ "\n\n" + boxComment("lib.js") + fs.readFileSync(__dirname + '/lib.js')
		+ "\n\n" + boxComment("compiled output") + compile(ast)
		+ "\n})();"
}

function compile(ast) {
	if (ast instanceof Array) {
		return parseExpressions(ast)
	} else if (typeof ast == 'object') {
		return parseExpression(ast)
	}
}

function parseExpressions(ast) {
	var result = ''
	for (var i=0; i<ast.length; i++) {
		result += compile(ast[i]) + ";\n"
	}
	return result
}

function parseExpression(ast) {
	switch (ast.type) {
		case 'STRING':
			return '"' + ast.value + '"'
		case 'NUMBER':
			return ast.value
		case 'DECLARATION':
			if (referenceTable[ast.name]) {
				throw { type: 'Repeat Declaration', name: ast.name }
			}
			var id = unique(ast.name),
				reference = ast.value
			
			referenceTable[ast.name] = { id: id, reference: reference }
			return ['var', id, '=', compile(reference)].join(' ')
		case 'REFERENCE':
			if (!referenceTable[ast.name]) {
				throw { type: 'Undeclared Reference', name: ast.name }
			}
			var name = ast.name,
				reference = referenceTable[ast.name]
			
			return addToDom(reference.id)
		case 'INLINE_VALUE':
			return addToDom(parseExpression(ast.value))
	}
}

function addToDom(val) {
	return ";(function(){ var hook=fun.getDomHook(); hook.innerHTML=" + val + "; })()"
}
