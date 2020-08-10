module.exports = function spagoPursSourcesToPursAndJs(spagoPursSources) {
  const spagoSourcesArrayWithSpagoJs = spagoPursSources.map(x => x.replace(/.purs$/, '.js'))

  const pursAndJs = spagoPursSources.concat(spagoSourcesArrayWithSpagoJs)

  return pursAndJs
}
