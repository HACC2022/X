let React,forwardRef;module.link('react',{default(v){React=v},forwardRef(v){forwardRef=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);var _excluded = ["color", "size", "title"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var FiletypePptx = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var color = _ref.color,
      size = _ref.size,
      title = _ref.title,
      rest = _objectWithoutProperties(_ref, _excluded);

  return /*#__PURE__*/React.createElement("svg", _extends({
    ref: ref,
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    width: size,
    height: size,
    fill: color
  }, rest), title ? /*#__PURE__*/React.createElement("title", null, title) : null, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.5 11.85h1.6c.289 0 .533.06.732.179.201.117.355.276.46.477.105.201.158.427.158.677 0 .25-.054.476-.16.677-.106.199-.26.357-.464.474a1.452 1.452 0 0 1-.732.173H2.29v1.342H1.5V11.85Zm2.06 1.714a.795.795 0 0 0 .085-.381c0-.226-.062-.4-.185-.521-.123-.122-.294-.182-.513-.182h-.659v1.406h.66a.794.794 0 0 0 .374-.082.574.574 0 0 0 .238-.24Zm1.302-1.714h1.6c.289 0 .533.06.732.179.201.117.355.276.46.477.106.201.158.427.158.677 0 .25-.053.476-.16.677-.106.199-.26.357-.464.474a1.452 1.452 0 0 1-.732.173h-.803v1.342h-.79V11.85Zm2.06 1.714a.795.795 0 0 0 .085-.381c0-.226-.062-.4-.185-.521-.123-.122-.294-.182-.513-.182H5.65v1.406h.66a.793.793 0 0 0 .374-.082.574.574 0 0 0 .238-.24Zm2.852 2.285v-3.337h1.137v-.662H7.846v.662H8.98v3.337h.794Zm3.796-3.999h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415h-.861l1.24-2.016-1.228-1.983h.931l.832 1.439h.035l.824-1.439Z"
  }));
});
FiletypePptx.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};
FiletypePptx.defaultProps = {
  color: 'currentColor',
  size: '1em',
  title: null
};
module.exportDefault(FiletypePptx);