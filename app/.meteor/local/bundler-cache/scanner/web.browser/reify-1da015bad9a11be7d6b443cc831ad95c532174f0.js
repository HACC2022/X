let React,forwardRef;module.link('react',{default(v){React=v},forwardRef(v){forwardRef=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);var _excluded = ["color", "size", "title"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var Virus2 = /*#__PURE__*/forwardRef(function (_ref, ref) {
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
    d: "M8 0a1 1 0 0 0-1 1v1.143c0 .557-.407 1.025-.921 1.24-.514.214-1.12.162-1.513-.231l-.809-.809a1 1 0 1 0-1.414 1.414l.809.809c.393.394.445.999.23 1.513C3.168 6.593 2.7 7 2.142 7H1a1 1 0 0 0 0 2h1.143c.557 0 1.025.407 1.24.921.214.514.162 1.12-.231 1.513l-.809.809a1 1 0 0 0 1.414 1.414l.809-.809c.394-.394.999-.445 1.513-.23.514.214.921.682.921 1.24V15a1 1 0 1 0 2 0v-1.143c0-.557.407-1.025.921-1.24.514-.214 1.12-.162 1.513.231l.809.809a1 1 0 0 0 1.414-1.414l-.809-.809c-.394-.394-.445-.999-.23-1.513.214-.514.682-.921 1.24-.921H15a1 1 0 1 0 0-2h-1.143c-.557 0-1.025-.407-1.24-.921-.214-.514-.163-1.12.231-1.513l.809-.809a1 1 0 1 0-1.415-1.414l-.808.809c-.394.393-.999.445-1.513.23C9.407 3.168 9 2.7 9 2.142V1a1 1 0 0 0-1-1Zm2 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm1 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
  }));
});
Virus2.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};
Virus2.defaultProps = {
  color: 'currentColor',
  size: '1em',
  title: null
};
module.exportDefault(Virus2);