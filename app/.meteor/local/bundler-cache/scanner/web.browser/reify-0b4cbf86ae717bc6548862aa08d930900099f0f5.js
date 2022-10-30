let React,forwardRef;module.link('react',{default(v){React=v},forwardRef(v){forwardRef=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);var _excluded = ["color", "size", "title"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var FiletypeMp3 = /*#__PURE__*/forwardRef(function (_ref, ref) {
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
    d: "M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5Zm-4.911 9.67h-.443v-.609h.422a.688.688 0 0 0 .322-.073.558.558 0 0 0 .22-.2.505.505 0 0 0 .076-.284.49.49 0 0 0-.176-.392.652.652 0 0 0-.442-.15.74.74 0 0 0-.252.041.625.625 0 0 0-.193.112.496.496 0 0 0-.179.349H7.71c.006-.157.04-.302.102-.437.063-.135.153-.252.27-.352.117-.101.26-.18.428-.237.17-.057.364-.086.583-.088.279-.002.52.042.723.132.203.09.36.214.472.372a.91.91 0 0 1 .173.539.833.833 0 0 1-.12.478.96.96 0 0 1-.619.439v.041a1.008 1.008 0 0 1 .718.434.909.909 0 0 1 .144.521c.002.19-.037.359-.117.507a1.104 1.104 0 0 1-.329.378c-.14.101-.302.18-.486.234-.182.053-.376.08-.583.08-.3 0-.558-.051-.77-.153a1.206 1.206 0 0 1-.487-.41 1.094 1.094 0 0 1-.178-.563h.726a.457.457 0 0 0 .106.258.664.664 0 0 0 .249.179.98.98 0 0 0 .357.067.903.903 0 0 0 .384-.076.598.598 0 0 0 .252-.217.56.56 0 0 0 .088-.319.556.556 0 0 0-.334-.522.81.81 0 0 0-.372-.079ZM.706 15.925v-2.66h.038l.952 2.16h.516l.946-2.16h.038v2.66h.715v-3.999h-.8l-1.14 2.596h-.026l-1.14-2.596H0v4h.706Zm5.458-3.999h-1.6v4h.792v-1.342h.803c.287 0 .53-.058.732-.173.203-.118.357-.276.463-.475a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.475-.158-.677a1.175 1.175 0 0 0-.46-.477 1.4 1.4 0 0 0-.733-.179Zm.545 1.333a.795.795 0 0 1-.085.381.574.574 0 0 1-.237.24.793.793 0 0 1-.375.082h-.66v-1.406h.66c.219 0 .39.06.513.182.123.12.184.295.184.521Z"
  }));
});
FiletypeMp3.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};
FiletypeMp3.defaultProps = {
  color: 'currentColor',
  size: '1em',
  title: null
};
module.exportDefault(FiletypeMp3);