let React,forwardRef;module.link('react',{default(v){React=v},forwardRef(v){forwardRef=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);var _excluded = ["color", "size", "title"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var Safe2 = /*#__PURE__*/forwardRef(function (_ref, ref) {
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
    d: "M1 2.5A1.5 1.5 0 0 1 2.5 1h12A1.5 1.5 0 0 1 16 2.5v12a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 1 14.5V14H.5a.5.5 0 0 1 0-1H1V9H.5a.5.5 0 0 1 0-1H1V4H.5a.5.5 0 0 1 0-1H1v-.5zM2.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5v-12a.5.5 0 0 0-.5-.5h-12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.035 8h1.528c.047-.184.12-.357.214-.516l-1.08-1.08A3.482 3.482 0 0 0 5.035 8zm1.369-2.303 1.08 1.08c.16-.094.332-.167.516-.214V5.035a3.482 3.482 0 0 0-1.596.662zM9 5.035v1.528c.184.047.357.12.516.214l1.08-1.08A3.482 3.482 0 0 0 9 5.035zm2.303 1.369-1.08 1.08c.094.16.167.332.214.516h1.528a3.483 3.483 0 0 0-.662-1.596zM11.965 9h-1.528c-.047.184-.12.357-.214.516l1.08 1.08A3.483 3.483 0 0 0 11.965 9zm-1.369 2.303-1.08-1.08c-.16.094-.332.167-.516.214v1.528a3.483 3.483 0 0 0 1.596-.662zM8 11.965v-1.528a1.989 1.989 0 0 1-.516-.214l-1.08 1.08A3.483 3.483 0 0 0 8 11.965zm-2.303-1.369 1.08-1.08A1.988 1.988 0 0 1 6.563 9H5.035c.085.593.319 1.138.662 1.596zM4 8.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0zm4.5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
  }));
});
Safe2.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};
Safe2.defaultProps = {
  color: 'currentColor',
  size: '1em',
  title: null
};
module.exportDefault(Safe2);