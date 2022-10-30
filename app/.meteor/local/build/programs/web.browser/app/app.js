var require = meteorInstall({"client":{"template.main.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// client/template.main.js                                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function() {
  var attrs = {"class":"h-100"};
  for (var prop in attrs) {
    document.body.setAttribute(prop, attrs[prop]);
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"style.css":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// client/style.css                                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// These styles have already been applied to the document.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// client/main.js                                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  module1.link("../imports/startup/client/Startup");
  module1.link("bootstrap/dist/css/bootstrap.min.css");
  module1.link("./style.css");

  ___INIT_METEOR_FAST_REFRESH(module); // Start the app.

}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"imports":{"api":{"stuff":{"Stuff.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/stuff/Stuff.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  module1.export({
    Stuffs: () => Stuffs
  });
  let Mongo;
  module1.link("meteor/mongo", {
    Mongo(v) {
      Mongo = v;
    }

  }, 0);
  let SimpleSchema;
  module1.link("simpl-schema", {
    default(v) {
      SimpleSchema = v;
    }

  }, 1);
  let Tracker;
  module1.link("meteor/tracker", {
    Tracker(v) {
      Tracker = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  /**
   * The StuffsCollection. It encapsulates state and variable values for stuff.
   */
  class StuffsCollection {
    constructor() {
      // The name of this collection.
      this.name = 'StuffsCollection'; // Define the Mongo collection.

      this.collection = new Mongo.Collection(this.name); // Define the structure of each document in the collection.

      this.schema = new SimpleSchema({
        name: String,
        quantity: Number,
        owner: String,
        condition: {
          type: String,
          allowedValues: ['excellent', 'good', 'fair', 'poor'],
          defaultValue: 'good'
        }
      }, {
        tracker: Tracker
      }); // Attach the schema to the collection, so all attempts to insert a document are checked against schema.

      this.collection.attachSchema(this.schema); // Define names for publications and subscriptions

      this.userPublicationName = "".concat(this.name, ".publication.user");
      this.adminPublicationName = "".concat(this.name, ".publication.admin");
    }

  }
  /**
   * The singleton instance of the StuffsCollection.
   * @type {StuffsCollection}
   */


  const Stuffs = new StuffsCollection();
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"startup":{"client":{"Startup.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/startup/client/Startup.jsx                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ReactDOM;
  module1.link("react-dom/client", {
    default(v) {
      ReactDOM = v;
    }

  }, 1);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 2);
  let App;
  module1.link("../../ui/layouts/App.jsx", {
    default(v) {
      App = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  // Startup the application by rendering the App layout component.
  Meteor.startup(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render( /*#__PURE__*/React.createElement(App, null));
  });
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"ui":{"components":{"Annotate.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/Annotate.jsx                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Button, Form, Row, Col;
  module1.link("react-bootstrap", {
    Button(v) {
      Button = v;
    },

    Form(v) {
      Form = v;
    },

    Row(v) {
      Row = v;
    },

    Col(v) {
      Col = v;
    }

  }, 1);
  let Plus;
  module1.link("react-bootstrap-icons", {
    Plus(v) {
      Plus = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  const Annotate = () => /*#__PURE__*/React.createElement(Form, null, /*#__PURE__*/React.createElement(Form.Group, {
    as: Col,
    controlId: "formGridEmail"
  }, /*#__PURE__*/React.createElement(Form.Label, null, "Title"), /*#__PURE__*/React.createElement(Form.Control, {
    type: "text",
    placeholder: "Insert title here"
  })), /*#__PURE__*/React.createElement(Form.Group, {
    controlId: "formGridPassword"
  }, /*#__PURE__*/React.createElement(Form.Label, null, "Description"), /*#__PURE__*/React.createElement(Form.Control, {
    as: "textarea",
    rows: 3
  })), /*#__PURE__*/React.createElement(Form.Group, {
    className: "mb-3",
    controlId: "formGridAddress1"
  }, /*#__PURE__*/React.createElement(Form.Label, null, "Notes"), /*#__PURE__*/React.createElement(Form.Control, {
    placeholder: "Your notes here :)"
  })), /*#__PURE__*/React.createElement(Row, {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement(Form.Group, {
    as: Col,
    className: "mb-3",
    controlId: "formGridAddress2"
  }, /*#__PURE__*/React.createElement(Form.Label, null, "Data source"), /*#__PURE__*/React.createElement(Form.Control, {
    placeholder: "Who published the data?"
  })), /*#__PURE__*/React.createElement(Form.Group, {
    as: Col,
    controlId: "formGridCity"
  }, /*#__PURE__*/React.createElement(Form.Label, null, "Link to data source"), /*#__PURE__*/React.createElement(Form.Control, {
    placeholder: "https://..."
  }))), /*#__PURE__*/React.createElement(Form.Group, {
    controlId: "formGridState"
  }, /*#__PURE__*/React.createElement(Form.Label, null, "Byline"), /*#__PURE__*/React.createElement(Form.Control, {
    placeholder: "Who created the chart?"
  }), "Alternative description for screen readers"), /*#__PURE__*/React.createElement(Form.Group, {
    controlId: "formGridZip"
  }, /*#__PURE__*/React.createElement(Form.Control, {
    as: "textarea",
    rows: 3
  })), /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Text annotations")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Plus, null), "Add text annotation"), ' ', /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Highlight range")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Plus, null), "Add range highlight"), ' ', /*#__PURE__*/React.createElement("hr", null));

  _c = Annotate;
  module1.exportDefault(Annotate);

  var _c;

  $RefreshReg$(_c, "Annotate");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ChartType.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/ChartType.jsx                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Figure, Button;
  module1.link("react-bootstrap", {
    Figure(v) {
      Figure = v;
    },

    Button(v) {
      Button = v;
    }

  }, 1);
  let Link;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  const ChartType = () => /*#__PURE__*/React.createElement(Figure, null, /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Bar Chart",
    src: "https://static.thenounproject.com/png/2402371-200.png"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/verticalbarchart"
  }, "Bar Chart")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Stacked Bars",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAABlBMVEX///8AAABVwtN+AAABEklEQVR4nO3PMRKDMAxFweT+l05PIRsGwXe8r/VY0n4+kiRJkiRpmb6HRu9nAwEBAQEBuXIgyNVAJuf2XF0sBBnM7bm6WAgymNtzdbEQZDC35+piIchgbs/VxUKQwdyeq4uFIIO5PVcXC89CZgMBAQEB2RuyTCBpgaQFkhZIWiBpgaQFktY2kOP704GANAUC0hTIU5DZu0BAQEBAQEBAQEBAQN4KBKQpEJCmQKY/pgWSFkhaIGmBpAWSFkhaIGltAzm+3x0ICAgICMiVA0FAQEBAQEBAQEBAQLogd4FBQEBAQNaGLBNIWiBpgaQFkhZIWiBpgaT1t5C0QNICSQskLZC0QNICSQskrf0gkiRJkiTp9X6iGDEBV3EOWgAAAABJRU5ErkJggg=="
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/stackedbarchart"
  }, "Stacked Bars")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Grouped Bars",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/groupedbarchart"
  }, "Grouped Bars")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Split Bars",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Split Bars"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Bullet Bars",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Bullet Bars"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Column Chart",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Column Chart"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Stacked Column Chart",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Stacked Column Chart"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "Grouped Coolumn Chart",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Grouped Coolumn Chart"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/linechart"
  }, "Line Chart")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/areachart"
  }, "Area Chart")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/scatterchart"
  }, "Scatter Chart")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Table"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Dot Plot"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Range Plot"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Arrow Plot"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/piechart"
  }, "Pie Chart")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Link, {
    to: "/doughnutchart"
  }, "Doughnut Chart")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Multiple Pies"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Multiple Donuts"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-dark"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 50,
    height: 50,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Election Donut"), /*#__PURE__*/React.createElement("hr", null));

  _c = ChartType;
  module1.exportDefault(ChartType);

  var _c;

  $RefreshReg$(_c, "ChartType");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Footer.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/Footer.jsx                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Col, Container;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  /** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
  const Footer = () => /*#__PURE__*/React.createElement("footer", {
    className: "mt-auto py-3 bg-light"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(Col, {
    className: "text-center"
  }, "Datawrapper is developed by ", /*#__PURE__*/React.createElement("strong", null, "Datawrapper GmbH"), ' ', /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("a", {
    href: ""
  }, "We are Hiring"), /*#__PURE__*/React.createElement("br", null), "Honolulu, HI 96822", ' ', /*#__PURE__*/React.createElement("br", null))));

  _c = Footer;
  module1.exportDefault(Footer);

  var _c;

  $RefreshReg$(_c, "Footer");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Layout.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/Layout.jsx                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Form, Row, Col;
  module1.link("react-bootstrap", {
    Form(v) {
      Form = v;
    },

    Row(v) {
      Row = v;
    },

    Col(v) {
      Col = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  const Layout = () => /*#__PURE__*/React.createElement(Form, null, /*#__PURE__*/React.createElement(Form.Group, null, /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Output locale")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, null, "Defines decimal and thousand separators as well as translation of month and weekday names."), /*#__PURE__*/React.createElement(Col, {
    sm: "5"
  }, /*#__PURE__*/React.createElement(Form.Select, {
    size: "sm"
  }, /*#__PURE__*/React.createElement("option", null, "English(en-US)"), /*#__PURE__*/React.createElement("option", null, "MA de zenm me zhe me duo"), /*#__PURE__*/React.createElement("option", null, "zhe yao bian dao shen me shi hou"), /*#__PURE__*/React.createElement("option", null, "Sha bi ba"), /*#__PURE__*/React.createElement("option", null, "Wei shen me yao xuan yu yan?"), /*#__PURE__*/React.createElement("option", null, "hui bu hui na me duo yu yan ni mei B shu?")))), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Group, {
    as: Row
  }, /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Layout")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, {
    column: true,
    sm: "3"
  }, "Theme"), /*#__PURE__*/React.createElement(Col, {
    sm: "5"
  }, /*#__PURE__*/React.createElement(Form.Select, {
    size: "sm"
  }, /*#__PURE__*/React.createElement("option", null, "Datawrapper"), /*#__PURE__*/React.createElement("option", null, "Datawrapper(2012)"), /*#__PURE__*/React.createElement("option", null, "Datawrapper(extended charset)"), /*#__PURE__*/React.createElement("option", null, "Datawrapper(high contrast)"), /*#__PURE__*/React.createElement("option", null, "Pageflow"))), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    id: "custom-switch",
    label: "Show logo"
  }), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    label: "Automatic dark mode",
    id: "disabled-custom-switch"
  }), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    id: "custom-switch",
    label: "Use the same colors in dark mode"
  })), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Group, null, /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Footer")), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    id: "custom-switch",
    label: "Data download"
  }), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    label: "Image download options",
    id: "disabled-custom-switch"
  }), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    id: "custom-switch",
    label: "Embed link"
  }), /*#__PURE__*/React.createElement(Form.Check, {
    disabled: true,
    type: "switch",
    id: "custom-switch",
    label: "Datawrapper attribution"
  })), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Group, null, /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Share buttons")), /*#__PURE__*/React.createElement(Form.Check, {
    type: "switch",
    id: "custom-switch",
    label: "Social media share buttons"
  })), /*#__PURE__*/React.createElement("hr", null));

  _c = Layout;
  module1.exportDefault(Layout);

  var _c;

  $RefreshReg$(_c, "Layout");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"LoadingSpinner.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/LoadingSpinner.jsx                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Container, Row, Spinner;
  module1.link("react-bootstrap", {
    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    },

    Spinner(v) {
      Spinner = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  const LoadingSpinner = () => /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(Row, {
    className: "justify-content-md-center"
  }, /*#__PURE__*/React.createElement(Spinner, {
    animation: "border"
  }), "Getting data"));

  _c = LoadingSpinner;
  module1.exportDefault(LoadingSpinner);

  var _c;

  $RefreshReg$(_c, "LoadingSpinner");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"MainMenu.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/MainMenu.jsx                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Nav, Col, Row, Tab;
  module1.link("react-bootstrap", {
    Nav(v) {
      Nav = v;
    },

    Col(v) {
      Col = v;
    },

    Row(v) {
      Row = v;
    },

    Tab(v) {
      Tab = v;
    }

  }, 1);
  let Visualize;
  module1.link("./Visualize", {
    default(v) {
      Visualize = v;
    }

  }, 2);
  let Publish;
  module1.link("./Publish", {
    default(v) {
      Publish = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  const MainMenu = () => /*#__PURE__*/React.createElement(Tab.Container, {
    id: "left-tabs-example",
    defaultActiveKey: "first"
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    sm: 3
  }, /*#__PURE__*/React.createElement(Nav, {
    variant: "pills",
    className: "flex-column"
  }, /*#__PURE__*/React.createElement(Nav.Item, null, /*#__PURE__*/React.createElement(Nav.Link, {
    eventKey: "first"
  }, /*#__PURE__*/React.createElement("strong", null, "3 "), "Visualize")), /*#__PURE__*/React.createElement(Nav.Item, null, /*#__PURE__*/React.createElement(Nav.Link, {
    eventKey: "second"
  }, /*#__PURE__*/React.createElement("strong", null, "4 "), "Publish & Embed")))), /*#__PURE__*/React.createElement(Col, {
    sm: 9
  }, /*#__PURE__*/React.createElement(Tab.Content, null, /*#__PURE__*/React.createElement(Tab.Pane, {
    eventKey: "first"
  }, /*#__PURE__*/React.createElement(Visualize, null)), /*#__PURE__*/React.createElement(Tab.Pane, {
    eventKey: "second"
  }, /*#__PURE__*/React.createElement(Publish, null))))));

  _c = MainMenu;
  module1.exportDefault(MainMenu);

  var _c;

  $RefreshReg$(_c, "MainMenu");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Publish.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/Publish.jsx                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Figure, Button;
  module1.link("react-bootstrap", {
    Figure(v) {
      Figure = v;
    },

    Button(v) {
      Button = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  const Publish = () => /*#__PURE__*/React.createElement(Figure, null, /*#__PURE__*/React.createElement("h1", null, "Publish visualization"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-success"
  }, /*#__PURE__*/React.createElement(Figure.Caption, null, "Your visualization is not published."), /*#__PURE__*/React.createElement(Figure.Image, {
    width: 171,
    height: 180,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "Publish now"), /*#__PURE__*/React.createElement("p", null, "You'll need to publish this visualization before embedding it on your website or sharing it on social media.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "Your published visualization will still only be visible to people who know its URL. We won't share it publicly."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("h1", null, "Export or duplicate visualization"), /*#__PURE__*/React.createElement("p", null, "You can duplicate it to start editing a copy of the visualization. Or export it into other formats."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-success"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 171,
    height: 180,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "PNG"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline-success"
  }, /*#__PURE__*/React.createElement(Figure.Image, {
    width: 171,
    height: 180,
    alt: "171x180",
    src: "holder.js/171x180"
  }), /*#__PURE__*/React.createElement("br", null), "DUPLICATE"));

  _c = Publish;
  module1.exportDefault(Publish);

  var _c;

  $RefreshReg$(_c, "Publish");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Refine.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/Refine.jsx                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },

    useState(v) {
      useState = v;
    }

  }, 0);
  let Form, Col, Row;
  module1.link("react-bootstrap", {
    Form(v) {
      Form = v;
    },

    Col(v) {
      Col = v;
    },

    Row(v) {
      Row = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  var _s = $RefreshSig$();

  const Refine = () => {
    _s();

    const [value, setValue] = useState(0);
    return /*#__PURE__*/React.createElement(Form, null, /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement(Form.Label, null, /*#__PURE__*/React.createElement("strong", null, "Horizontal axis")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Select column"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Select, {
      size: "sm"
    }, /*#__PURE__*/React.createElement("option", null, "X.1")))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Custom range"), /*#__PURE__*/React.createElement(Col, {
      sm: "3"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      type: "text",
      placeholder: "min"
    })), "to", /*#__PURE__*/React.createElement(Col, {
      sm: "3"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      type: "text",
      placeholder: "max"
    }))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Custom ticks"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      type: "text",
      placeholder: "e.g. 2000,2005,2012"
    }))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Tick format"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Select, {
      size: "sm"
    }, /*#__PURE__*/React.createElement("option", null, "(automatic)"), /*#__PURE__*/React.createElement("option", null, "1000[.00]"), /*#__PURE__*/React.createElement("option", null, "0"), /*#__PURE__*/React.createElement("option", null, "0.0"), /*#__PURE__*/React.createElement("option", null, "0.00"), /*#__PURE__*/React.createElement("option", null, "0.000"), /*#__PURE__*/React.createElement("option", null, "0.[0]"), /*#__PURE__*/React.createElement("option", null, "0.[00]"), /*#__PURE__*/React.createElement("option", null, "0%"), /*#__PURE__*/React.createElement("option", null, "0.0%"), /*#__PURE__*/React.createElement("option", null, "0.00%"), /*#__PURE__*/React.createElement("option", null, "0.[0]%"), /*#__PURE__*/React.createElement("option", null, "0.[00]%"), /*#__PURE__*/React.createElement("option", null, "10,000"), /*#__PURE__*/React.createElement("option", null, "1st"), /*#__PURE__*/React.createElement("option", null, "123k"), /*#__PURE__*/React.createElement("option", null, "123.4k"), /*#__PURE__*/React.createElement("option", null, "123.45k"), /*#__PURE__*/React.createElement("option", null, "(custom)")))), ['radio'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Grid lines"), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "show",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "hide",
      name: "group2",
      type: type,
      id: "inline-".concat(type, "-2")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "tick marks",
      name: "group3",
      type: type,
      id: "inline-".concat(type, "-3")
    }))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, /*#__PURE__*/React.createElement("strong", null, "Vertical axis")), ['radio'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Grid lines"), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "linear",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "logarithmic",
      name: "group2",
      type: type,
      id: "inline-".concat(type, "-2")
    }))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Custom range"), /*#__PURE__*/React.createElement(Col, {
      sm: "3"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      type: "text",
      placeholder: "min"
    })), "to", /*#__PURE__*/React.createElement(Col, {
      sm: "3"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      type: "text",
      placeholder: "max"
    }))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Custom ticks"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      type: "text",
      placeholder: "e.g. 10,20,50"
    }))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Number format"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Select, {
      size: "sm"
    }, /*#__PURE__*/React.createElement("option", null, "(automatic)"), /*#__PURE__*/React.createElement("option", null, "1000[.00]"), /*#__PURE__*/React.createElement("option", null, "0"), /*#__PURE__*/React.createElement("option", null, "0.0"), /*#__PURE__*/React.createElement("option", null, "0.00"), /*#__PURE__*/React.createElement("option", null, "0.000"), /*#__PURE__*/React.createElement("option", null, "0.[0]"), /*#__PURE__*/React.createElement("option", null, "0.[00]"), /*#__PURE__*/React.createElement("option", null, "0%"), /*#__PURE__*/React.createElement("option", null, "0.0%"), /*#__PURE__*/React.createElement("option", null, "0.00%"), /*#__PURE__*/React.createElement("option", null, "0.[0]%"), /*#__PURE__*/React.createElement("option", null, "0.[00]%"), /*#__PURE__*/React.createElement("option", null, "10,000"), /*#__PURE__*/React.createElement("option", null, "1st"), /*#__PURE__*/React.createElement("option", null, "123k"), /*#__PURE__*/React.createElement("option", null, "123.4k"), /*#__PURE__*/React.createElement("option", null, "123.45k"), /*#__PURE__*/React.createElement("option", null, "(custom)")))), ['radio'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Grid lines"), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "show",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "hide",
      name: "group2",
      type: type,
      id: "inline-".concat(type, "-2")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "tick marks",
      name: "group3",
      type: type,
      id: "inline-".concat(type, "-3")
    }))), ['radio'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Grid labels"), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "show",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "hide",
      name: "group2",
      type: type,
      id: "inline-".concat(type, "-2")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "tick marks",
      name: "group3",
      type: type,
      id: "inline-".concat(type, "-3")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "left",
      name: "group4",
      type: type,
      id: "inline-".concat(type, "-4")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "right",
      name: "group5",
      type: type,
      id: "inline-".concat(type, "-5")
    }))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, /*#__PURE__*/React.createElement("strong", null, "Customize lines")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3",
      htmlFor: "exampleColorInput"
    }, "Base color"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      type: "color",
      id: "exampleColorInput",
      defaultValue: "#563d7c",
      title: "Choose your color"
    }))), /*#__PURE__*/React.createElement(Form.Group, null, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Line width")), /*#__PURE__*/React.createElement(Form.Group, null, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Line dashes")), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Interpolation"), /*#__PURE__*/React.createElement(Col, {
      sm: "6"
    }, /*#__PURE__*/React.createElement(Form.Select, {
      size: "sm"
    }, /*#__PURE__*/React.createElement("option", null, "linear"), /*#__PURE__*/React.createElement("option", null, "curved"), /*#__PURE__*/React.createElement("option", null, "curved(cardinal)"), /*#__PURE__*/React.createElement("option", null, "curved(natural)"), /*#__PURE__*/React.createElement("option", null, "steps(after)"), /*#__PURE__*/React.createElement("option", null, "steps(before)"), /*#__PURE__*/React.createElement("option", null, "steps")))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, /*#__PURE__*/React.createElement("strong", null, "Labeling")), ['radio'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Line labels"), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "top",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "right",
      name: "group2",
      type: type,
      id: "inline-".concat(type, "-2")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      inline: true,
      label: "none",
      name: "group3",
      type: type,
      id: "inline-".concat(type, "-3")
    }))), ['checkbox'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Check, {
      label: "Draw lines connecting labels to lines",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }), /*#__PURE__*/React.createElement(Form.Check, {
      label: "Use line color for labels",
      name: "group2",
      type: type,
      id: "inline-".concat(type, "-2")
    }))), /*#__PURE__*/React.createElement(Form.Group, {
      as: Row,
      className: "mb-3",
      controlId: "formBasicEmail"
    }, /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, "Label margin"), /*#__PURE__*/React.createElement(Col, {
      sm: "3"
    }, /*#__PURE__*/React.createElement(Form.Range, {
      value: value,
      onChange: e => setValue(e.target.value),
      min: 0,
      max: 600
    })), /*#__PURE__*/React.createElement(Col, {
      sm: "1"
    }, /*#__PURE__*/React.createElement(Form.Control, {
      size: "sm",
      value: value,
      type: "text",
      onChange: e => setValue(e.target.value)
    })), /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement(Form.Text, null, "px (0 = auto)"))), ['checkbox'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Check, {
      label: "Show tooltips",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, /*#__PURE__*/React.createElement("strong", null, "Customize symbols")), ['checkbox'].map(type => /*#__PURE__*/React.createElement("div", {
      key: "inline-".concat(type),
      className: "mb-3"
    }, /*#__PURE__*/React.createElement(Form.Check, {
      label: "Line symbols",
      name: "group1",
      type: type,
      id: "inline-".concat(type, "-1")
    }))), /*#__PURE__*/React.createElement(Form.Label, {
      column: true,
      sm: "3"
    }, /*#__PURE__*/React.createElement("strong", null, "Fill area between lines")), /*#__PURE__*/React.createElement("hr", null));
  };

  _s(Refine, "qPBOvRc2Co1iWTsdTL0g7j/rpjU=");

  _c = Refine;
  module1.exportDefault(Refine);

  var _c;

  $RefreshReg$(_c, "Refine");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"StuffItem.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/StuffItem.jsx                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let PropTypes;
  module1.link("prop-types", {
    default(v) {
      PropTypes = v;
    }

  }, 1);
  let Link;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  /** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
  const StuffItem = _ref => {
    let {
      stuff
    } = _ref;
    return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, stuff.name), /*#__PURE__*/React.createElement("td", null, stuff.quantity), /*#__PURE__*/React.createElement("td", null, stuff.condition), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Link, {
      to: "/edit/".concat(stuff._id)
    }, "Edit")));
  }; // Require a document to be passed to this component.


  _c = StuffItem;
  StuffItem.propTypes = {
    stuff: PropTypes.shape({
      name: PropTypes.string,
      quantity: PropTypes.number,
      condition: PropTypes.string,
      _id: PropTypes.string
    }).isRequired
  };
  module1.exportDefault(StuffItem);

  var _c;

  $RefreshReg$(_c, "StuffItem");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"StuffItemAdmin.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/StuffItemAdmin.jsx                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let PropTypes;
  module1.link("prop-types", {
    default(v) {
      PropTypes = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  /** Renders a single row in the List Stuff (Admin) table. See pages/ListStuffAdmin.jsx. */
  const StuffItemAdmin = _ref => {
    let {
      stuff
    } = _ref;
    return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, stuff.name), /*#__PURE__*/React.createElement("td", null, stuff.quantity), /*#__PURE__*/React.createElement("td", null, stuff.condition), /*#__PURE__*/React.createElement("td", null, stuff.owner));
  }; // Require a document to be passed to this component.


  _c = StuffItemAdmin;
  StuffItemAdmin.propTypes = {
    stuff: PropTypes.shape({
      name: PropTypes.string,
      quantity: PropTypes.number,
      condition: PropTypes.string,
      _id: PropTypes.string,
      owner: PropTypes.string
    }).isRequired
  };
  module1.exportDefault(StuffItemAdmin);

  var _c;

  $RefreshReg$(_c, "StuffItemAdmin");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"TopMenu.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/TopMenu.jsx                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Button, Container, Image, Nav, Navbar, NavDropdown;
  module1.link("react-bootstrap", {
    Button(v) {
      Button = v;
    },

    Container(v) {
      Container = v;
    },

    Image(v) {
      Image = v;
    },

    Nav(v) {
      Nav = v;
    },

    Navbar(v) {
      Navbar = v;
    },

    NavDropdown(v) {
      NavDropdown = v;
    }

  }, 1);
  let AirplaneEnginesFill, ArchiveFill, PlusCircleFill, ThreeDots;
  module1.link("react-bootstrap-icons", {
    AirplaneEnginesFill(v) {
      AirplaneEnginesFill = v;
    },

    ArchiveFill(v) {
      ArchiveFill = v;
    },

    PlusCircleFill(v) {
      PlusCircleFill = v;
    },

    ThreeDots(v) {
      ThreeDots = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  const TopMenu = () => /*#__PURE__*/React.createElement(Navbar, {
    bg: "light",
    expand: "lg"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(Nav, {
    className: "me-auto"
  }, /*#__PURE__*/React.createElement(Image, {
    fluid: true,
    rounded: true,
    mx: "auto",
    d: "block",
    src: "./images/Logo.png",
    alt: "Logo",
    width: 100
  })), /*#__PURE__*/React.createElement(Nav, {
    className: "justify-content-end"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "light"
  }, /*#__PURE__*/React.createElement(AirplaneEnginesFill, null), "Dashboard"), /*#__PURE__*/React.createElement(Button, {
    variant: "light"
  }, /*#__PURE__*/React.createElement(PlusCircleFill, null), "Create new..."), /*#__PURE__*/React.createElement(Button, {
    variant: "light"
  }, /*#__PURE__*/React.createElement(ArchiveFill, null), "Archive"), /*#__PURE__*/React.createElement(NavDropdown, {
    title: /*#__PURE__*/React.createElement(ThreeDots, null)
  }, /*#__PURE__*/React.createElement(NavDropdown.Item, null, "Setting"), /*#__PURE__*/React.createElement(NavDropdown.Item, null, "My teams"), /*#__PURE__*/React.createElement(NavDropdown.Item, null, "River"), /*#__PURE__*/React.createElement(NavDropdown.Item, null, "Language"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(NavDropdown.ItemText, null, "Select active team"), /*#__PURE__*/React.createElement(NavDropdown.Item, null, "Create a Team"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(NavDropdown.Item, null, "Logout")))));

  _c = TopMenu;
  module1.exportDefault(TopMenu);

  var _c;

  $RefreshReg$(_c, "TopMenu");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Visualize.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/components/Visualize.jsx                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let Button, Col, Container, Row, Tab, Tabs;
  module1.link("react-bootstrap", {
    Button(v) {
      Button = v;
    },

    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    },

    Tab(v) {
      Tab = v;
    },

    Tabs(v) {
      Tabs = v;
    }

  }, 0);
  let ArrowLeft, ArrowRight;
  module1.link("react-bootstrap-icons", {
    ArrowLeft(v) {
      ArrowLeft = v;
    },

    ArrowRight(v) {
      ArrowRight = v;
    }

  }, 1);
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 2);
  let ChartType;
  module1.link("./ChartType", {
    default(v) {
      ChartType = v;
    }

  }, 3);
  let Refine;
  module1.link("./Refine", {
    default(v) {
      Refine = v;
    }

  }, 4);
  let Annotate;
  module1.link("./Annotate", {
    default(v) {
      Annotate = v;
    }

  }, 5);
  let Layout;
  module1.link("./Layout", {
    default(v) {
      Layout = v;
    }

  }, 6);

  ___INIT_METEOR_FAST_REFRESH(module);

  const Visualize = () => /*#__PURE__*/React.createElement(Container, {
    className: "py-3"
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement(Tabs, {
    defaultActiveKey: "profile",
    id: "fill-tab-example",
    className: "mb-3",
    fill: true
  }, /*#__PURE__*/React.createElement(Tab, {
    eventKey: "home",
    title: "Chart type"
  }, /*#__PURE__*/React.createElement(ChartType, null)), /*#__PURE__*/React.createElement(Tab, {
    eventKey: "profile",
    title: "Refine"
  }, /*#__PURE__*/React.createElement(Refine, null)), /*#__PURE__*/React.createElement(Tab, {
    eventKey: "contact",
    title: "Annotate"
  }, /*#__PURE__*/React.createElement(Annotate, null)), /*#__PURE__*/React.createElement(Tab, {
    eventKey: "longer-tab",
    title: "Layout"
  }, /*#__PURE__*/React.createElement(Layout, null))), /*#__PURE__*/React.createElement(Button, {
    variant: "light"
  }, /*#__PURE__*/React.createElement(ArrowLeft, null), "Back"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Proceed", /*#__PURE__*/React.createElement(ArrowRight, null)))));

  _c = Visualize;
  module1.exportDefault(Visualize);

  var _c;

  $RefreshReg$(_c, "Visualize");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"layouts":{"App.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/layouts/App.jsx                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let PropTypes;
  module1.link("prop-types", {
    default(v) {
      PropTypes = v;
    }

  }, 1);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 2);
  let Roles;
  module1.link("meteor/alanning:roles", {
    Roles(v) {
      Roles = v;
    }

  }, 3);
  let Router, Route, Routes, Navigate;
  module1.link("react-router-dom", {
    BrowserRouter(v) {
      Router = v;
    },

    Route(v) {
      Route = v;
    },

    Routes(v) {
      Routes = v;
    },

    Navigate(v) {
      Navigate = v;
    }

  }, 4);
  let Footer;
  module1.link("../components/Footer", {
    default(v) {
      Footer = v;
    }

  }, 5);
  let Landing;
  module1.link("../pages/Landing", {
    default(v) {
      Landing = v;
    }

  }, 6);
  let ListStuff;
  module1.link("../pages/ListStuff", {
    default(v) {
      ListStuff = v;
    }

  }, 7);
  let ListStuffAdmin;
  module1.link("../pages/ListStuffAdmin", {
    default(v) {
      ListStuffAdmin = v;
    }

  }, 8);
  let AddStuff;
  module1.link("../pages/AddStuff", {
    default(v) {
      AddStuff = v;
    }

  }, 9);
  let EditStuff;
  module1.link("../pages/EditStuff", {
    default(v) {
      EditStuff = v;
    }

  }, 10);
  let NotFound;
  module1.link("../pages/NotFound", {
    default(v) {
      NotFound = v;
    }

  }, 11);
  let SignUp;
  module1.link("../pages/SignUp", {
    default(v) {
      SignUp = v;
    }

  }, 12);
  let SignOut;
  module1.link("../pages/SignOut", {
    default(v) {
      SignOut = v;
    }

  }, 13);
  let TopMenu;
  module1.link("../components/TopMenu", {
    default(v) {
      TopMenu = v;
    }

  }, 14);
  let SignIn;
  module1.link("../pages/SignIn", {
    default(v) {
      SignIn = v;
    }

  }, 15);
  let NotAuthorized;
  module1.link("../pages/NotAuthorized", {
    default(v) {
      NotAuthorized = v;
    }

  }, 16);
  let X;
  module1.link("../pages/X", {
    default(v) {
      X = v;
    }

  }, 17);
  let VerticalBarChart;
  module1.link("../pages/VerticalBarChart", {
    default(v) {
      VerticalBarChart = v;
    }

  }, 18);
  let StackedBarChart;
  module1.link("../pages/StackedBarChart", {
    default(v) {
      StackedBarChart = v;
    }

  }, 19);
  let GroupedBarChart;
  module1.link("../pages/GroupedBarChart", {
    default(v) {
      GroupedBarChart = v;
    }

  }, 20);
  let AreaChart;
  module1.link("../pages/AreaChart", {
    default(v) {
      AreaChart = v;
    }

  }, 21);
  let LineChart;
  module1.link("../pages/LineChart", {
    default(v) {
      LineChart = v;
    }

  }, 22);
  let PieChart;
  module1.link("../pages/PieChart", {
    default(v) {
      PieChart = v;
    }

  }, 23);
  let DoughnutChart;
  module1.link("../pages/DoughnutChart", {
    default(v) {
      DoughnutChart = v;
    }

  }, 24);
  let ScatterChart;
  module1.link("../pages/ScatterChart", {
    default(v) {
      ScatterChart = v;
    }

  }, 25);

  ___INIT_METEOR_FAST_REFRESH(module);

  /** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
  const App = () => /*#__PURE__*/React.createElement(Router, null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex flex-column min-vh-100"
  }, /*#__PURE__*/React.createElement(TopMenu, null), /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    exact: true,
    path: "/",
    element: /*#__PURE__*/React.createElement(X, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/signin",
    element: /*#__PURE__*/React.createElement(SignIn, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/signup",
    element: /*#__PURE__*/React.createElement(SignUp, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/signout",
    element: /*#__PURE__*/React.createElement(SignOut, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/verticalbarchart",
    element: /*#__PURE__*/React.createElement(VerticalBarChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/stackedbarchart",
    element: /*#__PURE__*/React.createElement(StackedBarChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/groupedbarchart",
    element: /*#__PURE__*/React.createElement(GroupedBarChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/areachart",
    element: /*#__PURE__*/React.createElement(AreaChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/linechart",
    element: /*#__PURE__*/React.createElement(LineChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/piechart",
    element: /*#__PURE__*/React.createElement(PieChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/doughnutchart",
    element: /*#__PURE__*/React.createElement(DoughnutChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/scatterchart",
    element: /*#__PURE__*/React.createElement(ScatterChart, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/home",
    element: /*#__PURE__*/React.createElement(ProtectedRoute, null, /*#__PURE__*/React.createElement(Landing, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/list",
    element: /*#__PURE__*/React.createElement(ProtectedRoute, null, /*#__PURE__*/React.createElement(ListStuff, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/add",
    element: /*#__PURE__*/React.createElement(ProtectedRoute, null, /*#__PURE__*/React.createElement(AddStuff, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/edit/:_id",
    element: /*#__PURE__*/React.createElement(ProtectedRoute, null, /*#__PURE__*/React.createElement(EditStuff, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/admin",
    element: /*#__PURE__*/React.createElement(AdminProtectedRoute, null, /*#__PURE__*/React.createElement(ListStuffAdmin, null))
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/notauthorized",
    element: /*#__PURE__*/React.createElement(NotAuthorized, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "*",
    element: /*#__PURE__*/React.createElement(NotFound, null)
  })), /*#__PURE__*/React.createElement(Footer, null)));
  /*
   * ProtectedRoute (see React Router v6 sample)
   * Checks for Meteor login before routing to the requested page, otherwise goes to signin page.
   * @param {any} { component: Component, ...rest }
   */


  _c = App;

  const ProtectedRoute = _ref => {
    let {
      children
    } = _ref;
    const isLogged = Meteor.userId() !== null;
    return isLogged ? children : /*#__PURE__*/React.createElement(Navigate, {
      to: "/signin"
    });
  };
  /**
   * AdminProtectedRoute (see React Router v6 sample)
   * Checks for Meteor login and admin role before routing to the requested page, otherwise goes to signin page.
   * @param {any} { component: Component, ...rest }
   */


  _c2 = ProtectedRoute;

  const AdminProtectedRoute = _ref2 => {
    let {
      children
    } = _ref2;
    const isLogged = Meteor.userId() !== null;

    if (!isLogged) {
      return /*#__PURE__*/React.createElement(Navigate, {
        to: "/signin"
      });
    }

    const isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin');
    return isLogged && isAdmin ? children : /*#__PURE__*/React.createElement(Navigate, {
      to: "/notauthorized"
    });
  }; // Require a component and location to be passed to each ProtectedRoute.


  _c3 = AdminProtectedRoute;
  ProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
  };
  ProtectedRoute.defaultProps = {
    children: /*#__PURE__*/React.createElement(Landing, null)
  }; // Require a component and location to be passed to each AdminProtectedRoute.

  AdminProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
  };
  AdminProtectedRoute.defaultProps = {
    children: /*#__PURE__*/React.createElement(Landing, null)
  };
  module1.exportDefault(App);

  var _c, _c2, _c3;

  $RefreshReg$(_c, "App");
  $RefreshReg$(_c2, "ProtectedRoute");
  $RefreshReg$(_c3, "AdminProtectedRoute");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"pages":{"AddStuff.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/AddStuff.jsx                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Card, Col, Container, Row;
  module1.link("react-bootstrap", {
    Card(v) {
      Card = v;
    },

    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    }

  }, 1);
  let AutoForm, ErrorsField, NumField, SelectField, SubmitField, TextField;
  module1.link("uniforms-bootstrap5", {
    AutoForm(v) {
      AutoForm = v;
    },

    ErrorsField(v) {
      ErrorsField = v;
    },

    NumField(v) {
      NumField = v;
    },

    SelectField(v) {
      SelectField = v;
    },

    SubmitField(v) {
      SubmitField = v;
    },

    TextField(v) {
      TextField = v;
    }

  }, 2);
  let swal;
  module1.link("sweetalert", {
    default(v) {
      swal = v;
    }

  }, 3);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 4);
  let SimpleSchema2Bridge;
  module1.link("uniforms-bridge-simple-schema-2", {
    default(v) {
      SimpleSchema2Bridge = v;
    }

  }, 5);
  let SimpleSchema;
  module1.link("simpl-schema", {
    default(v) {
      SimpleSchema = v;
    }

  }, 6);
  let Stuffs;
  module1.link("../../api/stuff/Stuff", {
    Stuffs(v) {
      Stuffs = v;
    }

  }, 7);

  ___INIT_METEOR_FAST_REFRESH(module);

  // Create a schema to specify the structure of the data to appear in the form.
  const formSchema = new SimpleSchema({
    name: String,
    quantity: Number,
    condition: {
      type: String,
      allowedValues: ['excellent', 'good', 'fair', 'poor'],
      defaultValue: 'good'
    }
  });
  const bridge = new SimpleSchema2Bridge(formSchema);
  /* Renders the AddStuff page for adding a document. */

  const AddStuff = () => {
    // On submit, insert the data.
    const submit = (data, formRef) => {
      const {
        name,
        quantity,
        condition
      } = data;
      const owner = Meteor.user().username;
      Stuffs.collection.insert({
        name,
        quantity,
        condition,
        owner
      }, error => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          swal('Success', 'Item added successfully', 'success');
          formRef.reset();
        }
      });
    }; // Render the form. Use Uniforms: https://github.com/vazco/uniforms


    let fRef = null;
    return /*#__PURE__*/React.createElement(Container, {
      className: "py-3"
    }, /*#__PURE__*/React.createElement(Row, {
      className: "justify-content-center"
    }, /*#__PURE__*/React.createElement(Col, {
      xs: 5
    }, /*#__PURE__*/React.createElement(Col, {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("h2", null, "Add Stuff")), /*#__PURE__*/React.createElement(AutoForm, {
      ref: ref => {
        fRef = ref;
      },
      schema: bridge,
      onSubmit: data => submit(data, fRef)
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Card.Body, null, /*#__PURE__*/React.createElement(TextField, {
      name: "name"
    }), /*#__PURE__*/React.createElement(NumField, {
      name: "quantity",
      decimal: null
    }), /*#__PURE__*/React.createElement(SelectField, {
      name: "condition"
    }), /*#__PURE__*/React.createElement(SubmitField, {
      value: "Submit"
    }), /*#__PURE__*/React.createElement(ErrorsField, null)))))));
  };

  _c = AddStuff;
  module1.exportDefault(AddStuff);

  var _c;

  $RefreshReg$(_c, "AddStuff");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"AreaChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/AreaChart.jsx                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    CategoryScale(v) {
      CategoryScale = v;
    },

    LinearScale(v) {
      LinearScale = v;
    },

    PointElement(v) {
      PointElement = v;
    },

    LineElement(v) {
      LineElement = v;
    },

    Title(v) {
      Title = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Filler(v) {
      Filler = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Line;
  module1.link("react-chartjs-2", {
    Line(v) {
      Line = v;
    }

  }, 2);
  let faker;
  module1.link("faker", {
    default(v) {
      faker = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Chart.js Area Chart'
      }
    }
  };
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data = {
    labels,
    datasets: [{
      fill: true,
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({
        min: 0,
        max: 1000
      })),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }]
  };

  const AreaChart = () => /*#__PURE__*/React.createElement(Line, {
    options: options,
    data: data
  });

  _c = AreaChart;
  module1.exportDefault(AreaChart);

  var _c;

  $RefreshReg$(_c, "AreaChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"DoughnutChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/DoughnutChart.jsx                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, ArcElement, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    ArcElement(v) {
      ArcElement = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Doughnut;
  module1.link("react-chartjs-2", {
    Doughnut(v) {
      Doughnut = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(ArcElement, Tooltip, Legend);
  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
      borderWidth: 1
    }]
  };

  const DoughnutChart = () => /*#__PURE__*/React.createElement(Doughnut, {
    data: data
  });

  _c = DoughnutChart;
  module1.exportDefault(DoughnutChart);

  var _c;

  $RefreshReg$(_c, "DoughnutChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"EditStuff.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/EditStuff.jsx                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let swal;
  module1.link("sweetalert", {
    default(v) {
      swal = v;
    }

  }, 1);
  let Card, Col, Container, Row;
  module1.link("react-bootstrap", {
    Card(v) {
      Card = v;
    },

    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    }

  }, 2);
  let AutoForm, ErrorsField, HiddenField, NumField, SelectField, SubmitField, TextField;
  module1.link("uniforms-bootstrap5", {
    AutoForm(v) {
      AutoForm = v;
    },

    ErrorsField(v) {
      ErrorsField = v;
    },

    HiddenField(v) {
      HiddenField = v;
    },

    NumField(v) {
      NumField = v;
    },

    SelectField(v) {
      SelectField = v;
    },

    SubmitField(v) {
      SubmitField = v;
    },

    TextField(v) {
      TextField = v;
    }

  }, 3);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 4);
  let useTracker;
  module1.link("meteor/react-meteor-data", {
    useTracker(v) {
      useTracker = v;
    }

  }, 5);
  let SimpleSchema2Bridge;
  module1.link("uniforms-bridge-simple-schema-2", {
    default(v) {
      SimpleSchema2Bridge = v;
    }

  }, 6);
  let useParams;
  module1.link("react-router", {
    useParams(v) {
      useParams = v;
    }

  }, 7);
  let Stuffs;
  module1.link("../../api/stuff/Stuff", {
    Stuffs(v) {
      Stuffs = v;
    }

  }, 8);
  let LoadingSpinner;
  module1.link("../components/LoadingSpinner", {
    default(v) {
      LoadingSpinner = v;
    }

  }, 9);

  ___INIT_METEOR_FAST_REFRESH(module);

  var _s = $RefreshSig$();

  const bridge = new SimpleSchema2Bridge(Stuffs.schema);
  /* Renders the EditStuff page for editing a single document. */

  const EditStuff = () => {
    _s(); // Get the documentID from the URL field. See imports/ui/layouts/App.jsx for the route containing :_id.


    const {
      _id
    } = useParams(); // console.log('EditStuff', _id);
    // useTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker

    const {
      doc,
      ready
    } = useTracker(() => {
      // Get access to Stuff documents.
      const subscription = Meteor.subscribe(Stuffs.userPublicationName); // Determine if the subscription is ready

      const rdy = subscription.ready(); // Get the document

      const document = Stuffs.collection.findOne(_id);
      return {
        doc: document,
        ready: rdy
      };
    }, [_id]); // console.log('EditStuff', doc, ready);
    // On successful submit, insert the data.

    const submit = data => {
      const {
        name,
        quantity,
        condition
      } = data;
      Stuffs.collection.update(_id, {
        $set: {
          name,
          quantity,
          condition
        }
      }, error => error ? swal('Error', error.message, 'error') : swal('Success', 'Item updated successfully', 'success'));
    };

    return ready ? /*#__PURE__*/React.createElement(Container, {
      className: "py-3"
    }, /*#__PURE__*/React.createElement(Row, {
      className: "justify-content-center"
    }, /*#__PURE__*/React.createElement(Col, {
      xs: 5
    }, /*#__PURE__*/React.createElement(Col, {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("h2", null, "Edit Stuff")), /*#__PURE__*/React.createElement(AutoForm, {
      schema: bridge,
      onSubmit: data => submit(data),
      model: doc
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Card.Body, null, /*#__PURE__*/React.createElement(TextField, {
      name: "name"
    }), /*#__PURE__*/React.createElement(NumField, {
      name: "quantity",
      decimal: null
    }), /*#__PURE__*/React.createElement(SelectField, {
      name: "condition"
    }), /*#__PURE__*/React.createElement(SubmitField, {
      value: "Submit"
    }), /*#__PURE__*/React.createElement(ErrorsField, null), /*#__PURE__*/React.createElement(HiddenField, {
      name: "owner"
    }))))))) : /*#__PURE__*/React.createElement(LoadingSpinner, null);
  };

  _s(EditStuff, "Rw5OWIrhVrsh6pHEWaV9PjClcSg=", false, function () {
    return [useParams, useTracker];
  });

  _c = EditStuff;
  module1.exportDefault(EditStuff);

  var _c;

  $RefreshReg$(_c, "EditStuff");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"GroupedBarChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/GroupedBarChart.jsx                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    CategoryScale(v) {
      CategoryScale = v;
    },

    LinearScale(v) {
      LinearScale = v;
    },

    BarElement(v) {
      BarElement = v;
    },

    Title(v) {
      Title = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Bar;
  module1.link("react-chartjs-2", {
    Bar(v) {
      Bar = v;
    }

  }, 2);
  let faker;
  module1.link("faker", {
    default(v) {
      faker = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Grouped'
      }
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  };
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data = {
    labels,
    datasets: [{
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      backgroundColor: 'rgb(255, 99, 132)',
      stack: 'Stack 0'
    }, {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      backgroundColor: 'rgb(75, 192, 192)',
      stack: 'Stack 0'
    }, {
      label: 'Dataset 3',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      backgroundColor: 'rgb(53, 162, 235)',
      stack: 'Stack 1'
    }]
  };

  const GroupedBarChart = () => /*#__PURE__*/React.createElement(Bar, {
    options: options,
    data: data
  });

  _c = GroupedBarChart;
  module1.exportDefault(GroupedBarChart);

  var _c;

  $RefreshReg$(_c, "GroupedBarChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Landing.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/Landing.jsx                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Col, Container, Image, Row;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Image(v) {
      Image = v;
    },

    Row(v) {
      Row = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  /* A simple static component to render some text for the landing page. */
  const Landing = () => /*#__PURE__*/React.createElement(Container, {
    id: "landing-page",
    fluid: true,
    className: "py-3"
  }, /*#__PURE__*/React.createElement(Row, {
    className: "align-middle text-center"
  }, /*#__PURE__*/React.createElement(Col, {
    xs: 4
  }, /*#__PURE__*/React.createElement(Image, {
    roundedCircle: true,
    src: "/images/meteor-logo.png",
    width: "150px"
  })), /*#__PURE__*/React.createElement(Col, {
    xs: 8,
    className: "d-flex flex-column justify-content-center"
  }, /*#__PURE__*/React.createElement("h1", null, "Welcome to this template"), /*#__PURE__*/React.createElement("p", null, "Now get to work and modify this app!"))));

  _c = Landing;
  module1.exportDefault(Landing);

  var _c;

  $RefreshReg$(_c, "Landing");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"LineChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/LineChart.jsx                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    CategoryScale(v) {
      CategoryScale = v;
    },

    LinearScale(v) {
      LinearScale = v;
    },

    PointElement(v) {
      PointElement = v;
    },

    LineElement(v) {
      LineElement = v;
    },

    Title(v) {
      Title = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Line;
  module1.link("react-chartjs-2", {
    Line(v) {
      Line = v;
    }

  }, 2);
  let faker;
  module1.link("faker", {
    default(v) {
      faker = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart'
      }
    }
  };
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data = {
    labels,
    datasets: [{
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }, {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }]
  };

  const LineChart = () => /*#__PURE__*/React.createElement(Line, {
    options: options,
    data: data
  });

  _c = LineChart;
  module1.exportDefault(LineChart);

  var _c;

  $RefreshReg$(_c, "LineChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ListStuff.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/ListStuff.jsx                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 1);
  let Col, Container, Row, Table;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    },

    Table(v) {
      Table = v;
    }

  }, 2);
  let useTracker;
  module1.link("meteor/react-meteor-data", {
    useTracker(v) {
      useTracker = v;
    }

  }, 3);
  let Stuffs;
  module1.link("../../api/stuff/Stuff", {
    Stuffs(v) {
      Stuffs = v;
    }

  }, 4);
  let StuffItem;
  module1.link("../components/StuffItem", {
    default(v) {
      StuffItem = v;
    }

  }, 5);
  let LoadingSpinner;
  module1.link("../components/LoadingSpinner", {
    default(v) {
      LoadingSpinner = v;
    }

  }, 6);

  ___INIT_METEOR_FAST_REFRESH(module);

  var _s = $RefreshSig$();

  /* Renders a table containing all of the Stuff documents. Use <StuffItem> to render each row. */
  const ListStuff = () => {
    _s(); // useTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker


    const {
      ready,
      stuffs
    } = useTracker(() => {
      // Note that this subscription will get cleaned up
      // when your component is unmounted or deps change.
      // Get access to Stuff documents.
      const subscription = Meteor.subscribe(Stuffs.userPublicationName); // Determine if the subscription is ready

      const rdy = subscription.ready(); // Get the Stuff documents

      const stuffItems = Stuffs.collection.find({}).fetch();
      return {
        stuffs: stuffItems,
        ready: rdy
      };
    }, []);
    return ready ? /*#__PURE__*/React.createElement(Container, {
      className: "py-3"
    }, /*#__PURE__*/React.createElement(Row, {
      className: "justify-content-center"
    }, /*#__PURE__*/React.createElement(Col, {
      md: 7
    }, /*#__PURE__*/React.createElement(Col, {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("h2", null, "List Stuff")), /*#__PURE__*/React.createElement(Table, {
      striped: true,
      bordered: true,
      hover: true
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Quantity"), /*#__PURE__*/React.createElement("th", null, "Condition"), /*#__PURE__*/React.createElement("th", null, "Edit"))), /*#__PURE__*/React.createElement("tbody", null, stuffs.map(stuff => /*#__PURE__*/React.createElement(StuffItem, {
      key: stuff._id,
      stuff: stuff
    }))))))) : /*#__PURE__*/React.createElement(LoadingSpinner, null);
  };

  _s(ListStuff, "Bz3lRQTAa7sEs4b5Z5TIVBA8hCY=", false, function () {
    return [useTracker];
  });

  _c = ListStuff;
  module1.exportDefault(ListStuff);

  var _c;

  $RefreshReg$(_c, "ListStuff");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ListStuffAdmin.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/ListStuffAdmin.jsx                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 1);
  let useTracker;
  module1.link("meteor/react-meteor-data", {
    useTracker(v) {
      useTracker = v;
    }

  }, 2);
  let Col, Container, Row, Table;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    },

    Table(v) {
      Table = v;
    }

  }, 3);
  let Stuffs;
  module1.link("../../api/stuff/Stuff", {
    Stuffs(v) {
      Stuffs = v;
    }

  }, 4);
  let StuffItemAdmin;
  module1.link("../components/StuffItemAdmin", {
    default(v) {
      StuffItemAdmin = v;
    }

  }, 5);
  let LoadingSpinner;
  module1.link("../components/LoadingSpinner", {
    default(v) {
      LoadingSpinner = v;
    }

  }, 6);

  ___INIT_METEOR_FAST_REFRESH(module);

  var _s = $RefreshSig$();

  /* Renders a table containing all of the Stuff documents. Use <StuffItemAdmin> to render each row. */
  const ListStuffAdmin = () => {
    _s(); // useTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker


    const {
      stuffs,
      ready
    } = useTracker(() => {
      // Get access to Stuff documents.
      const subscription = Meteor.subscribe(Stuffs.adminPublicationName); // Determine if the subscription is ready

      const rdy = subscription.ready(); // Get the Stuff documents

      const items = Stuffs.collection.find({}).fetch();
      return {
        stuffs: items,
        ready: rdy
      };
    }, []);
    return ready ? /*#__PURE__*/React.createElement(Container, {
      className: "py-3"
    }, /*#__PURE__*/React.createElement(Row, {
      className: "justify-content-center"
    }, /*#__PURE__*/React.createElement(Col, {
      md: 7
    }, /*#__PURE__*/React.createElement(Col, {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("h2", null, "List Stuff (Admin)")), /*#__PURE__*/React.createElement(Table, {
      striped: true,
      bordered: true,
      hover: true
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Quantity"), /*#__PURE__*/React.createElement("th", null, "Condition"), /*#__PURE__*/React.createElement("th", null, "Owner"))), /*#__PURE__*/React.createElement("tbody", null, stuffs.map(stuff => /*#__PURE__*/React.createElement(StuffItemAdmin, {
      key: stuff._id,
      stuff: stuff
    }))))))) : /*#__PURE__*/React.createElement(LoadingSpinner, null);
  };

  _s(ListStuffAdmin, "EiA6RavvcyW2WhB9LtqS8YRS2Pg=", false, function () {
    return [useTracker];
  });

  _c = ListStuffAdmin;
  module1.exportDefault(ListStuffAdmin);

  var _c;

  $RefreshReg$(_c, "ListStuffAdmin");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"NotAuthorized.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/NotAuthorized.jsx                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Col, Container, Row;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  /** Render a Not Found page if the user enters a URL that doesn't match any route. */
  const NotAuthorized = () => /*#__PURE__*/React.createElement(Container, {
    className: "py-3"
  }, /*#__PURE__*/React.createElement(Row, {
    className: "justify-content-center"
  }, /*#__PURE__*/React.createElement(Col, {
    xs: 4,
    className: "text-center"
  }, /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement("p", null, "Not Authorized")))));

  _c = NotAuthorized;
  module1.exportDefault(NotAuthorized);

  var _c;

  $RefreshReg$(_c, "NotAuthorized");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"NotFound.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/NotFound.jsx                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Col, Container, Row;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  /** Render a Not Found page if the user enters a URL that doesn't match any route. */
  const NotFound = () => /*#__PURE__*/React.createElement(Container, {
    className: "py-3"
  }, /*#__PURE__*/React.createElement(Row, {
    className: "justify-content-center"
  }, /*#__PURE__*/React.createElement(Col, {
    xs: 4,
    className: "text-center"
  }, /*#__PURE__*/React.createElement("h2", null, /*#__PURE__*/React.createElement("p", null, "Page not found")))));

  _c = NotFound;
  module1.exportDefault(NotFound);

  var _c;

  $RefreshReg$(_c, "NotFound");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"PieChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/PieChart.jsx                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, ArcElement, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    ArcElement(v) {
      ArcElement = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Pie;
  module1.link("react-chartjs-2", {
    Pie(v) {
      Pie = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(ArcElement, Tooltip, Legend);
  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
      borderWidth: 1
    }]
  };

  const PieChart = () => /*#__PURE__*/React.createElement(Pie, {
    data: data
  });

  _c = PieChart;
  module1.exportDefault(PieChart);

  var _c;

  $RefreshReg$(_c, "PieChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ScatterChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/ScatterChart.jsx                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    LinearScale(v) {
      LinearScale = v;
    },

    PointElement(v) {
      PointElement = v;
    },

    LineElement(v) {
      LineElement = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Scatter;
  module1.link("react-chartjs-2", {
    Scatter(v) {
      Scatter = v;
    }

  }, 2);
  let faker;
  module1.link("faker", {
    default(v) {
      faker = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);
  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data = {
    datasets: [{
      label: 'A dataset',
      data: Array.from({
        length: 100
      }, () => ({
        x: faker.datatype.number({
          min: -100,
          max: 100
        }),
        y: faker.datatype.number({
          min: -100,
          max: 100
        })
      })),
      backgroundColor: 'rgba(255, 99, 132, 1)'
    }]
  };

  const ScatterChart = () => /*#__PURE__*/React.createElement(Scatter, {
    options: options,
    data: data
  });

  _c = ScatterChart;
  module1.exportDefault(ScatterChart);

  var _c;

  $RefreshReg$(_c, "ScatterChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SignIn.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/SignIn.jsx                                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },

    useState(v) {
      useState = v;
    }

  }, 0);
  let Link, Navigate;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    },

    Navigate(v) {
      Navigate = v;
    }

  }, 1);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 2);
  let Alert, Card, Col, Container, Row;
  module1.link("react-bootstrap", {
    Alert(v) {
      Alert = v;
    },

    Card(v) {
      Card = v;
    },

    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    }

  }, 3);
  let SimpleSchema;
  module1.link("simpl-schema", {
    default(v) {
      SimpleSchema = v;
    }

  }, 4);
  let SimpleSchema2Bridge;
  module1.link("uniforms-bridge-simple-schema-2", {
    default(v) {
      SimpleSchema2Bridge = v;
    }

  }, 5);
  let AutoForm, ErrorsField, SubmitField, TextField;
  module1.link("uniforms-bootstrap5", {
    AutoForm(v) {
      AutoForm = v;
    },

    ErrorsField(v) {
      ErrorsField = v;
    },

    SubmitField(v) {
      SubmitField = v;
    },

    TextField(v) {
      TextField = v;
    }

  }, 6);

  ___INIT_METEOR_FAST_REFRESH(module);

  var _s = $RefreshSig$();

  /**
   * Signin page overrides the form’s submit event and call Meteor’s loginWithPassword().
   * Authentication errors modify the component’s state to be displayed
   */
  const SignIn = () => {
    _s();

    const [error, setError] = useState('');
    const [redirect, setRedirect] = useState(false);
    const schema = new SimpleSchema({
      email: String,
      password: String
    });
    const bridge = new SimpleSchema2Bridge(schema); // Handle Signin submission using Meteor's account mechanism.

    const submit = doc => {
      // console.log('submit', doc, redirect);
      const {
        email,
        password
      } = doc;
      Meteor.loginWithPassword(email, password, err => {
        if (err) {
          setError(err.reason);
        } else {
          setRedirect(true);
        }
      }); // console.log('submit2', email, password, error, redirect);
    }; // Render the signin form.
    // console.log('render', error, redirect);
    // if correct authentication, redirect to page instead of login screen


    if (redirect) {
      return /*#__PURE__*/React.createElement(Navigate, {
        to: "/"
      });
    } // Otherwise return the Login form.


    return /*#__PURE__*/React.createElement(Container, {
      id: "signin-page",
      className: "py-3"
    }, /*#__PURE__*/React.createElement(Row, {
      className: "justify-content-center"
    }, /*#__PURE__*/React.createElement(Col, {
      xs: 5
    }, /*#__PURE__*/React.createElement(Col, {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("h2", null, "Login to your account")), /*#__PURE__*/React.createElement(AutoForm, {
      schema: bridge,
      onSubmit: data => submit(data)
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Card.Body, null, /*#__PURE__*/React.createElement(TextField, {
      id: "signin-form-email",
      name: "email",
      placeholder: "E-mail address"
    }), /*#__PURE__*/React.createElement(TextField, {
      id: "signin-form-password",
      name: "password",
      placeholder: "Password",
      type: "password"
    }), /*#__PURE__*/React.createElement(ErrorsField, null), /*#__PURE__*/React.createElement(SubmitField, {
      id: "signin-form-submit"
    })))), /*#__PURE__*/React.createElement(Alert, {
      variant: "light"
    }, /*#__PURE__*/React.createElement(Link, {
      to: "/signup"
    }, "Click here to Register")), error === '' ? '' : /*#__PURE__*/React.createElement(Alert, {
      variant: "danger"
    }, /*#__PURE__*/React.createElement(Alert.Heading, null, "Login was not successful"), error))));
  };

  _s(SignIn, "2Iyp3CbhTQZpE3rcbiGnlh8yh+g=");

  _c = SignIn;
  module1.exportDefault(SignIn);

  var _c;

  $RefreshReg$(_c, "SignIn");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SignOut.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/SignOut.jsx                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }

  }, 1);
  let Col;
  module1.link("react-bootstrap", {
    Col(v) {
      Col = v;
    }

  }, 2);

  ___INIT_METEOR_FAST_REFRESH(module);

  /* After the user clicks the "SignOut" link in the NavBar, log them out and display this page. */
  const SignOut = () => {
    Meteor.logout();
    return /*#__PURE__*/React.createElement(Col, {
      id: "signout-page",
      className: "text-center py-3"
    }, /*#__PURE__*/React.createElement("h2", null, "You are signed out."));
  };

  _c = SignOut;
  module1.exportDefault(SignOut);

  var _c;

  $RefreshReg$(_c, "SignOut");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SignUp.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/SignUp.jsx                                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },

    useState(v) {
      useState = v;
    }

  }, 0);
  let PropTypes;
  module1.link("prop-types", {
    default(v) {
      PropTypes = v;
    }

  }, 1);
  let Link, Navigate;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    },

    Navigate(v) {
      Navigate = v;
    }

  }, 2);
  let Accounts;
  module1.link("meteor/accounts-base", {
    Accounts(v) {
      Accounts = v;
    }

  }, 3);
  let Alert, Card, Col, Container, Row;
  module1.link("react-bootstrap", {
    Alert(v) {
      Alert = v;
    },

    Card(v) {
      Card = v;
    },

    Col(v) {
      Col = v;
    },

    Container(v) {
      Container = v;
    },

    Row(v) {
      Row = v;
    }

  }, 4);
  let SimpleSchema;
  module1.link("simpl-schema", {
    default(v) {
      SimpleSchema = v;
    }

  }, 5);
  let SimpleSchema2Bridge;
  module1.link("uniforms-bridge-simple-schema-2", {
    default(v) {
      SimpleSchema2Bridge = v;
    }

  }, 6);
  let AutoForm, ErrorsField, SubmitField, TextField;
  module1.link("uniforms-bootstrap5", {
    AutoForm(v) {
      AutoForm = v;
    },

    ErrorsField(v) {
      ErrorsField = v;
    },

    SubmitField(v) {
      SubmitField = v;
    },

    TextField(v) {
      TextField = v;
    }

  }, 7);

  ___INIT_METEOR_FAST_REFRESH(module);

  var _s = $RefreshSig$();

  /**
   * SignUp component is similar to signin component, but we create a new user instead.
   */
  const SignUp = _ref => {
    let {
      location
    } = _ref;

    _s();

    const [error, setError] = useState('');
    const [redirectToReferer, setRedirectToRef] = useState(false);
    const schema = new SimpleSchema({
      email: String,
      password: String
    });
    const bridge = new SimpleSchema2Bridge(schema);
    /* Handle SignUp submission. Create user account and a profile entry, then redirect to the home page. */

    const submit = doc => {
      const {
        email,
        password
      } = doc;
      Accounts.createUser({
        email,
        username: email,
        password
      }, err => {
        if (err) {
          setError(err.reason);
        } else {
          setError('');
          setRedirectToRef(true);
        }
      });
    };
    /* Display the signup form. Redirect to add page after successful registration and login. */


    const {
      from
    } = (location === null || location === void 0 ? void 0 : location.state) || {
      from: {
        pathname: '/add'
      }
    }; // if correct authentication, redirect to from: page instead of signup screen

    if (redirectToReferer) {
      return /*#__PURE__*/React.createElement(Navigate, {
        to: from
      });
    }

    return /*#__PURE__*/React.createElement(Container, {
      id: "signup-page",
      className: "py-3"
    }, /*#__PURE__*/React.createElement(Row, {
      className: "justify-content-center"
    }, /*#__PURE__*/React.createElement(Col, {
      xs: 5
    }, /*#__PURE__*/React.createElement(Col, {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("h2", null, "Register your account")), /*#__PURE__*/React.createElement(AutoForm, {
      schema: bridge,
      onSubmit: data => submit(data)
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Card.Body, null, /*#__PURE__*/React.createElement(TextField, {
      name: "email",
      placeholder: "E-mail address"
    }), /*#__PURE__*/React.createElement(TextField, {
      name: "password",
      placeholder: "Password",
      type: "password"
    }), /*#__PURE__*/React.createElement(ErrorsField, null), /*#__PURE__*/React.createElement(SubmitField, null)))), /*#__PURE__*/React.createElement(Alert, {
      variant: "light"
    }, "Already have an account? Login", ' ', /*#__PURE__*/React.createElement(Link, {
      to: "/signin"
    }, "here")), error === '' ? '' : /*#__PURE__*/React.createElement(Alert, {
      variant: "danger"
    }, /*#__PURE__*/React.createElement(Alert.Heading, null, "Registration was not successful"), error))));
  };
  /* Ensure that the React Router location object is available in case we need to redirect. */


  _s(SignUp, "wspvmSiFhlGWaCirMzhbx5Bgeq4=");

  _c = SignUp;
  SignUp.propTypes = {
    location: PropTypes.shape({
      state: PropTypes.string
    })
  };
  SignUp.defaultProps = {
    location: {
      state: ''
    }
  };
  module1.exportDefault(SignUp);

  var _c;

  $RefreshReg$(_c, "SignUp");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"StackedBarChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/StackedBarChart.jsx                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    CategoryScale(v) {
      CategoryScale = v;
    },

    LinearScale(v) {
      LinearScale = v;
    },

    BarElement(v) {
      BarElement = v;
    },

    Title(v) {
      Title = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Bar;
  module1.link("react-chartjs-2", {
    Bar(v) {
      Bar = v;
    }

  }, 2);
  let faker;
  module1.link("faker", {
    default(v) {
      faker = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked'
      }
    },
    responsive: true,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  };
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data = {
    labels,
    datasets: [{
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      backgroundColor: 'rgb(255, 99, 132)'
    }, {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      backgroundColor: 'rgb(75, 192, 192)'
    }, {
      label: 'Dataset 3',
      data: labels.map(() => faker.datatype.number({
        min: -1000,
        max: 1000
      })),
      backgroundColor: 'rgb(53, 162, 235)'
    }]
  };

  const StackedBarChart = () => /*#__PURE__*/React.createElement(Bar, {
    options: options,
    data: data
  });

  _c = StackedBarChart;
  module1.exportDefault(StackedBarChart);

  var _c;

  $RefreshReg$(_c, "StackedBarChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"VerticalBarChart.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/VerticalBarChart.jsx                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend;
  module1.link("chart.js", {
    Chart(v) {
      ChartJS = v;
    },

    CategoryScale(v) {
      CategoryScale = v;
    },

    LinearScale(v) {
      LinearScale = v;
    },

    BarElement(v) {
      BarElement = v;
    },

    Title(v) {
      Title = v;
    },

    Tooltip(v) {
      Tooltip = v;
    },

    Legend(v) {
      Legend = v;
    }

  }, 1);
  let Bar;
  module1.link("react-chartjs-2", {
    Bar(v) {
      Bar = v;
    }

  }, 2);
  let faker;
  module1.link("faker", {
    default(v) {
      faker = v;
    }

  }, 3);

  ___INIT_METEOR_FAST_REFRESH(module);

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart'
      }
    }
  };
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data = {
    labels,
    datasets: [{
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({
        min: 0,
        max: 1000
      })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }, {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({
        min: 0,
        max: 1000
      })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)'
    }]
  };

  const VerticalBarChart = () => /*#__PURE__*/React.createElement(Bar, {
    options: options,
    data: data
  });

  _c = VerticalBarChart;
  module1.exportDefault(VerticalBarChart);

  var _c;

  $RefreshReg$(_c, "VerticalBarChart");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"X.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/ui/pages/X.jsx                                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }

  }, 0);
  let MainMenu;
  module1.link("../components/MainMenu", {
    default(v) {
      MainMenu = v;
    }

  }, 1);

  ___INIT_METEOR_FAST_REFRESH(module);

  const X = () => /*#__PURE__*/React.createElement(MainMenu, null);

  _c = X;
  module1.exportDefault(X);

  var _c;

  $RefreshReg$(_c, "X");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".css",
    ".mjs",
    ".jsx"
  ]
});

require("/client/template.main.js");
require("/client/main.js");