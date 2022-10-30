let React,forwardRef;module.link('react',{default(v){React=v},forwardRef(v){forwardRef=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);var _excluded = ["color", "size", "title"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var FiletypeXlsx = /*#__PURE__*/forwardRef(function (_ref, ref) {
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
    d: "M14 4.5V11h-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM7.86 14.841a1.13 1.13 0 0 0 .401.823c.13.108.29.192.479.252.19.061.411.091.665.091.338 0 .624-.053.858-.158.237-.105.416-.252.54-.44a1.17 1.17 0 0 0 .187-.656c0-.224-.045-.41-.135-.56a1.002 1.002 0 0 0-.375-.357 2.028 2.028 0 0 0-.565-.21l-.621-.144a.97.97 0 0 1-.405-.176.37.37 0 0 1-.143-.299c0-.156.061-.284.184-.384.125-.101.296-.152.513-.152.143 0 .266.023.37.068a.624.624 0 0 1 .245.181.56.56 0 0 1 .12.258h.75a1.093 1.093 0 0 0-.199-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.552.05-.777.15-.224.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.123.524.082.149.199.27.351.367.153.095.332.167.54.213l.618.144c.207.049.36.113.462.193a.387.387 0 0 1 .153.326.512.512 0 0 1-.085.29.558.558 0 0 1-.255.193c-.111.047-.25.07-.413.07-.117 0-.224-.013-.32-.04a.837.837 0 0 1-.249-.115.578.578 0 0 1-.255-.384h-.764Zm-3.726-2.909h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415H1.5l1.24-2.016-1.228-1.983h.931l.832 1.438h.036l.823-1.438Zm1.923 3.325h1.697v.674H5.266v-3.999h.791v3.325Zm7.636-3.325h.893l-1.274 2.007 1.254 1.992h-.908l-.85-1.415h-.035l-.853 1.415h-.861l1.24-2.016-1.228-1.983h.931l.832 1.438h.036l.823-1.438Z"
  }));
});
FiletypeXlsx.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};
FiletypeXlsx.defaultProps = {
  color: 'currentColor',
  size: '1em',
  title: null
};
module.exportDefault(FiletypeXlsx);