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
    src: {
      type: 'array',
      items: { type: 'string' },
    },
  },
}

const pluginName = 'webpack-spago-loader'

function parseOpitons(options) {
  validateOptions(schema, options, pluginName)

  const output = options.output ? options.output : getOutputDirFromSpago()
  const src = (options.src && options.src.length !== 0) ? options.src : getSourcesFromSpago()
  const compiler = options.compiler ? options.compiler : 'purs'
  const compilerOptions = options.compilerOptions ? options.compilerOptions : {}

  ////

  let compilerArgsWithoutSrc = null
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

    compilerArgsWithoutSrc = [].concat(['compile'], compilerArgsArrayDargs)
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

    compilerArgsWithoutSrc = compilerArgsArrayDargs
  } else {
    throw new Error(`[${pluginName}] unknown compiler, should be psa or purs ${compiler}`)
  }

  const compilerArgsArray = [].concat(compilerArgsWithoutSrc, src)

  ////

  const filesToCompile = spagoPursSourcesToPursAndJs(src)

  return { compiler, compilerArgsArray, filesToCompile }
}

module.exports = parseOpitons
