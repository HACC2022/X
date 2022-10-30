let React;module.link('react',{"*"(v){React=v}},0);let Tabs;module.link('@restart/ui/Tabs',{default(v){Tabs=v}},1);let getTabTransitionComponent;module.link('./getTabTransitionComponent',{default(v){getTabTransitionComponent=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);




const TabContainer = ({
  transition,
  ...props
}) => /*#__PURE__*/_jsx(Tabs, { ...props,
  transition: getTabTransitionComponent(transition)
});

TabContainer.displayName = 'TabContainer';
module.exportDefault(TabContainer);