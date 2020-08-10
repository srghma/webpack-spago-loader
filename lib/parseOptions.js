const validateOptions = require('schema-utils')
const dargs = require('dargs')

// schema for options object
const schema = {
  type: 'object',
  properties: {
    // e.g. psa or purs
    compiler: {
      type: 'string',
    },
    // e.g. { censorCodes: 'ShadowedName,ImplicitImport,MissingTypeDeclaration', strict: true }
    compilerOptions: {
      type: 'object',
    },
    // e.g. output
    output: {
      type: 'string',
      minLength: 1,
    },
    // e.g. [] or ['src/**/*.purs']
    pursFiles: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
  },
}

const pluginName = 'webpack-spago-loader'

module.exports = function parseOpitons(options) {
  validateOptions(schema, options, pluginName)

  const output = options.output
  const pursFiles = options.pursFiles
  const compiler = options.compiler ? options.compiler : 'purs'
  const compilerOptions = options.compilerOptions ? options.compilerOptions : {}

  ////

  let compilerArgs = null
  if (compiler.endsWith('purs')) {
    // purs compile --output output <files.purs>

    const compilerArgsArrayDargs = dargs(
      Object.assign(
        {
          output: output,
        },
        compilerOptions
      ),
      { ignoreFalse: true }
    )

    compilerArgs = [].concat(['compile'], compilerArgsArrayDargs)
  } else if (compiler.endsWith('psa')) {
    // psa --filter-codes=CODES --output output <files.purs>

    const compilerArgsArrayDargs = dargs(
      Object.assign(
        {
          output: output,
        },
        compilerOptions
      ),
      { ignoreFalse: true }
    )

    compilerArgs = compilerArgsArrayDargs
  } else {
    throw new Error(`[${pluginName}] unknown compiler, should be psa or purs ${compiler}`)
  }

  const pursAndJsFiles = require('./spagoPursSourcesToPursAndJs')(pursFiles)

  return { compiler, compilerArgs, pursFiles, pursAndJsFiles }
}
