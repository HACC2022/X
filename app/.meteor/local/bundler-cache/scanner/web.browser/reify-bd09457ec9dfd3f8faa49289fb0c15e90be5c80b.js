let React,forwardRef;module.link('react',{default(v){React=v},forwardRef(v){forwardRef=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);var _excluded = ["color", "size", "title"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var EnvelopeOpenHeart = /*#__PURE__*/forwardRef(function (_ref, ref) {
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
    d: "M8.47 1.318a1 1 0 0 0-.94 0l-6 3.2A1 1 0 0 0 1 5.4v.817l3.235 1.94a2.76 2.76 0 0 0-.233 1.027L1 7.384v5.733l3.479-2.087c.15.275.335.553.558.83l-4.002 2.402A1 1 0 0 0 2 15h12a1 1 0 0 0 .965-.738l-4.002-2.401c.223-.278.408-.556.558-.831L15 13.117V7.383l-3.002 1.801a2.76 2.76 0 0 0-.233-1.026L15 6.217V5.4a1 1 0 0 0-.53-.882l-6-3.2ZM7.06.435a2 2 0 0 1 1.882 0l6 3.2A2 2 0 0 1 16 5.4V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 1.059-1.765l6-3.2ZM8 7.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z"
  }));
});
EnvelopeOpenHeart.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};
EnvelopeOpenHeart.defaultProps = {
  color: 'currentColor',
  size: '1em',
  title: null
};
module.exportDefault(EnvelopeOpenHeart);