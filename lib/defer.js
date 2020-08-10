// https://github.com/purescript/purescript-lazy/blob/5bbd04f507a704f39aa756b5e12ed6665205fe2e/src/Data/Lazy.js#L3
module.exports = function defer(thunk) {
  let v = null;
  return function() {
    if (thunk === undefined) return v;

    v = thunk();
    thunk = undefined; // eslint-disable-line no-param-reassign
    return v;
  };
};
