var require = meteorInstall({"imports":{"api":{"stuff":{"Stuff.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/api/stuff/Stuff.js                                                                                      //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  Stuffs: () => Stuffs
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Tracker;
module.link("meteor/tracker", {
  Tracker(v) {
    Tracker = v;
  }

}, 2);

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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"startup":{"server":{"Accounts.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/startup/server/Accounts.js                                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 1);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 2);

/* eslint-disable no-console */
const createUser = (email, password, role) => {
  console.log("  Creating user ".concat(email, "."));
  const userID = Accounts.createUser({
    username: email,
    email: email,
    password: password
  });

  if (role === 'admin') {
    Roles.createRole(role, {
      unlessExists: true
    });
    Roles.addUsersToRoles(userID, 'admin');
  }
}; // When running app for first time, pass a settings file to set up a default user account.


if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log('Creating the default user(s)');
    Meteor.settings.defaultAccounts.forEach(_ref => {
      let {
        email,
        password,
        role
      } = _ref;
      return createUser(email, password, role);
    });
  } else {
    console.log('Cannot initialize the database!  Please invoke meteor with a settings file.');
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Mongo.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/startup/server/Mongo.js                                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Stuffs;
module.link("../../api/stuff/Stuff.js", {
  Stuffs(v) {
    Stuffs = v;
  }

}, 1);

/* eslint-disable no-console */
// Initialize the database with a default data document.
const addData = data => {
  console.log("  Adding: ".concat(data.name, " (").concat(data.owner, ")"));
  Stuffs.collection.insert(data);
}; // Initialize the StuffsCollection if empty.


if (Stuffs.collection.find().count() === 0) {
  if (Meteor.settings.defaultData) {
    console.log('Creating default data.');
    Meteor.settings.defaultData.forEach(data => addData(data));
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Publications.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// imports/startup/server/Publications.js                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 1);
let Stuffs;
module.link("../../api/stuff/Stuff", {
  Stuffs(v) {
    Stuffs = v;
  }

}, 2);
// User-level publication.
// If logged in, then publish documents owned by this user. Otherwise publish nothing.
Meteor.publish(Stuffs.userPublicationName, function () {
  if (this.userId) {
    const username = Meteor.users.findOne(this.userId).username;
    return Stuffs.collection.find({
      owner: username
    });
  }

  return this.ready();
}); // Admin-level publication.
// If logged in and with admin role, then publish all documents from all users. Otherwise publish nothing.

Meteor.publish(Stuffs.adminPublicationName, function () {
  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Stuffs.collection.find();
  }

  return this.ready();
}); // alanning:roles publication
// Recommended code to publish roles for each user.

Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({
      'user._id': this.userId
    });
  }

  return this.ready();
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"server":{"main.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// server/main.js                                                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.link("/imports/startup/server/Accounts");
module.link("/imports/startup/server/Publications");
module.link("/imports/startup/server/Mongo");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".mjs",
    ".jsx"
  ]
});

require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvc3R1ZmYvU3R1ZmYuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvQWNjb3VudHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvTW9uZ28uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvUHVibGljYXRpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJTdHVmZnMiLCJNb25nbyIsImxpbmsiLCJ2IiwiU2ltcGxlU2NoZW1hIiwiZGVmYXVsdCIsIlRyYWNrZXIiLCJTdHVmZnNDb2xsZWN0aW9uIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiY29sbGVjdGlvbiIsIkNvbGxlY3Rpb24iLCJzY2hlbWEiLCJTdHJpbmciLCJxdWFudGl0eSIsIk51bWJlciIsIm93bmVyIiwiY29uZGl0aW9uIiwidHlwZSIsImFsbG93ZWRWYWx1ZXMiLCJkZWZhdWx0VmFsdWUiLCJ0cmFja2VyIiwiYXR0YWNoU2NoZW1hIiwidXNlclB1YmxpY2F0aW9uTmFtZSIsImFkbWluUHVibGljYXRpb25OYW1lIiwiTWV0ZW9yIiwiQWNjb3VudHMiLCJSb2xlcyIsImNyZWF0ZVVzZXIiLCJlbWFpbCIsInBhc3N3b3JkIiwicm9sZSIsImNvbnNvbGUiLCJsb2ciLCJ1c2VySUQiLCJ1c2VybmFtZSIsImNyZWF0ZVJvbGUiLCJ1bmxlc3NFeGlzdHMiLCJhZGRVc2Vyc1RvUm9sZXMiLCJ1c2VycyIsImZpbmQiLCJjb3VudCIsInNldHRpbmdzIiwiZGVmYXVsdEFjY291bnRzIiwiZm9yRWFjaCIsImFkZERhdGEiLCJkYXRhIiwiaW5zZXJ0IiwiZGVmYXVsdERhdGEiLCJwdWJsaXNoIiwidXNlcklkIiwiZmluZE9uZSIsInJlYWR5IiwidXNlcklzSW5Sb2xlIiwicm9sZUFzc2lnbm1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLFFBQU0sRUFBQyxNQUFJQTtBQUFaLENBQWQ7QUFBbUMsSUFBSUMsS0FBSjtBQUFVSCxNQUFNLENBQUNJLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNELE9BQUssQ0FBQ0UsQ0FBRCxFQUFHO0FBQUNGLFNBQUssR0FBQ0UsQ0FBTjtBQUFROztBQUFsQixDQUEzQixFQUErQyxDQUEvQztBQUFrRCxJQUFJQyxZQUFKO0FBQWlCTixNQUFNLENBQUNJLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNHLFNBQU8sQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNDLGdCQUFZLEdBQUNELENBQWI7QUFBZTs7QUFBM0IsQ0FBM0IsRUFBd0QsQ0FBeEQ7QUFBMkQsSUFBSUcsT0FBSjtBQUFZUixNQUFNLENBQUNJLElBQVAsQ0FBWSxnQkFBWixFQUE2QjtBQUFDSSxTQUFPLENBQUNILENBQUQsRUFBRztBQUFDRyxXQUFPLEdBQUNILENBQVI7QUFBVTs7QUFBdEIsQ0FBN0IsRUFBcUQsQ0FBckQ7O0FBSXZMO0FBQ0E7QUFDQTtBQUNBLE1BQU1JLGdCQUFOLENBQXVCO0FBQ3JCQyxhQUFXLEdBQUc7QUFDWjtBQUNBLFNBQUtDLElBQUwsR0FBWSxrQkFBWixDQUZZLENBR1o7O0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixJQUFJVCxLQUFLLENBQUNVLFVBQVYsQ0FBcUIsS0FBS0YsSUFBMUIsQ0FBbEIsQ0FKWSxDQUtaOztBQUNBLFNBQUtHLE1BQUwsR0FBYyxJQUFJUixZQUFKLENBQWlCO0FBQzdCSyxVQUFJLEVBQUVJLE1BRHVCO0FBRTdCQyxjQUFRLEVBQUVDLE1BRm1CO0FBRzdCQyxXQUFLLEVBQUVILE1BSHNCO0FBSTdCSSxlQUFTLEVBQUU7QUFDVEMsWUFBSSxFQUFFTCxNQURHO0FBRVRNLHFCQUFhLEVBQUUsQ0FBQyxXQUFELEVBQWMsTUFBZCxFQUFzQixNQUF0QixFQUE4QixNQUE5QixDQUZOO0FBR1RDLG9CQUFZLEVBQUU7QUFITDtBQUprQixLQUFqQixFQVNYO0FBQUVDLGFBQU8sRUFBRWY7QUFBWCxLQVRXLENBQWQsQ0FOWSxDQWdCWjs7QUFDQSxTQUFLSSxVQUFMLENBQWdCWSxZQUFoQixDQUE2QixLQUFLVixNQUFsQyxFQWpCWSxDQWtCWjs7QUFDQSxTQUFLVyxtQkFBTCxhQUE4QixLQUFLZCxJQUFuQztBQUNBLFNBQUtlLG9CQUFMLGFBQStCLEtBQUtmLElBQXBDO0FBQ0Q7O0FBdEJvQjtBQXlCdkI7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLE1BQU1ULE1BQU0sR0FBRyxJQUFJTyxnQkFBSixFQUFmLEM7Ozs7Ozs7Ozs7O0FDcENQLElBQUlrQixNQUFKO0FBQVczQixNQUFNLENBQUNJLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUN1QixRQUFNLENBQUN0QixDQUFELEVBQUc7QUFBQ3NCLFVBQU0sR0FBQ3RCLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSXVCLFFBQUo7QUFBYTVCLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLHNCQUFaLEVBQW1DO0FBQUN3QixVQUFRLENBQUN2QixDQUFELEVBQUc7QUFBQ3VCLFlBQVEsR0FBQ3ZCLENBQVQ7QUFBVzs7QUFBeEIsQ0FBbkMsRUFBNkQsQ0FBN0Q7QUFBZ0UsSUFBSXdCLEtBQUo7QUFBVTdCLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLHVCQUFaLEVBQW9DO0FBQUN5QixPQUFLLENBQUN4QixDQUFELEVBQUc7QUFBQ3dCLFNBQUssR0FBQ3hCLENBQU47QUFBUTs7QUFBbEIsQ0FBcEMsRUFBd0QsQ0FBeEQ7O0FBSXZKO0FBRUEsTUFBTXlCLFVBQVUsR0FBRyxDQUFDQyxLQUFELEVBQVFDLFFBQVIsRUFBa0JDLElBQWxCLEtBQTJCO0FBQzVDQyxTQUFPLENBQUNDLEdBQVIsMkJBQStCSixLQUEvQjtBQUNBLFFBQU1LLE1BQU0sR0FBR1IsUUFBUSxDQUFDRSxVQUFULENBQW9CO0FBQ2pDTyxZQUFRLEVBQUVOLEtBRHVCO0FBRWpDQSxTQUFLLEVBQUVBLEtBRjBCO0FBR2pDQyxZQUFRLEVBQUVBO0FBSHVCLEdBQXBCLENBQWY7O0FBS0EsTUFBSUMsSUFBSSxLQUFLLE9BQWIsRUFBc0I7QUFDcEJKLFNBQUssQ0FBQ1MsVUFBTixDQUFpQkwsSUFBakIsRUFBdUI7QUFBRU0sa0JBQVksRUFBRTtBQUFoQixLQUF2QjtBQUNBVixTQUFLLENBQUNXLGVBQU4sQ0FBc0JKLE1BQXRCLEVBQThCLE9BQTlCO0FBQ0Q7QUFDRixDQVhELEMsQ0FhQTs7O0FBQ0EsSUFBSVQsTUFBTSxDQUFDYyxLQUFQLENBQWFDLElBQWIsR0FBb0JDLEtBQXBCLE9BQWdDLENBQXBDLEVBQXVDO0FBQ3JDLE1BQUloQixNQUFNLENBQUNpQixRQUFQLENBQWdCQyxlQUFwQixFQUFxQztBQUNuQ1gsV0FBTyxDQUFDQyxHQUFSLENBQVksOEJBQVo7QUFDQVIsVUFBTSxDQUFDaUIsUUFBUCxDQUFnQkMsZUFBaEIsQ0FBZ0NDLE9BQWhDLENBQXdDO0FBQUEsVUFBQztBQUFFZixhQUFGO0FBQVNDLGdCQUFUO0FBQW1CQztBQUFuQixPQUFEO0FBQUEsYUFBK0JILFVBQVUsQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLEVBQWtCQyxJQUFsQixDQUF6QztBQUFBLEtBQXhDO0FBQ0QsR0FIRCxNQUdPO0FBQ0xDLFdBQU8sQ0FBQ0MsR0FBUixDQUFZLDZFQUFaO0FBQ0Q7QUFDRixDOzs7Ozs7Ozs7OztBQzNCRCxJQUFJUixNQUFKO0FBQVczQixNQUFNLENBQUNJLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUN1QixRQUFNLENBQUN0QixDQUFELEVBQUc7QUFBQ3NCLFVBQU0sR0FBQ3RCLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSUgsTUFBSjtBQUFXRixNQUFNLENBQUNJLElBQVAsQ0FBWSwwQkFBWixFQUF1QztBQUFDRixRQUFNLENBQUNHLENBQUQsRUFBRztBQUFDSCxVQUFNLEdBQUNHLENBQVA7QUFBUzs7QUFBcEIsQ0FBdkMsRUFBNkQsQ0FBN0Q7O0FBRzNFO0FBRUE7QUFDQSxNQUFNMEMsT0FBTyxHQUFJQyxJQUFELElBQVU7QUFDeEJkLFNBQU8sQ0FBQ0MsR0FBUixxQkFBeUJhLElBQUksQ0FBQ3JDLElBQTlCLGVBQXVDcUMsSUFBSSxDQUFDOUIsS0FBNUM7QUFDQWhCLFFBQU0sQ0FBQ1UsVUFBUCxDQUFrQnFDLE1BQWxCLENBQXlCRCxJQUF6QjtBQUNELENBSEQsQyxDQUtBOzs7QUFDQSxJQUFJOUMsTUFBTSxDQUFDVSxVQUFQLENBQWtCOEIsSUFBbEIsR0FBeUJDLEtBQXpCLE9BQXFDLENBQXpDLEVBQTRDO0FBQzFDLE1BQUloQixNQUFNLENBQUNpQixRQUFQLENBQWdCTSxXQUFwQixFQUFpQztBQUMvQmhCLFdBQU8sQ0FBQ0MsR0FBUixDQUFZLHdCQUFaO0FBQ0FSLFVBQU0sQ0FBQ2lCLFFBQVAsQ0FBZ0JNLFdBQWhCLENBQTRCSixPQUE1QixDQUFvQ0UsSUFBSSxJQUFJRCxPQUFPLENBQUNDLElBQUQsQ0FBbkQ7QUFDRDtBQUNGLEM7Ozs7Ozs7Ozs7O0FDakJELElBQUlyQixNQUFKO0FBQVczQixNQUFNLENBQUNJLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUN1QixRQUFNLENBQUN0QixDQUFELEVBQUc7QUFBQ3NCLFVBQU0sR0FBQ3RCLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSXdCLEtBQUo7QUFBVTdCLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLHVCQUFaLEVBQW9DO0FBQUN5QixPQUFLLENBQUN4QixDQUFELEVBQUc7QUFBQ3dCLFNBQUssR0FBQ3hCLENBQU47QUFBUTs7QUFBbEIsQ0FBcEMsRUFBd0QsQ0FBeEQ7QUFBMkQsSUFBSUgsTUFBSjtBQUFXRixNQUFNLENBQUNJLElBQVAsQ0FBWSx1QkFBWixFQUFvQztBQUFDRixRQUFNLENBQUNHLENBQUQsRUFBRztBQUFDSCxVQUFNLEdBQUNHLENBQVA7QUFBUzs7QUFBcEIsQ0FBcEMsRUFBMEQsQ0FBMUQ7QUFJaEo7QUFDQTtBQUNBc0IsTUFBTSxDQUFDd0IsT0FBUCxDQUFlakQsTUFBTSxDQUFDdUIsbUJBQXRCLEVBQTJDLFlBQVk7QUFDckQsTUFBSSxLQUFLMkIsTUFBVCxFQUFpQjtBQUNmLFVBQU1mLFFBQVEsR0FBR1YsTUFBTSxDQUFDYyxLQUFQLENBQWFZLE9BQWIsQ0FBcUIsS0FBS0QsTUFBMUIsRUFBa0NmLFFBQW5EO0FBQ0EsV0FBT25DLE1BQU0sQ0FBQ1UsVUFBUCxDQUFrQjhCLElBQWxCLENBQXVCO0FBQUV4QixXQUFLLEVBQUVtQjtBQUFULEtBQXZCLENBQVA7QUFDRDs7QUFDRCxTQUFPLEtBQUtpQixLQUFMLEVBQVA7QUFDRCxDQU5ELEUsQ0FRQTtBQUNBOztBQUNBM0IsTUFBTSxDQUFDd0IsT0FBUCxDQUFlakQsTUFBTSxDQUFDd0Isb0JBQXRCLEVBQTRDLFlBQVk7QUFDdEQsTUFBSSxLQUFLMEIsTUFBTCxJQUFldkIsS0FBSyxDQUFDMEIsWUFBTixDQUFtQixLQUFLSCxNQUF4QixFQUFnQyxPQUFoQyxDQUFuQixFQUE2RDtBQUMzRCxXQUFPbEQsTUFBTSxDQUFDVSxVQUFQLENBQWtCOEIsSUFBbEIsRUFBUDtBQUNEOztBQUNELFNBQU8sS0FBS1ksS0FBTCxFQUFQO0FBQ0QsQ0FMRCxFLENBT0E7QUFDQTs7QUFDQTNCLE1BQU0sQ0FBQ3dCLE9BQVAsQ0FBZSxJQUFmLEVBQXFCLFlBQVk7QUFDL0IsTUFBSSxLQUFLQyxNQUFULEVBQWlCO0FBQ2YsV0FBT3pCLE1BQU0sQ0FBQzZCLGNBQVAsQ0FBc0JkLElBQXRCLENBQTJCO0FBQUUsa0JBQVksS0FBS1U7QUFBbkIsS0FBM0IsQ0FBUDtBQUNEOztBQUNELFNBQU8sS0FBS0UsS0FBTCxFQUFQO0FBQ0QsQ0FMRCxFOzs7Ozs7Ozs7OztBQ3pCQXRELE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGtDQUFaO0FBQWdESixNQUFNLENBQUNJLElBQVAsQ0FBWSxzQ0FBWjtBQUFvREosTUFBTSxDQUFDSSxJQUFQLENBQVksK0JBQVosRSIsImZpbGUiOiIvYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xyXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XHJcbmltcG9ydCB7IFRyYWNrZXIgfSBmcm9tICdtZXRlb3IvdHJhY2tlcic7XHJcblxyXG4vKipcclxuICogVGhlIFN0dWZmc0NvbGxlY3Rpb24uIEl0IGVuY2Fwc3VsYXRlcyBzdGF0ZSBhbmQgdmFyaWFibGUgdmFsdWVzIGZvciBzdHVmZi5cclxuICovXHJcbmNsYXNzIFN0dWZmc0NvbGxlY3Rpb24ge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgLy8gVGhlIG5hbWUgb2YgdGhpcyBjb2xsZWN0aW9uLlxyXG4gICAgdGhpcy5uYW1lID0gJ1N0dWZmc0NvbGxlY3Rpb24nO1xyXG4gICAgLy8gRGVmaW5lIHRoZSBNb25nbyBjb2xsZWN0aW9uLlxyXG4gICAgdGhpcy5jb2xsZWN0aW9uID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24odGhpcy5uYW1lKTtcclxuICAgIC8vIERlZmluZSB0aGUgc3RydWN0dXJlIG9mIGVhY2ggZG9jdW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXHJcbiAgICB0aGlzLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gICAgICBuYW1lOiBTdHJpbmcsXHJcbiAgICAgIHF1YW50aXR5OiBOdW1iZXIsXHJcbiAgICAgIG93bmVyOiBTdHJpbmcsXHJcbiAgICAgIGNvbmRpdGlvbjoge1xyXG4gICAgICAgIHR5cGU6IFN0cmluZyxcclxuICAgICAgICBhbGxvd2VkVmFsdWVzOiBbJ2V4Y2VsbGVudCcsICdnb29kJywgJ2ZhaXInLCAncG9vciddLFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogJ2dvb2QnLFxyXG4gICAgICB9LFxyXG4gICAgfSwgeyB0cmFja2VyOiBUcmFja2VyIH0pO1xyXG4gICAgLy8gQXR0YWNoIHRoZSBzY2hlbWEgdG8gdGhlIGNvbGxlY3Rpb24sIHNvIGFsbCBhdHRlbXB0cyB0byBpbnNlcnQgYSBkb2N1bWVudCBhcmUgY2hlY2tlZCBhZ2FpbnN0IHNjaGVtYS5cclxuICAgIHRoaXMuY29sbGVjdGlvbi5hdHRhY2hTY2hlbWEodGhpcy5zY2hlbWEpO1xyXG4gICAgLy8gRGVmaW5lIG5hbWVzIGZvciBwdWJsaWNhdGlvbnMgYW5kIHN1YnNjcmlwdGlvbnNcclxuICAgIHRoaXMudXNlclB1YmxpY2F0aW9uTmFtZSA9IGAke3RoaXMubmFtZX0ucHVibGljYXRpb24udXNlcmA7XHJcbiAgICB0aGlzLmFkbWluUHVibGljYXRpb25OYW1lID0gYCR7dGhpcy5uYW1lfS5wdWJsaWNhdGlvbi5hZG1pbmA7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgU3R1ZmZzQ29sbGVjdGlvbi5cclxuICogQHR5cGUge1N0dWZmc0NvbGxlY3Rpb259XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgU3R1ZmZzID0gbmV3IFN0dWZmc0NvbGxlY3Rpb24oKTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xyXG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJ21ldGVvci9hbGFubmluZzpyb2xlcyc7XHJcblxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXHJcblxyXG5jb25zdCBjcmVhdGVVc2VyID0gKGVtYWlsLCBwYXNzd29yZCwgcm9sZSkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKGAgIENyZWF0aW5nIHVzZXIgJHtlbWFpbH0uYCk7XHJcbiAgY29uc3QgdXNlcklEID0gQWNjb3VudHMuY3JlYXRlVXNlcih7XHJcbiAgICB1c2VybmFtZTogZW1haWwsXHJcbiAgICBlbWFpbDogZW1haWwsXHJcbiAgICBwYXNzd29yZDogcGFzc3dvcmQsXHJcbiAgfSk7XHJcbiAgaWYgKHJvbGUgPT09ICdhZG1pbicpIHtcclxuICAgIFJvbGVzLmNyZWF0ZVJvbGUocm9sZSwgeyB1bmxlc3NFeGlzdHM6IHRydWUgfSk7XHJcbiAgICBSb2xlcy5hZGRVc2Vyc1RvUm9sZXModXNlcklELCAnYWRtaW4nKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBXaGVuIHJ1bm5pbmcgYXBwIGZvciBmaXJzdCB0aW1lLCBwYXNzIGEgc2V0dGluZ3MgZmlsZSB0byBzZXQgdXAgYSBkZWZhdWx0IHVzZXIgYWNjb3VudC5cclxuaWYgKE1ldGVvci51c2Vycy5maW5kKCkuY291bnQoKSA9PT0gMCkge1xyXG4gIGlmIChNZXRlb3Iuc2V0dGluZ3MuZGVmYXVsdEFjY291bnRzKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgdGhlIGRlZmF1bHQgdXNlcihzKScpO1xyXG4gICAgTWV0ZW9yLnNldHRpbmdzLmRlZmF1bHRBY2NvdW50cy5mb3JFYWNoKCh7IGVtYWlsLCBwYXNzd29yZCwgcm9sZSB9KSA9PiBjcmVhdGVVc2VyKGVtYWlsLCBwYXNzd29yZCwgcm9sZSkpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ2Fubm90IGluaXRpYWxpemUgdGhlIGRhdGFiYXNlISAgUGxlYXNlIGludm9rZSBtZXRlb3Igd2l0aCBhIHNldHRpbmdzIGZpbGUuJyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBTdHVmZnMgfSBmcm9tICcuLi8uLi9hcGkvc3R1ZmYvU3R1ZmYuanMnO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB0aGUgZGF0YWJhc2Ugd2l0aCBhIGRlZmF1bHQgZGF0YSBkb2N1bWVudC5cclxuY29uc3QgYWRkRGF0YSA9IChkYXRhKSA9PiB7XHJcbiAgY29uc29sZS5sb2coYCAgQWRkaW5nOiAke2RhdGEubmFtZX0gKCR7ZGF0YS5vd25lcn0pYCk7XHJcbiAgU3R1ZmZzLmNvbGxlY3Rpb24uaW5zZXJ0KGRhdGEpO1xyXG59O1xyXG5cclxuLy8gSW5pdGlhbGl6ZSB0aGUgU3R1ZmZzQ29sbGVjdGlvbiBpZiBlbXB0eS5cclxuaWYgKFN0dWZmcy5jb2xsZWN0aW9uLmZpbmQoKS5jb3VudCgpID09PSAwKSB7XHJcbiAgaWYgKE1ldGVvci5zZXR0aW5ncy5kZWZhdWx0RGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGRlZmF1bHQgZGF0YS4nKTtcclxuICAgIE1ldGVvci5zZXR0aW5ncy5kZWZhdWx0RGF0YS5mb3JFYWNoKGRhdGEgPT4gYWRkRGF0YShkYXRhKSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJ21ldGVvci9hbGFubmluZzpyb2xlcyc7XHJcbmltcG9ydCB7IFN0dWZmcyB9IGZyb20gJy4uLy4uL2FwaS9zdHVmZi9TdHVmZic7XHJcblxyXG4vLyBVc2VyLWxldmVsIHB1YmxpY2F0aW9uLlxyXG4vLyBJZiBsb2dnZWQgaW4sIHRoZW4gcHVibGlzaCBkb2N1bWVudHMgb3duZWQgYnkgdGhpcyB1c2VyLiBPdGhlcndpc2UgcHVibGlzaCBub3RoaW5nLlxyXG5NZXRlb3IucHVibGlzaChTdHVmZnMudXNlclB1YmxpY2F0aW9uTmFtZSwgZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0aGlzLnVzZXJJZCkge1xyXG4gICAgY29uc3QgdXNlcm5hbWUgPSBNZXRlb3IudXNlcnMuZmluZE9uZSh0aGlzLnVzZXJJZCkudXNlcm5hbWU7XHJcbiAgICByZXR1cm4gU3R1ZmZzLmNvbGxlY3Rpb24uZmluZCh7IG93bmVyOiB1c2VybmFtZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRoaXMucmVhZHkoKTtcclxufSk7XHJcblxyXG4vLyBBZG1pbi1sZXZlbCBwdWJsaWNhdGlvbi5cclxuLy8gSWYgbG9nZ2VkIGluIGFuZCB3aXRoIGFkbWluIHJvbGUsIHRoZW4gcHVibGlzaCBhbGwgZG9jdW1lbnRzIGZyb20gYWxsIHVzZXJzLiBPdGhlcndpc2UgcHVibGlzaCBub3RoaW5nLlxyXG5NZXRlb3IucHVibGlzaChTdHVmZnMuYWRtaW5QdWJsaWNhdGlvbk5hbWUsIGZ1bmN0aW9uICgpIHtcclxuICBpZiAodGhpcy51c2VySWQgJiYgUm9sZXMudXNlcklzSW5Sb2xlKHRoaXMudXNlcklkLCAnYWRtaW4nKSkge1xyXG4gICAgcmV0dXJuIFN0dWZmcy5jb2xsZWN0aW9uLmZpbmQoKTtcclxuICB9XHJcbiAgcmV0dXJuIHRoaXMucmVhZHkoKTtcclxufSk7XHJcblxyXG4vLyBhbGFubmluZzpyb2xlcyBwdWJsaWNhdGlvblxyXG4vLyBSZWNvbW1lbmRlZCBjb2RlIHRvIHB1Ymxpc2ggcm9sZXMgZm9yIGVhY2ggdXNlci5cclxuTWV0ZW9yLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0aGlzLnVzZXJJZCkge1xyXG4gICAgcmV0dXJuIE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKHsgJ3VzZXIuX2lkJzogdGhpcy51c2VySWQgfSk7XHJcbiAgfVxyXG4gIHJldHVybiB0aGlzLnJlYWR5KCk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgJy9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL0FjY291bnRzJztcclxuaW1wb3J0ICcvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9QdWJsaWNhdGlvbnMnO1xyXG5pbXBvcnQgJy9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL01vbmdvJztcclxuIl19
