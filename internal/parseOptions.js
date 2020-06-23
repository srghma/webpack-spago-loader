const validateOptions = require('schema-utils')
const dargs = require('dargs')
const { spagoPursSourcesToPursAndJs, getOutputDirFromSpago, getSourcesFromSpago } = require('./lib')

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
    },
    // e.g. [] or ['src/**/*.purs']
    pursFiles: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

const pluginName = 'webpack-spago-loader'

function parseOpitons(options) {
  validateOptions(schema, options, pluginName)

  const output = options.output ? options.output : getOutputDirFromSpago()
  const pursFiles = (options.pursFiles && options.pursFiles.length !== 0) ? options.pursFiles : getSourcesFromSpago()
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

  const pursAndJsFiles = spagoPursSourcesToPursAndJs(pursFiles)

  return { compiler, compilerArgs, pursFiles, pursAndJsFiles }
}

module.exports = parseOpitons
