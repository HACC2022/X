(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Roles;

var require = meteorInstall({"node_modules":{"meteor":{"alanning:roles":{"roles":{"roles_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/alanning_roles/roles/roles_common.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  /* global Meteor, Roles, Mongo */

  /**
   * Provides functions related to user authorization. Compatible with built-in Meteor accounts packages.
   *
   * Roles are accessible throgh `Meteor.roles` collection and documents consist of:
   *  - `_id`: role name
   *  - `children`: list of subdocuments:
   *    - `_id`
   *
   * Children list elements are subdocuments so that they can be easier extended in the future or by plugins.
   *
   * Roles can have multiple parents and can be children (subroles) of multiple roles.
   *
   * Example: `{_id: 'admin', children: [{_id: 'editor'}]}`
   *
   * The assignment of a role to a user is stored in a collection, accessible through `Meteor.roleAssignment`.
   * It's documents consist of
   *  - `_id`: Internal MongoDB id
   *  - `role`: A role object which got assigned. Usually only contains the `_id` property
   *  - `user`: A user object, usually only contains the `_id` property
   *  - `scope`: scope name
   *  - `inheritedRoles`: A list of all the roles objects inherited by the assigned role.
   *
   * @module Roles
   */
  if (!Meteor.roles) {
    Meteor.roles = new Mongo.Collection('roles');
  }

  if (!Meteor.roleAssignment) {
    Meteor.roleAssignment = new Mongo.Collection('role-assignment');
  }
  /**
   * @class Roles
   */


  if (typeof Roles === 'undefined') {
    Roles = {}; // eslint-disable-line no-global-assign
  }

  var getGroupsForUserDeprecationWarning = false;
  Object.assign(Roles, {
    /**
     * Used as a global group (now scope) name. Not used anymore.
     *
     * @property GLOBAL_GROUP
     * @static
     * @deprecated
     */
    GLOBAL_GROUP: null,

    /**
     * Create a new role.
     *
     * @method createRole
     * @param {String} roleName Name of role.
     * @param {Object} [options] Options:
     *   - `unlessExists`: if `true`, exception will not be thrown in the role already exists
     * @return {String} ID of the new role or null.
     * @static
     */
    createRole: function (roleName, options) {
      Roles._checkRoleName(roleName);

      options = Object.assign({
        unlessExists: false
      }, options);
      var result = Meteor.roles.upsert({
        _id: roleName
      }, {
        $setOnInsert: {
          children: []
        }
      });

      if (!result.insertedId) {
        if (options.unlessExists) return null;
        throw new Error('Role \'' + roleName + '\' already exists.');
      }

      return result.insertedId;
    },

    /**
     * Delete an existing role.
     *
     * If the role is set for any user, it is automatically unset.
     *
     * @method deleteRole
     * @param {String} roleName Name of role.
     * @static
     */
    deleteRole: function (roleName) {
      var roles;
      var inheritedRoles;

      Roles._checkRoleName(roleName); // Remove all assignments


      Meteor.roleAssignment.remove({
        'role._id': roleName
      });

      do {
        // For all roles who have it as a dependency ...
        roles = Roles._getParentRoleNames(Meteor.roles.findOne({
          _id: roleName
        }));
        Meteor.roles.find({
          _id: {
            $in: roles
          }
        }).fetch().forEach(r => {
          Meteor.roles.update({
            _id: r._id
          }, {
            $pull: {
              children: {
                _id: roleName
              }
            }
          });
          inheritedRoles = Roles._getInheritedRoleNames(Meteor.roles.findOne({
            _id: r._id
          }));
          Meteor.roleAssignment.update({
            'role._id': r._id
          }, {
            $set: {
              inheritedRoles: [r._id, ...inheritedRoles].map(r2 => ({
                _id: r2
              }))
            }
          }, {
            multi: true
          });
        });
      } while (roles.length > 0); // And finally remove the role itself


      Meteor.roles.remove({
        _id: roleName
      });
    },

    /**
     * Rename an existing role.
     *
     * @method renameRole
     * @param {String} oldName Old name of a role.
     * @param {String} newName New name of a role.
     * @static
     */
    renameRole: function (oldName, newName) {
      var role;
      var count;

      Roles._checkRoleName(oldName);

      Roles._checkRoleName(newName);

      if (oldName === newName) return;
      role = Meteor.roles.findOne({
        _id: oldName
      });

      if (!role) {
        throw new Error('Role \'' + oldName + '\' does not exist.');
      }

      role._id = newName;
      Meteor.roles.insert(role);

      do {
        count = Meteor.roleAssignment.update({
          'role._id': oldName
        }, {
          $set: {
            'role._id': newName
          }
        }, {
          multi: true
        });
      } while (count > 0);

      do {
        count = Meteor.roleAssignment.update({
          'inheritedRoles._id': oldName
        }, {
          $set: {
            'inheritedRoles.$._id': newName
          }
        }, {
          multi: true
        });
      } while (count > 0);

      do {
        count = Meteor.roles.update({
          'children._id': oldName
        }, {
          $set: {
            'children.$._id': newName
          }
        }, {
          multi: true
        });
      } while (count > 0);

      Meteor.roles.remove({
        _id: oldName
      });
    },

    /**
     * Add role parent to roles.
     *
     * Previous parents are kept (role can have multiple parents). For users which have the
     * parent role set, new subroles are added automatically.
     *
     * @method addRolesToParent
     * @param {Array|String} rolesNames Name(s) of role(s).
     * @param {String} parentName Name of parent role.
     * @static
     */
    addRolesToParent: function (rolesNames, parentName) {
      // ensure arrays
      if (!Array.isArray(rolesNames)) rolesNames = [rolesNames];
      rolesNames.forEach(function (roleName) {
        Roles._addRoleToParent(roleName, parentName);
      });
    },

    /**
     * @method _addRoleToParent
     * @param {String} roleName Name of role.
     * @param {String} parentName Name of parent role.
     * @private
     * @static
     */
    _addRoleToParent: function (roleName, parentName) {
      var role;
      var count;

      Roles._checkRoleName(roleName);

      Roles._checkRoleName(parentName); // query to get role's children


      role = Meteor.roles.findOne({
        _id: roleName
      });

      if (!role) {
        throw new Error('Role \'' + roleName + '\' does not exist.');
      } // detect cycles


      if (Roles._getInheritedRoleNames(role).includes(parentName)) {
        throw new Error('Roles \'' + roleName + '\' and \'' + parentName + '\' would form a cycle.');
      }

      count = Meteor.roles.update({
        _id: parentName,
        'children._id': {
          $ne: role._id
        }
      }, {
        $push: {
          children: {
            _id: role._id
          }
        }
      }); // if there was no change, parent role might not exist, or role is
      // already a subrole; in any case we do not have anything more to do

      if (!count) return;
      Meteor.roleAssignment.update({
        'inheritedRoles._id': parentName
      }, {
        $push: {
          inheritedRoles: {
            $each: [role._id, ...Roles._getInheritedRoleNames(role)].map(r => ({
              _id: r
            }))
          }
        }
      }, {
        multi: true
      });
    },

    /**
     * Remove role parent from roles.
     *
     * Other parents are kept (role can have multiple parents). For users which have the
     * parent role set, removed subrole is removed automatically.
     *
     * @method removeRolesFromParent
     * @param {Array|String} rolesNames Name(s) of role(s).
     * @param {String} parentName Name of parent role.
     * @static
     */
    removeRolesFromParent: function (rolesNames, parentName) {
      // ensure arrays
      if (!Array.isArray(rolesNames)) rolesNames = [rolesNames];
      rolesNames.forEach(function (roleName) {
        Roles._removeRoleFromParent(roleName, parentName);
      });
    },

    /**
     * @method _removeRoleFromParent
     * @param {String} roleName Name of role.
     * @param {String} parentName Name of parent role.
     * @private
     * @static
     */
    _removeRoleFromParent: function (roleName, parentName) {
      Roles._checkRoleName(roleName);

      Roles._checkRoleName(parentName); // check for role existence
      // this would not really be needed, but we are trying to match addRolesToParent


      let role = Meteor.roles.findOne({
        _id: roleName
      }, {
        fields: {
          _id: 1
        }
      });

      if (!role) {
        throw new Error('Role \'' + roleName + '\' does not exist.');
      }

      const count = Meteor.roles.update({
        _id: parentName
      }, {
        $pull: {
          children: {
            _id: role._id
          }
        }
      }); // if there was no change, parent role might not exist, or role was
      // already not a subrole; in any case we do not have anything more to do

      if (!count) return; // For all roles who have had it as a dependency ...

      const roles = [...Roles._getParentRoleNames(Meteor.roles.findOne({
        _id: parentName
      })), parentName];
      Meteor.roles.find({
        _id: {
          $in: roles
        }
      }).fetch().forEach(r => {
        const inheritedRoles = Roles._getInheritedRoleNames(Meteor.roles.findOne({
          _id: r._id
        }));

        Meteor.roleAssignment.update({
          'role._id': r._id,
          'inheritedRoles._id': role._id
        }, {
          $set: {
            inheritedRoles: [r._id, ...inheritedRoles].map(r2 => ({
              _id: r2
            }))
          }
        }, {
          multi: true
        });
      });
    },

    /**
     * Add users to roles.
     *
     * Adds roles to existing roles for each user.
     *
     * @example
     *     Roles.addUsersToRoles(userId, 'admin')
     *     Roles.addUsersToRoles(userId, ['view-secrets'], 'example.com')
     *     Roles.addUsersToRoles([user1, user2], ['user','editor'])
     *     Roles.addUsersToRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')
     *
     * @method addUsersToRoles
     * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
     * @param {Array|String} roles Name(s) of roles to add users to. Roles have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
     *
     * Alternatively, it can be a scope name string.
     * @static
     */
    addUsersToRoles: function (users, roles, options) {
      var id;
      if (!users) throw new Error('Missing \'users\' param.');
      if (!roles) throw new Error('Missing \'roles\' param.');
      options = Roles._normalizeOptions(options); // ensure arrays

      if (!Array.isArray(users)) users = [users];
      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        ifExists: false
      }, options);
      users.forEach(function (user) {
        if (typeof user === 'object') {
          id = user._id;
        } else {
          id = user;
        }

        roles.forEach(function (role) {
          Roles._addUserToRole(id, role, options);
        });
      });
    },

    /**
     * Set users' roles.
     *
     * Replaces all existing roles with a new set of roles.
     *
     * @example
     *     Roles.setUserRoles(userId, 'admin')
     *     Roles.setUserRoles(userId, ['view-secrets'], 'example.com')
     *     Roles.setUserRoles([user1, user2], ['user','editor'])
     *     Roles.setUserRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')
     *
     * @method setUserRoles
     * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
     * @param {Array|String} roles Name(s) of roles to add users to. Roles have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `anyScope`: if `true`, remove all roles the user has, of any scope, if `false`, only the one in the same scope
     *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
     *
     * Alternatively, it can be a scope name string.
     * @static
     */
    setUserRoles: function (users, roles, options) {
      var id;
      if (!users) throw new Error('Missing \'users\' param.');
      if (!roles) throw new Error('Missing \'roles\' param.');
      options = Roles._normalizeOptions(options); // ensure arrays

      if (!Array.isArray(users)) users = [users];
      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        ifExists: false,
        anyScope: false
      }, options);
      users.forEach(function (user) {
        if (typeof user === 'object') {
          id = user._id;
        } else {
          id = user;
        } // we first clear all roles for the user


        const selector = {
          'user._id': id
        };

        if (!options.anyScope) {
          selector.scope = options.scope;
        }

        Meteor.roleAssignment.remove(selector); // and then add all

        roles.forEach(function (role) {
          Roles._addUserToRole(id, role, options);
        });
      });
    },

    /**
     * Add one user to one role.
     *
     * @method _addUserToRole
     * @param {String} userId The user ID.
     * @param {String} roleName Name of the role to add the user to. The role have to exist.
     * @param {Object} options Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
     * @private
     * @static
     */
    _addUserToRole: function (userId, roleName, options) {
      Roles._checkRoleName(roleName);

      Roles._checkScopeName(options.scope);

      if (!userId) {
        return;
      }

      const role = Meteor.roles.findOne({
        _id: roleName
      }, {
        fields: {
          children: 1
        }
      });

      if (!role) {
        if (options.ifExists) {
          return [];
        } else {
          throw new Error('Role \'' + roleName + '\' does not exist.');
        }
      } // This might create duplicates, because we don't have a unique index, but that's all right. In case there are two, withdrawing the role will effectively kill them both.


      const res = Meteor.roleAssignment.upsert({
        'user._id': userId,
        'role._id': roleName,
        scope: options.scope
      }, {
        $setOnInsert: {
          user: {
            _id: userId
          },
          role: {
            _id: roleName
          },
          scope: options.scope
        }
      });

      if (res.insertedId) {
        Meteor.roleAssignment.update({
          _id: res.insertedId
        }, {
          $set: {
            inheritedRoles: [roleName, ...Roles._getInheritedRoleNames(role)].map(r => ({
              _id: r
            }))
          }
        });
      }

      return res;
    },

    /**
     * Returns an array of role names the given role name is a child of.
     *
     * @example
     *     Roles._getParentRoleNames({ _id: 'admin', children; [] })
     *
     * @method _getParentRoleNames
     * @param {object} role The role object
     * @private
     * @static
     */
    _getParentRoleNames: function (role) {
      var parentRoles;

      if (!role) {
        return [];
      }

      parentRoles = new Set([role._id]);
      parentRoles.forEach(roleName => {
        Meteor.roles.find({
          'children._id': roleName
        }).fetch().forEach(parentRole => {
          parentRoles.add(parentRole._id);
        });
      });
      parentRoles.delete(role._id);
      return [...parentRoles];
    },

    /**
     * Returns an array of role names the given role name is a parent of.
     *
     * @example
     *     Roles._getInheritedRoleNames({ _id: 'admin', children; [] })
     *
     * @method _getInheritedRoleNames
     * @param {object} role The role object
     * @private
     * @static
     */
    _getInheritedRoleNames: function (role) {
      const inheritedRoles = new Set();
      const nestedRoles = new Set([role]);
      nestedRoles.forEach(r => {
        const roles = Meteor.roles.find({
          _id: {
            $in: r.children.map(r => r._id)
          }
        }, {
          fields: {
            children: 1
          }
        }).fetch();
        roles.forEach(r2 => {
          inheritedRoles.add(r2._id);
          nestedRoles.add(r2);
        });
      });
      return [...inheritedRoles];
    },

    /**
     * Remove users from assigned roles.
     *
     * @example
     *     Roles.removeUsersFromRoles(userId, 'admin')
     *     Roles.removeUsersFromRoles([userId, user2], ['editor'])
     *     Roles.removeUsersFromRoles(userId, ['user'], 'group1')
     *
     * @method removeUsersFromRoles
     * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
     * @param {Array|String} roles Name(s) of roles to remove users from. Roles have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *
     * Alternatively, it can be a scope name string.
     * @static
     */
    removeUsersFromRoles: function (users, roles, options) {
      if (!users) throw new Error('Missing \'users\' param.');
      if (!roles) throw new Error('Missing \'roles\' param.');
      options = Roles._normalizeOptions(options); // ensure arrays

      if (!Array.isArray(users)) users = [users];
      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      users.forEach(function (user) {
        if (!user) return;
        roles.forEach(function (role) {
          let id;

          if (typeof user === 'object') {
            id = user._id;
          } else {
            id = user;
          }

          Roles._removeUserFromRole(id, role, options);
        });
      });
    },

    /**
     * Remove one user from one role.
     *
     * @method _removeUserFromRole
     * @param {String} userId The user ID.
     * @param {String} roleName Name of the role to add the user to. The role have to exist.
     * @param {Object} options Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     * @private
     * @static
     */
    _removeUserFromRole: function (userId, roleName, options) {
      Roles._checkRoleName(roleName);

      Roles._checkScopeName(options.scope);

      if (!userId) return;
      const selector = {
        'user._id': userId,
        'role._id': roleName
      };

      if (!options.anyScope) {
        selector.scope = options.scope;
      }

      Meteor.roleAssignment.remove(selector);
    },

    /**
     * Check if user has specified roles.
     *
     * @example
     *     // global roles
     *     Roles.userIsInRole(user, 'admin')
     *     Roles.userIsInRole(user, ['admin','editor'])
     *     Roles.userIsInRole(userId, 'admin')
     *     Roles.userIsInRole(userId, ['admin','editor'])
     *
     *     // scope roles (global roles are still checked)
     *     Roles.userIsInRole(user, 'admin', 'group1')
     *     Roles.userIsInRole(userId, ['admin','editor'], 'group1')
     *     Roles.userIsInRole(userId, ['admin','editor'], {scope: 'group1'})
     *
     * @method userIsInRole
     * @param {String|Object} user User ID or an actual user object.
     * @param {Array|String} roles Name of role or an array of roles to check against. If array,
     *                             will return `true` if user is in _any_ role.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope; if supplied, limits check to just that scope
     *     the user's global roles will always be checked whether scope is specified or not
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *
     * Alternatively, it can be a scope name string.
     * @return {Boolean} `true` if user is in _any_ of the target roles
     * @static
     */
    userIsInRole: function (user, roles, options) {
      var id;
      var selector;
      options = Roles._normalizeOptions(options); // ensure array to simplify code

      if (!Array.isArray(roles)) roles = [roles];
      roles = roles.filter(r => r != null);
      if (!roles.length) return false;

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        anyScope: false
      }, options);

      if (user && typeof user === 'object') {
        id = user._id;
      } else {
        id = user;
      }

      if (!id) return false;
      if (typeof id !== 'string') return false;
      selector = {
        'user._id': id
      };

      if (!options.anyScope) {
        selector.scope = {
          $in: [options.scope, null]
        };
      }

      return roles.some(roleName => {
        selector['inheritedRoles._id'] = roleName;
        return Meteor.roleAssignment.find(selector, {
          limit: 1
        }).count() > 0;
      });
    },

    /**
     * Retrieve user's roles.
     *
     * @method getRolesForUser
     * @param {String|Object} user User ID or an actual user object.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of scope to provide roles for; if not specified, global roles are returned
     *   - `anyScope`: if set, role can be in any scope (`scope` and `onlyAssigned` options are ignored)
     *   - `onlyScoped`: if set, only roles in the specified scope are returned
     *   - `onlyAssigned`: return only assigned roles and not automatically inferred (like subroles)
     *   - `fullObjects`: return full roles objects (`true`) or just names (`false`) (`onlyAssigned` option is ignored) (default `false`)
     *     If you have a use-case for this option, please file a feature-request. You shouldn't need to use it as it's
     *     result strongly dependant on the internal data structure of this plugin.
     *
     * Alternatively, it can be a scope name string.
     * @return {Array} Array of user's roles, unsorted.
     * @static
     */
    getRolesForUser: function (user, options) {
      var id;
      var selector;
      var filter;
      var roles;
      options = Roles._normalizeOptions(options);

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        fullObjects: false,
        onlyAssigned: false,
        anyScope: false,
        onlyScoped: false
      }, options);

      if (user && typeof user === 'object') {
        id = user._id;
      } else {
        id = user;
      }

      if (!id) return [];
      selector = {
        'user._id': id
      };
      filter = {
        fields: {
          'inheritedRoles._id': 1
        }
      };

      if (!options.anyScope) {
        selector.scope = {
          $in: [options.scope]
        };

        if (!options.onlyScoped) {
          selector.scope.$in.push(null);
        }
      }

      if (options.onlyAssigned) {
        delete filter.fields['inheritedRoles._id'];
        filter.fields['role._id'] = 1;
      }

      if (options.fullObjects) {
        delete filter.fields;
      }

      roles = Meteor.roleAssignment.find(selector, filter).fetch();

      if (options.fullObjects) {
        return roles;
      }

      return [...new Set(roles.reduce((rev, current) => {
        if (current.inheritedRoles) {
          return rev.concat(current.inheritedRoles.map(r => r._id));
        } else if (current.role) {
          rev.push(current.role._id);
        }

        return rev;
      }, []))];
    },

    /**
     * Retrieve cursor of all existing roles.
     *
     * @method getAllRoles
     * @param {Object} [queryOptions] Options which are passed directly
     *                                through to `Meteor.roles.find(query, options)`.
     * @return {Cursor} Cursor of existing roles.
     * @static
     */
    getAllRoles: function (queryOptions) {
      queryOptions = queryOptions || {
        sort: {
          _id: 1
        }
      };
      return Meteor.roles.find({}, queryOptions);
    },

    /**
     * Retrieve all users who are in target role.
     *
     * Options:
     *
     * @method getUsersInRole
     * @param {Array|String} roles Name of role or an array of roles. If array, users
     *                             returned will have at least one of the roles
     *                             specified but need not have _all_ roles.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope to restrict roles to; user's global
     *     roles will also be checked
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *   - `onlyScoped`: if set, only roles in the specified scope are returned
     *   - `queryOptions`: options which are passed directly
     *     through to `Meteor.users.find(query, options)`
     *
     * Alternatively, it can be a scope name string.
     * @param {Object} [queryOptions] Options which are passed directly
     *                                through to `Meteor.users.find(query, options)`
     * @return {Cursor} Cursor of users in roles.
     * @static
     */
    getUsersInRole: function (roles, options, queryOptions) {
      var ids;
      ids = Roles.getUserAssignmentsForRole(roles, options).fetch().map(a => a.user._id);
      return Meteor.users.find({
        _id: {
          $in: ids
        }
      }, options && options.queryOptions || queryOptions || {});
    },

    /**
     * Retrieve all assignments of a user which are for the target role.
     *
     * Options:
     *
     * @method getUserAssignmentsForRole
     * @param {Array|String} roles Name of role or an array of roles. If array, users
     *                             returned will have at least one of the roles
     *                             specified but need not have _all_ roles.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope to restrict roles to; user's global
     *     roles will also be checked
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *   - `queryOptions`: options which are passed directly
     *     through to `Meteor.roleAssignment.find(query, options)`
      * Alternatively, it can be a scope name string.
     * @return {Cursor} Cursor of user assignments for roles.
     * @static
     */
    getUserAssignmentsForRole: function (roles, options) {
      options = Roles._normalizeOptions(options);
      options = Object.assign({
        anyScope: false,
        queryOptions: {}
      }, options);
      return Roles._getUsersInRoleCursor(roles, options, options.queryOptions);
    },

    /**
     * @method _getUsersInRoleCursor
     * @param {Array|String} roles Name of role or an array of roles. If array, ids of users are
     *                             returned which have at least one of the roles
     *                             assigned but need not have _all_ roles.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope to restrict roles to; user's global
     *     roles will also be checked
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *
     * Alternatively, it can be a scope name string.
     * @param {Object} [filter] Options which are passed directly
     *                                through to `Meteor.roleAssignment.find(query, options)`
     * @return {Object} Cursor to the assignment documents
     * @private
     * @static
     */
    _getUsersInRoleCursor: function (roles, options, filter) {
      var selector;
      options = Roles._normalizeOptions(options);
      options = Object.assign({
        anyScope: false,
        onlyScoped: false
      }, options); // ensure array to simplify code

      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      filter = Object.assign({
        fields: {
          'user._id': 1
        }
      }, filter);
      selector = {
        'inheritedRoles._id': {
          $in: roles
        }
      };

      if (!options.anyScope) {
        selector.scope = {
          $in: [options.scope]
        };

        if (!options.onlyScoped) {
          selector.scope.$in.push(null);
        }
      }

      return Meteor.roleAssignment.find(selector, filter);
    },

    /**
     * Deprecated. Use `getScopesForUser` instead.
     *
     * @method getGroupsForUser
     * @static
     * @deprecated
     */
    getGroupsForUser: function () {
      if (!getGroupsForUserDeprecationWarning) {
        getGroupsForUserDeprecationWarning = true;
        console && console.warn('getGroupsForUser has been deprecated. Use getScopesForUser instead.');
      }

      return Roles.getScopesForUser(...arguments);
    },

    /**
     * Retrieve users scopes, if any.
     *
     * @method getScopesForUser
     * @param {String|Object} user User ID or an actual user object.
     * @param {Array|String} [roles] Name of roles to restrict scopes to.
     *
     * @return {Array} Array of user's scopes, unsorted.
     * @static
     */
    getScopesForUser: function (user, roles) {
      var scopes;
      var id;
      if (roles && !Array.isArray(roles)) roles = [roles];

      if (user && typeof user === 'object') {
        id = user._id;
      } else {
        id = user;
      }

      if (!id) return [];
      const selector = {
        'user._id': id,
        scope: {
          $ne: null
        }
      };

      if (roles) {
        selector['inheritedRoles._id'] = {
          $in: roles
        };
      }

      scopes = Meteor.roleAssignment.find(selector, {
        fields: {
          scope: 1
        }
      }).fetch().map(obi => obi.scope);
      return [...new Set(scopes)];
    },

    /**
     * Rename a scope.
     *
     * Roles assigned with a given scope are changed to be under the new scope.
     *
     * @method renameScope
     * @param {String} oldName Old name of a scope.
     * @param {String} newName New name of a scope.
     * @static
     */
    renameScope: function (oldName, newName) {
      var count;

      Roles._checkScopeName(oldName);

      Roles._checkScopeName(newName);

      if (oldName === newName) return;

      do {
        count = Meteor.roleAssignment.update({
          scope: oldName
        }, {
          $set: {
            scope: newName
          }
        }, {
          multi: true
        });
      } while (count > 0);
    },

    /**
     * Remove a scope.
     *
     * Roles assigned with a given scope are removed.
     *
     * @method removeScope
     * @param {String} name The name of a scope.
     * @static
     */
    removeScope: function (name) {
      Roles._checkScopeName(name);

      Meteor.roleAssignment.remove({
        scope: name
      });
    },

    /**
     * Throw an exception if `roleName` is an invalid role name.
     *
     * @method _checkRoleName
     * @param {String} roleName A role name to match against.
     * @private
     * @static
     */
    _checkRoleName: function (roleName) {
      if (!roleName || typeof roleName !== 'string' || roleName.trim() !== roleName) {
        throw new Error('Invalid role name \'' + roleName + '\'.');
      }
    },

    /**
     * Find out if a role is an ancestor of another role.
     *
     * WARNING: If you check this on the client, please make sure all roles are published.
     *
     * @method isParentOf
     * @param {String} parentRoleName The role you want to research.
     * @param {String} childRoleName The role you expect to be among the children of parentRoleName.
     * @static
     */
    isParentOf: function (parentRoleName, childRoleName) {
      if (parentRoleName === childRoleName) {
        return true;
      }

      if (parentRoleName == null || childRoleName == null) {
        return false;
      }

      Roles._checkRoleName(parentRoleName);

      Roles._checkRoleName(childRoleName);

      var rolesToCheck = [parentRoleName];

      while (rolesToCheck.length !== 0) {
        var roleName = rolesToCheck.pop();

        if (roleName === childRoleName) {
          return true;
        }

        var role = Meteor.roles.findOne({
          _id: roleName
        }); // This should not happen, but this is a problem to address at some other time.

        if (!role) continue;
        rolesToCheck = rolesToCheck.concat(role.children.map(r => r._id));
      }

      return false;
    },

    /**
     * Normalize options.
     *
     * @method _normalizeOptions
     * @param {Object} options Options to normalize.
     * @return {Object} Normalized options.
     * @private
     * @static
     */
    _normalizeOptions: function (options) {
      options = options === undefined ? {} : options;

      if (options === null || typeof options === 'string') {
        options = {
          scope: options
        };
      }

      options.scope = Roles._normalizeScopeName(options.scope);
      return options;
    },

    /**
     * Normalize scope name.
     *
     * @method _normalizeScopeName
     * @param {String} scopeName A scope name to normalize.
     * @return {String} Normalized scope name.
     * @private
     * @static
     */
    _normalizeScopeName: function (scopeName) {
      // map undefined and null to null
      if (scopeName == null) {
        return null;
      } else {
        return scopeName;
      }
    },

    /**
     * Throw an exception if `scopeName` is an invalid scope name.
     *
     * @method _checkRoleName
     * @param {String} scopeName A scope name to match against.
     * @private
     * @static
     */
    _checkScopeName: function (scopeName) {
      if (scopeName === null) return;

      if (!scopeName || typeof scopeName !== 'string' || scopeName.trim() !== scopeName) {
        throw new Error('Invalid scope name \'' + scopeName + '\'.');
      }
    }
  });
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"roles_server.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/alanning_roles/roles/roles_server.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Meteor, Roles */
if (Meteor.roles.createIndex) {
  Meteor.roleAssignment.createIndex({
    'user._id': 1,
    'inheritedRoles._id': 1,
    scope: 1
  });
  Meteor.roleAssignment.createIndex({
    'user._id': 1,
    'role._id': 1,
    scope: 1
  });
  Meteor.roleAssignment.createIndex({
    'role._id': 1
  });
  Meteor.roleAssignment.createIndex({
    scope: 1,
    'user._id': 1,
    'inheritedRoles._id': 1
  }); // Adding userId and roleId might speed up other queries depending on the first index

  Meteor.roleAssignment.createIndex({
    'inheritedRoles._id': 1
  });
  Meteor.roles.createIndex({
    'children._id': 1
  });
} else {
  Meteor.roleAssignment._ensureIndex({
    'user._id': 1,
    'inheritedRoles._id': 1,
    scope: 1
  });

  Meteor.roleAssignment._ensureIndex({
    'user._id': 1,
    'role._id': 1,
    scope: 1
  });

  Meteor.roleAssignment._ensureIndex({
    'role._id': 1
  });

  Meteor.roleAssignment._ensureIndex({
    scope: 1,
    'user._id': 1,
    'inheritedRoles._id': 1
  }); // Adding userId and roleId might speed up other queries depending on the first index


  Meteor.roleAssignment._ensureIndex({
    'inheritedRoles._id': 1
  });

  Meteor.roles._ensureIndex({
    'children._id': 1
  });
}
/*
 * Publish logged-in user's roles so client-side checks can work.
 *
 * Use a named publish function so clients can check `ready()` state.
 */


Meteor.publish('_roles', function () {
  var loggedInUserId = this.userId;
  var fields = {
    roles: 1
  };

  if (!loggedInUserId) {
    this.ready();
    return;
  }

  return Meteor.users.find({
    _id: loggedInUserId
  }, {
    fields: fields
  });
});
Object.assign(Roles, {
  /**
   * @method _isNewRole
   * @param {Object} role `Meteor.roles` document.
   * @return {Boolean} Returns `true` if the `role` is in the new format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isNewRole: function (role) {
    return !('name' in role) && 'children' in role;
  },

  /**
   * @method _isOldRole
   * @param {Object} role `Meteor.roles` document.
   * @return {Boolean} Returns `true` if the `role` is in the old format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isOldRole: function (role) {
    return 'name' in role && !('children' in role);
  },

  /**
   * @method _isNewField
   * @param {Array} roles `Meteor.users` document `roles` field.
   * @return {Boolean} Returns `true` if the `roles` field is in the new format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isNewField: function (roles) {
    return Array.isArray(roles) && typeof roles[0] === 'object';
  },

  /**
   * @method _isOldField
   * @param {Array} roles `Meteor.users` document `roles` field.
   * @return {Boolean} Returns `true` if the `roles` field is in the old format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isOldField: function (roles) {
    return Array.isArray(roles) && typeof roles[0] === 'string' || typeof roles === 'object' && !Array.isArray(roles);
  },

  /**
   * @method _convertToNewRole
   * @param {Object} oldRole `Meteor.roles` document.
   * @return {Object} Converted `role` to the new format.
   * @for Roles
   * @private
   * @static
   */
  _convertToNewRole: function (oldRole) {
    if (!(typeof oldRole.name === 'string')) throw new Error("Role name '" + oldRole.name + "' is not a string.");
    return {
      _id: oldRole.name,
      children: []
    };
  },

  /**
   * @method _convertToOldRole
   * @param {Object} newRole `Meteor.roles` document.
   * @return {Object} Converted `role` to the old format.
   * @for Roles
   * @private
   * @static
   */
  _convertToOldRole: function (newRole) {
    if (!(typeof newRole._id === 'string')) throw new Error("Role name '" + newRole._id + "' is not a string.");
    return {
      name: newRole._id
    };
  },

  /**
   * @method _convertToNewField
   * @param {Array} oldRoles `Meteor.users` document `roles` field in the old format.
   * @param {Boolean} convertUnderscoresToDots Should we convert underscores to dots in group names.
   * @return {Array} Converted `roles` to the new format.
   * @for Roles
   * @private
   * @static
   */
  _convertToNewField: function (oldRoles, convertUnderscoresToDots) {
    var roles = [];

    if (Array.isArray(oldRoles)) {
      oldRoles.forEach(function (role, index) {
        if (!(typeof role === 'string')) throw new Error("Role '" + role + "' is not a string.");
        roles.push({
          _id: role,
          scope: null,
          assigned: true
        });
      });
    } else if (typeof oldRoles === 'object') {
      Object.entries(oldRoles).forEach(_ref => {
        let [group, rolesArray] = _ref;

        if (group === '__global_roles__') {
          group = null;
        } else if (convertUnderscoresToDots) {
          // unescape
          group = group.replace(/_/g, '.');
        }

        rolesArray.forEach(function (role) {
          if (!(typeof role === 'string')) throw new Error("Role '" + role + "' is not a string.");
          roles.push({
            _id: role,
            scope: group,
            assigned: true
          });
        });
      });
    }

    return roles;
  },

  /**
   * @method _convertToOldField
   * @param {Array} newRoles `Meteor.users` document `roles` field in the new format.
   * @param {Boolean} usingGroups Should we use groups or not.
   * @return {Array} Converted `roles` to the old format.
   * @for Roles
   * @private
   * @static
   */
  _convertToOldField: function (newRoles, usingGroups) {
    var roles;

    if (usingGroups) {
      roles = {};
    } else {
      roles = [];
    }

    newRoles.forEach(function (userRole) {
      if (!(typeof userRole === 'object')) throw new Error("Role '" + userRole + "' is not an object."); // We assume that we are converting back a failed migration, so values can only be
      // what were valid values in 1.0. So no group names starting with $ and no subroles.

      if (userRole.scope) {
        if (!usingGroups) throw new Error("Role '" + userRole._id + "' with scope '" + userRole.scope + "' without enabled groups."); // escape

        var scope = userRole.scope.replace(/\./g, '_');
        if (scope[0] === '$') throw new Error("Group name '" + scope + "' start with $.");
        roles[scope] = roles[scope] || [];
        roles[scope].push(userRole._id);
      } else {
        if (usingGroups) {
          roles.__global_roles__ = roles.__global_roles__ || [];

          roles.__global_roles__.push(userRole._id);
        } else {
          roles.push(userRole._id);
        }
      }
    });
    return roles;
  },

  /**
   * @method _defaultUpdateUser
   * @param {Object} user `Meteor.users` document.
   * @param {Array|Object} roles Value to which user's `roles` field should be set.
   * @for Roles
   * @private
   * @static
   */
  _defaultUpdateUser: function (user, roles) {
    Meteor.users.update({
      _id: user._id,
      // making sure nothing changed in meantime
      roles: user.roles
    }, {
      $set: {
        roles
      }
    });
  },

  /**
   * @method _defaultUpdateRole
   * @param {Object} oldRole Old `Meteor.roles` document.
   * @param {Object} newRole New `Meteor.roles` document.
   * @for Roles
   * @private
   * @static
   */
  _defaultUpdateRole: function (oldRole, newRole) {
    Meteor.roles.remove(oldRole._id);
    Meteor.roles.insert(newRole);
  },

  /**
   * @method _dropCollectionIndex
   * @param {Object} collection Collection on which to drop the index.
   * @param {String} indexName Name of the index to drop.
   * @for Roles
   * @private
   * @static
   */
  _dropCollectionIndex: function (collection, indexName) {
    try {
      collection._dropIndex(indexName);
    } catch (e) {
      if (e.name !== 'MongoError') throw e;
      if (!/index not found/.test(e.err || e.errmsg)) throw e;
    }
  },

  /**
   * Migrates `Meteor.users` and `Meteor.roles` to the new format.
   *
   * @method _forwardMigrate
   * @param {Function} updateUser Function which updates the user object. Default `_defaultUpdateUser`.
   * @param {Function} updateRole Function which updates the role object. Default `_defaultUpdateRole`.
   * @param {Boolean} convertUnderscoresToDots Should we convert underscores to dots in group names.
   * @for Roles
   * @private
   * @static
   */
  _forwardMigrate: function (updateUser, updateRole, convertUnderscoresToDots) {
    updateUser = updateUser || Roles._defaultUpdateUser;
    updateRole = updateRole || Roles._defaultUpdateRole;

    Roles._dropCollectionIndex(Meteor.roles, 'name_1');

    Meteor.roles.find().forEach(function (role, index, cursor) {
      if (!Roles._isNewRole(role)) {
        updateRole(role, Roles._convertToNewRole(role));
      }
    });
    Meteor.users.find().forEach(function (user, index, cursor) {
      if (!Roles._isNewField(user.roles)) {
        updateUser(user, Roles._convertToNewField(user.roles, convertUnderscoresToDots));
      }
    });
  },

  /**
   * Moves the assignments from `Meteor.users` to `Meteor.roleAssignment`.
   *
   * @method _forwardMigrate2
   * @param {Object} userSelector An opportunity to share the work among instances. It's advisable to do the division based on user-id.
   * @for Roles
   * @private
   * @static
   */
  _forwardMigrate2: function (userSelector) {
    userSelector = userSelector || {};
    Object.assign(userSelector, {
      roles: {
        $ne: null
      }
    });
    Meteor.users.find(userSelector).forEach(function (user, index) {
      user.roles.filter(r => r.assigned).forEach(r => {
        // Added `ifExists` to make it less error-prone
        Roles._addUserToRole(user._id, r._id, {
          scope: r.scope,
          ifExists: true
        });
      });
      Meteor.users.update({
        _id: user._id
      }, {
        $unset: {
          roles: ''
        }
      });
    }); // No need to keep the indexes around

    Roles._dropCollectionIndex(Meteor.users, 'roles._id_1_roles.scope_1');

    Roles._dropCollectionIndex(Meteor.users, 'roles.scope_1');
  },

  /**
   * Migrates `Meteor.users` and `Meteor.roles` to the old format.
   *
   * We assume that we are converting back a failed migration, so values can only be
   * what were valid values in the old format. So no group names starting with `$` and
   * no subroles.
   *
   * @method _backwardMigrate
   * @param {Function} updateUser Function which updates the user object. Default `_defaultUpdateUser`.
   * @param {Function} updateRole Function which updates the role object. Default `_defaultUpdateRole`.
   * @param {Boolean} usingGroups Should we use groups or not.
   * @for Roles
   * @private
   * @static
   */
  _backwardMigrate: function (updateUser, updateRole, usingGroups) {
    updateUser = updateUser || Roles._defaultUpdateUser;
    updateRole = updateRole || Roles._defaultUpdateRole;

    Roles._dropCollectionIndex(Meteor.users, 'roles._id_1_roles.scope_1');

    Roles._dropCollectionIndex(Meteor.users, 'roles.scope_1');

    Meteor.roles.find().forEach(function (role, index, cursor) {
      if (!Roles._isOldRole(role)) {
        updateRole(role, Roles._convertToOldRole(role));
      }
    });
    Meteor.users.find().forEach(function (user, index, cursor) {
      if (!Roles._isOldField(user.roles)) {
        updateUser(user, Roles._convertToOldField(user.roles, usingGroups));
      }
    });
  },

  /**
   * Moves the assignments from `Meteor.roleAssignment` back to to `Meteor.users`.
   *
   * @method _backwardMigrate2
   * @param {Object} assignmentSelector An opportunity to share the work among instances. It's advisable to do the division based on user-id.
   * @for Roles
   * @private
   * @static
   */
  _backwardMigrate2: function (assignmentSelector) {
    assignmentSelector = assignmentSelector || {};

    if (Meteor.users.createIndex) {
      Meteor.users.createIndex({
        'roles._id': 1,
        'roles.scope': 1
      });
      Meteor.users.createIndex({
        'roles.scope': 1
      });
    } else {
      Meteor.users._ensureIndex({
        'roles._id': 1,
        'roles.scope': 1
      });

      Meteor.users._ensureIndex({
        'roles.scope': 1
      });
    }

    Meteor.roleAssignment.find(assignmentSelector).forEach(r => {
      const roles = Meteor.users.findOne({
        _id: r.user._id
      }).roles || [];
      const currentRole = roles.find(oldRole => oldRole._id === r.role._id && oldRole.scope === r.scope);

      if (currentRole) {
        currentRole.assigned = true;
      } else {
        roles.push({
          _id: r.role._id,
          scope: r.scope,
          assigned: true
        });
        r.inheritedRoles.forEach(inheritedRole => {
          const currentInheritedRole = roles.find(oldRole => oldRole._id === inheritedRole._id && oldRole.scope === r.scope);

          if (!currentInheritedRole) {
            roles.push({
              _id: inheritedRole._id,
              scope: r.scope,
              assigned: false
            });
          }
        });
      }

      Meteor.users.update({
        _id: r.user._id
      }, {
        $set: {
          roles
        }
      });
      Meteor.roleAssignment.remove({
        _id: r._id
      });
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/alanning:roles/roles/roles_common.js");
require("/node_modules/meteor/alanning:roles/roles/roles_server.js");

/* Exports */
Package._define("alanning:roles", {
  Roles: Roles
});

})();

//# sourceURL=meteor://💻app/packages/alanning_roles.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxhbm5pbmc6cm9sZXMvcm9sZXMvcm9sZXNfY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGFubmluZzpyb2xlcy9yb2xlcy9yb2xlc19zZXJ2ZXIuanMiXSwibmFtZXMiOlsiTWV0ZW9yIiwicm9sZXMiLCJNb25nbyIsIkNvbGxlY3Rpb24iLCJyb2xlQXNzaWdubWVudCIsIlJvbGVzIiwiZ2V0R3JvdXBzRm9yVXNlckRlcHJlY2F0aW9uV2FybmluZyIsIk9iamVjdCIsImFzc2lnbiIsIkdMT0JBTF9HUk9VUCIsImNyZWF0ZVJvbGUiLCJyb2xlTmFtZSIsIm9wdGlvbnMiLCJfY2hlY2tSb2xlTmFtZSIsInVubGVzc0V4aXN0cyIsInJlc3VsdCIsInVwc2VydCIsIl9pZCIsIiRzZXRPbkluc2VydCIsImNoaWxkcmVuIiwiaW5zZXJ0ZWRJZCIsIkVycm9yIiwiZGVsZXRlUm9sZSIsImluaGVyaXRlZFJvbGVzIiwicmVtb3ZlIiwiX2dldFBhcmVudFJvbGVOYW1lcyIsImZpbmRPbmUiLCJmaW5kIiwiJGluIiwiZmV0Y2giLCJmb3JFYWNoIiwiciIsInVwZGF0ZSIsIiRwdWxsIiwiX2dldEluaGVyaXRlZFJvbGVOYW1lcyIsIiRzZXQiLCJtYXAiLCJyMiIsIm11bHRpIiwibGVuZ3RoIiwicmVuYW1lUm9sZSIsIm9sZE5hbWUiLCJuZXdOYW1lIiwicm9sZSIsImNvdW50IiwiaW5zZXJ0IiwiYWRkUm9sZXNUb1BhcmVudCIsInJvbGVzTmFtZXMiLCJwYXJlbnROYW1lIiwiQXJyYXkiLCJpc0FycmF5IiwiX2FkZFJvbGVUb1BhcmVudCIsImluY2x1ZGVzIiwiJG5lIiwiJHB1c2giLCIkZWFjaCIsInJlbW92ZVJvbGVzRnJvbVBhcmVudCIsIl9yZW1vdmVSb2xlRnJvbVBhcmVudCIsImZpZWxkcyIsImFkZFVzZXJzVG9Sb2xlcyIsInVzZXJzIiwiaWQiLCJfbm9ybWFsaXplT3B0aW9ucyIsIl9jaGVja1Njb3BlTmFtZSIsInNjb3BlIiwiaWZFeGlzdHMiLCJ1c2VyIiwiX2FkZFVzZXJUb1JvbGUiLCJzZXRVc2VyUm9sZXMiLCJhbnlTY29wZSIsInNlbGVjdG9yIiwidXNlcklkIiwicmVzIiwicGFyZW50Um9sZXMiLCJTZXQiLCJwYXJlbnRSb2xlIiwiYWRkIiwiZGVsZXRlIiwibmVzdGVkUm9sZXMiLCJyZW1vdmVVc2Vyc0Zyb21Sb2xlcyIsIl9yZW1vdmVVc2VyRnJvbVJvbGUiLCJ1c2VySXNJblJvbGUiLCJmaWx0ZXIiLCJzb21lIiwibGltaXQiLCJnZXRSb2xlc0ZvclVzZXIiLCJmdWxsT2JqZWN0cyIsIm9ubHlBc3NpZ25lZCIsIm9ubHlTY29wZWQiLCJwdXNoIiwicmVkdWNlIiwicmV2IiwiY3VycmVudCIsImNvbmNhdCIsImdldEFsbFJvbGVzIiwicXVlcnlPcHRpb25zIiwic29ydCIsImdldFVzZXJzSW5Sb2xlIiwiaWRzIiwiZ2V0VXNlckFzc2lnbm1lbnRzRm9yUm9sZSIsImEiLCJfZ2V0VXNlcnNJblJvbGVDdXJzb3IiLCJnZXRHcm91cHNGb3JVc2VyIiwiY29uc29sZSIsIndhcm4iLCJnZXRTY29wZXNGb3JVc2VyIiwic2NvcGVzIiwib2JpIiwicmVuYW1lU2NvcGUiLCJyZW1vdmVTY29wZSIsIm5hbWUiLCJ0cmltIiwiaXNQYXJlbnRPZiIsInBhcmVudFJvbGVOYW1lIiwiY2hpbGRSb2xlTmFtZSIsInJvbGVzVG9DaGVjayIsInBvcCIsInVuZGVmaW5lZCIsIl9ub3JtYWxpemVTY29wZU5hbWUiLCJzY29wZU5hbWUiLCJjcmVhdGVJbmRleCIsIl9lbnN1cmVJbmRleCIsInB1Ymxpc2giLCJsb2dnZWRJblVzZXJJZCIsInJlYWR5IiwiX2lzTmV3Um9sZSIsIl9pc09sZFJvbGUiLCJfaXNOZXdGaWVsZCIsIl9pc09sZEZpZWxkIiwiX2NvbnZlcnRUb05ld1JvbGUiLCJvbGRSb2xlIiwiX2NvbnZlcnRUb09sZFJvbGUiLCJuZXdSb2xlIiwiX2NvbnZlcnRUb05ld0ZpZWxkIiwib2xkUm9sZXMiLCJjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMiLCJpbmRleCIsImFzc2lnbmVkIiwiZW50cmllcyIsImdyb3VwIiwicm9sZXNBcnJheSIsInJlcGxhY2UiLCJfY29udmVydFRvT2xkRmllbGQiLCJuZXdSb2xlcyIsInVzaW5nR3JvdXBzIiwidXNlclJvbGUiLCJfX2dsb2JhbF9yb2xlc19fIiwiX2RlZmF1bHRVcGRhdGVVc2VyIiwiX2RlZmF1bHRVcGRhdGVSb2xlIiwiX2Ryb3BDb2xsZWN0aW9uSW5kZXgiLCJjb2xsZWN0aW9uIiwiaW5kZXhOYW1lIiwiX2Ryb3BJbmRleCIsImUiLCJ0ZXN0IiwiZXJyIiwiZXJybXNnIiwiX2ZvcndhcmRNaWdyYXRlIiwidXBkYXRlVXNlciIsInVwZGF0ZVJvbGUiLCJjdXJzb3IiLCJfZm9yd2FyZE1pZ3JhdGUyIiwidXNlclNlbGVjdG9yIiwiJHVuc2V0IiwiX2JhY2t3YXJkTWlncmF0ZSIsIl9iYWNrd2FyZE1pZ3JhdGUyIiwiYXNzaWdubWVudFNlbGVjdG9yIiwiY3VycmVudFJvbGUiLCJpbmhlcml0ZWRSb2xlIiwiY3VycmVudEluaGVyaXRlZFJvbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSSxDQUFDQSxNQUFNLENBQUNDLEtBQVosRUFBbUI7QUFDakJELFVBQU0sQ0FBQ0MsS0FBUCxHQUFlLElBQUlDLEtBQUssQ0FBQ0MsVUFBVixDQUFxQixPQUFyQixDQUFmO0FBQ0Q7O0FBRUQsTUFBSSxDQUFDSCxNQUFNLENBQUNJLGNBQVosRUFBNEI7QUFDMUJKLFVBQU0sQ0FBQ0ksY0FBUCxHQUF3QixJQUFJRixLQUFLLENBQUNDLFVBQVYsQ0FBcUIsaUJBQXJCLENBQXhCO0FBQ0Q7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ZSI6Ii9wYWNrYWdlcy9hbGFubmluZ19yb2xlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBNZXRlb3IsIFJvbGVzLCBNb25nbyAqL1xuXG4vKipcbiAqIFByb3ZpZGVzIGZ1bmN0aW9ucyByZWxhdGVkIHRvIHVzZXIgYXV0aG9yaXphdGlvbi4gQ29tcGF0aWJsZSB3aXRoIGJ1aWx0LWluIE1ldGVvciBhY2NvdW50cyBwYWNrYWdlcy5cbiAqXG4gKiBSb2xlcyBhcmUgYWNjZXNzaWJsZSB0aHJvZ2ggYE1ldGVvci5yb2xlc2AgY29sbGVjdGlvbiBhbmQgZG9jdW1lbnRzIGNvbnNpc3Qgb2Y6XG4gKiAgLSBgX2lkYDogcm9sZSBuYW1lXG4gKiAgLSBgY2hpbGRyZW5gOiBsaXN0IG9mIHN1YmRvY3VtZW50czpcbiAqICAgIC0gYF9pZGBcbiAqXG4gKiBDaGlsZHJlbiBsaXN0IGVsZW1lbnRzIGFyZSBzdWJkb2N1bWVudHMgc28gdGhhdCB0aGV5IGNhbiBiZSBlYXNpZXIgZXh0ZW5kZWQgaW4gdGhlIGZ1dHVyZSBvciBieSBwbHVnaW5zLlxuICpcbiAqIFJvbGVzIGNhbiBoYXZlIG11bHRpcGxlIHBhcmVudHMgYW5kIGNhbiBiZSBjaGlsZHJlbiAoc3Vicm9sZXMpIG9mIG11bHRpcGxlIHJvbGVzLlxuICpcbiAqIEV4YW1wbGU6IGB7X2lkOiAnYWRtaW4nLCBjaGlsZHJlbjogW3tfaWQ6ICdlZGl0b3InfV19YFxuICpcbiAqIFRoZSBhc3NpZ25tZW50IG9mIGEgcm9sZSB0byBhIHVzZXIgaXMgc3RvcmVkIGluIGEgY29sbGVjdGlvbiwgYWNjZXNzaWJsZSB0aHJvdWdoIGBNZXRlb3Iucm9sZUFzc2lnbm1lbnRgLlxuICogSXQncyBkb2N1bWVudHMgY29uc2lzdCBvZlxuICogIC0gYF9pZGA6IEludGVybmFsIE1vbmdvREIgaWRcbiAqICAtIGByb2xlYDogQSByb2xlIG9iamVjdCB3aGljaCBnb3QgYXNzaWduZWQuIFVzdWFsbHkgb25seSBjb250YWlucyB0aGUgYF9pZGAgcHJvcGVydHlcbiAqICAtIGB1c2VyYDogQSB1c2VyIG9iamVjdCwgdXN1YWxseSBvbmx5IGNvbnRhaW5zIHRoZSBgX2lkYCBwcm9wZXJ0eVxuICogIC0gYHNjb3BlYDogc2NvcGUgbmFtZVxuICogIC0gYGluaGVyaXRlZFJvbGVzYDogQSBsaXN0IG9mIGFsbCB0aGUgcm9sZXMgb2JqZWN0cyBpbmhlcml0ZWQgYnkgdGhlIGFzc2lnbmVkIHJvbGUuXG4gKlxuICogQG1vZHVsZSBSb2xlc1xuICovXG5pZiAoIU1ldGVvci5yb2xlcykge1xuICBNZXRlb3Iucm9sZXMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbigncm9sZXMnKVxufVxuXG5pZiAoIU1ldGVvci5yb2xlQXNzaWdubWVudCkge1xuICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbigncm9sZS1hc3NpZ25tZW50Jylcbn1cblxuLyoqXG4gKiBAY2xhc3MgUm9sZXNcbiAqL1xuaWYgKHR5cGVvZiBSb2xlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgUm9sZXMgPSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWdsb2JhbC1hc3NpZ25cbn1cblxudmFyIGdldEdyb3Vwc0ZvclVzZXJEZXByZWNhdGlvbldhcm5pbmcgPSBmYWxzZVxuXG5PYmplY3QuYXNzaWduKFJvbGVzLCB7XG5cbiAgLyoqXG4gICAqIFVzZWQgYXMgYSBnbG9iYWwgZ3JvdXAgKG5vdyBzY29wZSkgbmFtZS4gTm90IHVzZWQgYW55bW9yZS5cbiAgICpcbiAgICogQHByb3BlcnR5IEdMT0JBTF9HUk9VUFxuICAgKiBAc3RhdGljXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBHTE9CQUxfR1JPVVA6IG51bGwsXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyByb2xlLlxuICAgKlxuICAgKiBAbWV0aG9kIGNyZWF0ZVJvbGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJvbGVOYW1lIE5hbWUgb2Ygcm9sZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHVubGVzc0V4aXN0c2A6IGlmIGB0cnVlYCwgZXhjZXB0aW9uIHdpbGwgbm90IGJlIHRocm93biBpbiB0aGUgcm9sZSBhbHJlYWR5IGV4aXN0c1xuICAgKiBAcmV0dXJuIHtTdHJpbmd9IElEIG9mIHRoZSBuZXcgcm9sZSBvciBudWxsLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBjcmVhdGVSb2xlOiBmdW5jdGlvbiAocm9sZU5hbWUsIG9wdGlvbnMpIHtcbiAgICBSb2xlcy5fY2hlY2tSb2xlTmFtZShyb2xlTmFtZSlcblxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIHVubGVzc0V4aXN0czogZmFsc2VcbiAgICB9LCBvcHRpb25zKVxuXG4gICAgdmFyIHJlc3VsdCA9IE1ldGVvci5yb2xlcy51cHNlcnQoeyBfaWQ6IHJvbGVOYW1lIH0sIHsgJHNldE9uSW5zZXJ0OiB7IGNoaWxkcmVuOiBbXSB9IH0pXG5cbiAgICBpZiAoIXJlc3VsdC5pbnNlcnRlZElkKSB7XG4gICAgICBpZiAob3B0aW9ucy51bmxlc3NFeGlzdHMpIHJldHVybiBudWxsXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JvbGUgXFwnJyArIHJvbGVOYW1lICsgJ1xcJyBhbHJlYWR5IGV4aXN0cy4nKVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQuaW5zZXJ0ZWRJZFxuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYW4gZXhpc3Rpbmcgcm9sZS5cbiAgICpcbiAgICogSWYgdGhlIHJvbGUgaXMgc2V0IGZvciBhbnkgdXNlciwgaXQgaXMgYXV0b21hdGljYWxseSB1bnNldC5cbiAgICpcbiAgICogQG1ldGhvZCBkZWxldGVSb2xlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByb2xlTmFtZSBOYW1lIG9mIHJvbGUuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGRlbGV0ZVJvbGU6IGZ1bmN0aW9uIChyb2xlTmFtZSkge1xuICAgIHZhciByb2xlc1xuICAgIHZhciBpbmhlcml0ZWRSb2xlc1xuXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocm9sZU5hbWUpXG5cbiAgICAvLyBSZW1vdmUgYWxsIGFzc2lnbm1lbnRzXG4gICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnJlbW92ZSh7XG4gICAgICAncm9sZS5faWQnOiByb2xlTmFtZVxuICAgIH0pXG5cbiAgICBkbyB7XG4gICAgICAvLyBGb3IgYWxsIHJvbGVzIHdobyBoYXZlIGl0IGFzIGEgZGVwZW5kZW5jeSAuLi5cbiAgICAgIHJvbGVzID0gUm9sZXMuX2dldFBhcmVudFJvbGVOYW1lcyhNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogcm9sZU5hbWUgfSkpXG5cbiAgICAgIE1ldGVvci5yb2xlcy5maW5kKHsgX2lkOiB7ICRpbjogcm9sZXMgfSB9KS5mZXRjaCgpLmZvckVhY2gociA9PiB7XG4gICAgICAgIE1ldGVvci5yb2xlcy51cGRhdGUoe1xuICAgICAgICAgIF9pZDogci5faWRcbiAgICAgICAgfSwge1xuICAgICAgICAgICRwdWxsOiB7XG4gICAgICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgICAgICBfaWQ6IHJvbGVOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIGluaGVyaXRlZFJvbGVzID0gUm9sZXMuX2dldEluaGVyaXRlZFJvbGVOYW1lcyhNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogci5faWQgfSkpXG4gICAgICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC51cGRhdGUoe1xuICAgICAgICAgICdyb2xlLl9pZCc6IHIuX2lkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICBpbmhlcml0ZWRSb2xlczogW3IuX2lkLCAuLi5pbmhlcml0ZWRSb2xlc10ubWFwKHIyID0+ICh7IF9pZDogcjIgfSkpXG4gICAgICAgICAgfVxuICAgICAgICB9LCB7IG11bHRpOiB0cnVlIH0pXG4gICAgICB9KVxuICAgIH0gd2hpbGUgKHJvbGVzLmxlbmd0aCA+IDApXG5cbiAgICAvLyBBbmQgZmluYWxseSByZW1vdmUgdGhlIHJvbGUgaXRzZWxmXG4gICAgTWV0ZW9yLnJvbGVzLnJlbW92ZSh7IF9pZDogcm9sZU5hbWUgfSlcbiAgfSxcblxuICAvKipcbiAgICogUmVuYW1lIGFuIGV4aXN0aW5nIHJvbGUuXG4gICAqXG4gICAqIEBtZXRob2QgcmVuYW1lUm9sZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb2xkTmFtZSBPbGQgbmFtZSBvZiBhIHJvbGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuZXdOYW1lIE5ldyBuYW1lIG9mIGEgcm9sZS5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgcmVuYW1lUm9sZTogZnVuY3Rpb24gKG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgICB2YXIgcm9sZVxuICAgIHZhciBjb3VudFxuXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUob2xkTmFtZSlcbiAgICBSb2xlcy5fY2hlY2tSb2xlTmFtZShuZXdOYW1lKVxuXG4gICAgaWYgKG9sZE5hbWUgPT09IG5ld05hbWUpIHJldHVyblxuXG4gICAgcm9sZSA9IE1ldGVvci5yb2xlcy5maW5kT25lKHsgX2lkOiBvbGROYW1lIH0pXG5cbiAgICBpZiAoIXJvbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUm9sZSBcXCcnICsgb2xkTmFtZSArICdcXCcgZG9lcyBub3QgZXhpc3QuJylcbiAgICB9XG5cbiAgICByb2xlLl9pZCA9IG5ld05hbWVcblxuICAgIE1ldGVvci5yb2xlcy5pbnNlcnQocm9sZSlcblxuICAgIGRvIHtcbiAgICAgIGNvdW50ID0gTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnVwZGF0ZSh7XG4gICAgICAgICdyb2xlLl9pZCc6IG9sZE5hbWVcbiAgICAgIH0sIHtcbiAgICAgICAgJHNldDoge1xuICAgICAgICAgICdyb2xlLl9pZCc6IG5ld05hbWVcbiAgICAgICAgfVxuICAgICAgfSwgeyBtdWx0aTogdHJ1ZSB9KVxuICAgIH0gd2hpbGUgKGNvdW50ID4gMClcblxuICAgIGRvIHtcbiAgICAgIGNvdW50ID0gTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnVwZGF0ZSh7XG4gICAgICAgICdpbmhlcml0ZWRSb2xlcy5faWQnOiBvbGROYW1lXG4gICAgICB9LCB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAnaW5oZXJpdGVkUm9sZXMuJC5faWQnOiBuZXdOYW1lXG4gICAgICAgIH1cbiAgICAgIH0sIHsgbXVsdGk6IHRydWUgfSlcbiAgICB9IHdoaWxlIChjb3VudCA+IDApXG5cbiAgICBkbyB7XG4gICAgICBjb3VudCA9IE1ldGVvci5yb2xlcy51cGRhdGUoe1xuICAgICAgICAnY2hpbGRyZW4uX2lkJzogb2xkTmFtZVxuICAgICAgfSwge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgJ2NoaWxkcmVuLiQuX2lkJzogbmV3TmFtZVxuICAgICAgICB9XG4gICAgICB9LCB7IG11bHRpOiB0cnVlIH0pXG4gICAgfSB3aGlsZSAoY291bnQgPiAwKVxuXG4gICAgTWV0ZW9yLnJvbGVzLnJlbW92ZSh7IF9pZDogb2xkTmFtZSB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBBZGQgcm9sZSBwYXJlbnQgdG8gcm9sZXMuXG4gICAqXG4gICAqIFByZXZpb3VzIHBhcmVudHMgYXJlIGtlcHQgKHJvbGUgY2FuIGhhdmUgbXVsdGlwbGUgcGFyZW50cykuIEZvciB1c2VycyB3aGljaCBoYXZlIHRoZVxuICAgKiBwYXJlbnQgcm9sZSBzZXQsIG5ldyBzdWJyb2xlcyBhcmUgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICpcbiAgICogQG1ldGhvZCBhZGRSb2xlc1RvUGFyZW50XG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlc05hbWVzIE5hbWUocykgb2Ygcm9sZShzKS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmVudE5hbWUgTmFtZSBvZiBwYXJlbnQgcm9sZS5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgYWRkUm9sZXNUb1BhcmVudDogZnVuY3Rpb24gKHJvbGVzTmFtZXMsIHBhcmVudE5hbWUpIHtcbiAgICAvLyBlbnN1cmUgYXJyYXlzXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJvbGVzTmFtZXMpKSByb2xlc05hbWVzID0gW3JvbGVzTmFtZXNdXG5cbiAgICByb2xlc05hbWVzLmZvckVhY2goZnVuY3Rpb24gKHJvbGVOYW1lKSB7XG4gICAgICBSb2xlcy5fYWRkUm9sZVRvUGFyZW50KHJvbGVOYW1lLCBwYXJlbnROYW1lKVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2FkZFJvbGVUb1BhcmVudFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcm9sZU5hbWUgTmFtZSBvZiByb2xlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyZW50TmFtZSBOYW1lIG9mIHBhcmVudCByb2xlLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfYWRkUm9sZVRvUGFyZW50OiBmdW5jdGlvbiAocm9sZU5hbWUsIHBhcmVudE5hbWUpIHtcbiAgICB2YXIgcm9sZVxuICAgIHZhciBjb3VudFxuXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocm9sZU5hbWUpXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocGFyZW50TmFtZSlcblxuICAgIC8vIHF1ZXJ5IHRvIGdldCByb2xlJ3MgY2hpbGRyZW5cbiAgICByb2xlID0gTWV0ZW9yLnJvbGVzLmZpbmRPbmUoeyBfaWQ6IHJvbGVOYW1lIH0pXG5cbiAgICBpZiAoIXJvbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUm9sZSBcXCcnICsgcm9sZU5hbWUgKyAnXFwnIGRvZXMgbm90IGV4aXN0LicpXG4gICAgfVxuXG4gICAgLy8gZGV0ZWN0IGN5Y2xlc1xuICAgIGlmIChSb2xlcy5fZ2V0SW5oZXJpdGVkUm9sZU5hbWVzKHJvbGUpLmluY2x1ZGVzKHBhcmVudE5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JvbGVzIFxcJycgKyByb2xlTmFtZSArICdcXCcgYW5kIFxcJycgKyBwYXJlbnROYW1lICsgJ1xcJyB3b3VsZCBmb3JtIGEgY3ljbGUuJylcbiAgICB9XG5cbiAgICBjb3VudCA9IE1ldGVvci5yb2xlcy51cGRhdGUoe1xuICAgICAgX2lkOiBwYXJlbnROYW1lLFxuICAgICAgJ2NoaWxkcmVuLl9pZCc6IHtcbiAgICAgICAgJG5lOiByb2xlLl9pZFxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgICRwdXNoOiB7XG4gICAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgICAgX2lkOiByb2xlLl9pZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIGlmIHRoZXJlIHdhcyBubyBjaGFuZ2UsIHBhcmVudCByb2xlIG1pZ2h0IG5vdCBleGlzdCwgb3Igcm9sZSBpc1xuICAgIC8vIGFscmVhZHkgYSBzdWJyb2xlOyBpbiBhbnkgY2FzZSB3ZSBkbyBub3QgaGF2ZSBhbnl0aGluZyBtb3JlIHRvIGRvXG4gICAgaWYgKCFjb3VudCkgcmV0dXJuXG5cbiAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQudXBkYXRlKHtcbiAgICAgICdpbmhlcml0ZWRSb2xlcy5faWQnOiBwYXJlbnROYW1lXG4gICAgfSwge1xuICAgICAgJHB1c2g6IHtcbiAgICAgICAgaW5oZXJpdGVkUm9sZXM6IHsgJGVhY2g6IFtyb2xlLl9pZCwgLi4uUm9sZXMuX2dldEluaGVyaXRlZFJvbGVOYW1lcyhyb2xlKV0ubWFwKHIgPT4gKHsgX2lkOiByIH0pKSB9XG4gICAgICB9XG4gICAgfSwgeyBtdWx0aTogdHJ1ZSB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgcm9sZSBwYXJlbnQgZnJvbSByb2xlcy5cbiAgICpcbiAgICogT3RoZXIgcGFyZW50cyBhcmUga2VwdCAocm9sZSBjYW4gaGF2ZSBtdWx0aXBsZSBwYXJlbnRzKS4gRm9yIHVzZXJzIHdoaWNoIGhhdmUgdGhlXG4gICAqIHBhcmVudCByb2xlIHNldCwgcmVtb3ZlZCBzdWJyb2xlIGlzIHJlbW92ZWQgYXV0b21hdGljYWxseS5cbiAgICpcbiAgICogQG1ldGhvZCByZW1vdmVSb2xlc0Zyb21QYXJlbnRcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzTmFtZXMgTmFtZShzKSBvZiByb2xlKHMpLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyZW50TmFtZSBOYW1lIG9mIHBhcmVudCByb2xlLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICByZW1vdmVSb2xlc0Zyb21QYXJlbnQ6IGZ1bmN0aW9uIChyb2xlc05hbWVzLCBwYXJlbnROYW1lKSB7XG4gICAgLy8gZW5zdXJlIGFycmF5c1xuICAgIGlmICghQXJyYXkuaXNBcnJheShyb2xlc05hbWVzKSkgcm9sZXNOYW1lcyA9IFtyb2xlc05hbWVzXVxuXG4gICAgcm9sZXNOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChyb2xlTmFtZSkge1xuICAgICAgUm9sZXMuX3JlbW92ZVJvbGVGcm9tUGFyZW50KHJvbGVOYW1lLCBwYXJlbnROYW1lKVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX3JlbW92ZVJvbGVGcm9tUGFyZW50XG4gICAqIEBwYXJhbSB7U3RyaW5nfSByb2xlTmFtZSBOYW1lIG9mIHJvbGUuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJlbnROYW1lIE5hbWUgb2YgcGFyZW50IHJvbGUuXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9yZW1vdmVSb2xlRnJvbVBhcmVudDogZnVuY3Rpb24gKHJvbGVOYW1lLCBwYXJlbnROYW1lKSB7XG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocm9sZU5hbWUpXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocGFyZW50TmFtZSlcblxuICAgIC8vIGNoZWNrIGZvciByb2xlIGV4aXN0ZW5jZVxuICAgIC8vIHRoaXMgd291bGQgbm90IHJlYWxseSBiZSBuZWVkZWQsIGJ1dCB3ZSBhcmUgdHJ5aW5nIHRvIG1hdGNoIGFkZFJvbGVzVG9QYXJlbnRcbiAgICBsZXQgcm9sZSA9IE1ldGVvci5yb2xlcy5maW5kT25lKHsgX2lkOiByb2xlTmFtZSB9LCB7IGZpZWxkczogeyBfaWQ6IDEgfSB9KVxuXG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JvbGUgXFwnJyArIHJvbGVOYW1lICsgJ1xcJyBkb2VzIG5vdCBleGlzdC4nKVxuICAgIH1cblxuICAgIGNvbnN0IGNvdW50ID0gTWV0ZW9yLnJvbGVzLnVwZGF0ZSh7XG4gICAgICBfaWQ6IHBhcmVudE5hbWVcbiAgICB9LCB7XG4gICAgICAkcHVsbDoge1xuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgIF9pZDogcm9sZS5faWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBpZiB0aGVyZSB3YXMgbm8gY2hhbmdlLCBwYXJlbnQgcm9sZSBtaWdodCBub3QgZXhpc3QsIG9yIHJvbGUgd2FzXG4gICAgLy8gYWxyZWFkeSBub3QgYSBzdWJyb2xlOyBpbiBhbnkgY2FzZSB3ZSBkbyBub3QgaGF2ZSBhbnl0aGluZyBtb3JlIHRvIGRvXG4gICAgaWYgKCFjb3VudCkgcmV0dXJuXG5cbiAgICAvLyBGb3IgYWxsIHJvbGVzIHdobyBoYXZlIGhhZCBpdCBhcyBhIGRlcGVuZGVuY3kgLi4uXG4gICAgY29uc3Qgcm9sZXMgPSBbLi4uUm9sZXMuX2dldFBhcmVudFJvbGVOYW1lcyhNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogcGFyZW50TmFtZSB9KSksIHBhcmVudE5hbWVdXG5cbiAgICBNZXRlb3Iucm9sZXMuZmluZCh7IF9pZDogeyAkaW46IHJvbGVzIH0gfSkuZmV0Y2goKS5mb3JFYWNoKHIgPT4ge1xuICAgICAgY29uc3QgaW5oZXJpdGVkUm9sZXMgPSBSb2xlcy5fZ2V0SW5oZXJpdGVkUm9sZU5hbWVzKE1ldGVvci5yb2xlcy5maW5kT25lKHsgX2lkOiByLl9pZCB9KSlcbiAgICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC51cGRhdGUoe1xuICAgICAgICAncm9sZS5faWQnOiByLl9pZCxcbiAgICAgICAgJ2luaGVyaXRlZFJvbGVzLl9pZCc6IHJvbGUuX2lkXG4gICAgICB9LCB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICBpbmhlcml0ZWRSb2xlczogW3IuX2lkLCAuLi5pbmhlcml0ZWRSb2xlc10ubWFwKHIyID0+ICh7IF9pZDogcjIgfSkpXG4gICAgICAgIH1cbiAgICAgIH0sIHsgbXVsdGk6IHRydWUgfSlcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBBZGQgdXNlcnMgdG8gcm9sZXMuXG4gICAqXG4gICAqIEFkZHMgcm9sZXMgdG8gZXhpc3Rpbmcgcm9sZXMgZm9yIGVhY2ggdXNlci5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgIFJvbGVzLmFkZFVzZXJzVG9Sb2xlcyh1c2VySWQsICdhZG1pbicpXG4gICAqICAgICBSb2xlcy5hZGRVc2Vyc1RvUm9sZXModXNlcklkLCBbJ3ZpZXctc2VjcmV0cyddLCAnZXhhbXBsZS5jb20nKVxuICAgKiAgICAgUm9sZXMuYWRkVXNlcnNUb1JvbGVzKFt1c2VyMSwgdXNlcjJdLCBbJ3VzZXInLCdlZGl0b3InXSlcbiAgICogICAgIFJvbGVzLmFkZFVzZXJzVG9Sb2xlcyhbdXNlcjEsIHVzZXIyXSwgWydnbG9yaW91cy1hZG1pbicsICdwZXJmb3JtLWFjdGlvbiddLCAnZXhhbXBsZS5vcmcnKVxuICAgKlxuICAgKiBAbWV0aG9kIGFkZFVzZXJzVG9Sb2xlc1xuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gdXNlcnMgVXNlciBJRChzKSBvciBvYmplY3Qocykgd2l0aCBhbiBgX2lkYCBmaWVsZC5cbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzIE5hbWUocykgb2Ygcm9sZXMgdG8gYWRkIHVzZXJzIHRvLiBSb2xlcyBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGUsIG9yIGBudWxsYCBmb3IgdGhlIGdsb2JhbCByb2xlXG4gICAqICAgLSBgaWZFeGlzdHNgOiBpZiBgdHJ1ZWAsIGRvIG5vdCB0aHJvdyBhbiBleGNlcHRpb24gaWYgdGhlIHJvbGUgZG9lcyBub3QgZXhpc3RcbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSwgaXQgY2FuIGJlIGEgc2NvcGUgbmFtZSBzdHJpbmcuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGFkZFVzZXJzVG9Sb2xlczogZnVuY3Rpb24gKHVzZXJzLCByb2xlcywgb3B0aW9ucykge1xuICAgIHZhciBpZFxuXG4gICAgaWYgKCF1c2VycykgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIFxcJ3VzZXJzXFwnIHBhcmFtLicpXG4gICAgaWYgKCFyb2xlcykgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIFxcJ3JvbGVzXFwnIHBhcmFtLicpXG5cbiAgICBvcHRpb25zID0gUm9sZXMuX25vcm1hbGl6ZU9wdGlvbnMob3B0aW9ucylcblxuICAgIC8vIGVuc3VyZSBhcnJheXNcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodXNlcnMpKSB1c2VycyA9IFt1c2Vyc11cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocm9sZXMpKSByb2xlcyA9IFtyb2xlc11cblxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgaWZFeGlzdHM6IGZhbHNlXG4gICAgfSwgb3B0aW9ucylcblxuICAgIHVzZXJzLmZvckVhY2goZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgdXNlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWQgPSB1c2VyLl9pZFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWQgPSB1c2VyXG4gICAgICB9XG5cbiAgICAgIHJvbGVzLmZvckVhY2goZnVuY3Rpb24gKHJvbGUpIHtcbiAgICAgICAgUm9sZXMuX2FkZFVzZXJUb1JvbGUoaWQsIHJvbGUsIG9wdGlvbnMpXG4gICAgICB9KVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCB1c2Vycycgcm9sZXMuXG4gICAqXG4gICAqIFJlcGxhY2VzIGFsbCBleGlzdGluZyByb2xlcyB3aXRoIGEgbmV3IHNldCBvZiByb2xlcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgIFJvbGVzLnNldFVzZXJSb2xlcyh1c2VySWQsICdhZG1pbicpXG4gICAqICAgICBSb2xlcy5zZXRVc2VyUm9sZXModXNlcklkLCBbJ3ZpZXctc2VjcmV0cyddLCAnZXhhbXBsZS5jb20nKVxuICAgKiAgICAgUm9sZXMuc2V0VXNlclJvbGVzKFt1c2VyMSwgdXNlcjJdLCBbJ3VzZXInLCdlZGl0b3InXSlcbiAgICogICAgIFJvbGVzLnNldFVzZXJSb2xlcyhbdXNlcjEsIHVzZXIyXSwgWydnbG9yaW91cy1hZG1pbicsICdwZXJmb3JtLWFjdGlvbiddLCAnZXhhbXBsZS5vcmcnKVxuICAgKlxuICAgKiBAbWV0aG9kIHNldFVzZXJSb2xlc1xuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gdXNlcnMgVXNlciBJRChzKSBvciBvYmplY3Qocykgd2l0aCBhbiBgX2lkYCBmaWVsZC5cbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzIE5hbWUocykgb2Ygcm9sZXMgdG8gYWRkIHVzZXJzIHRvLiBSb2xlcyBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGUsIG9yIGBudWxsYCBmb3IgdGhlIGdsb2JhbCByb2xlXG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBgdHJ1ZWAsIHJlbW92ZSBhbGwgcm9sZXMgdGhlIHVzZXIgaGFzLCBvZiBhbnkgc2NvcGUsIGlmIGBmYWxzZWAsIG9ubHkgdGhlIG9uZSBpbiB0aGUgc2FtZSBzY29wZVxuICAgKiAgIC0gYGlmRXhpc3RzYDogaWYgYHRydWVgLCBkbyBub3QgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSByb2xlIGRvZXMgbm90IGV4aXN0XG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHksIGl0IGNhbiBiZSBhIHNjb3BlIG5hbWUgc3RyaW5nLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzZXRVc2VyUm9sZXM6IGZ1bmN0aW9uICh1c2Vycywgcm9sZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgaWRcblxuICAgIGlmICghdXNlcnMpIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBcXCd1c2Vyc1xcJyBwYXJhbS4nKVxuICAgIGlmICghcm9sZXMpIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBcXCdyb2xlc1xcJyBwYXJhbS4nKVxuXG4gICAgb3B0aW9ucyA9IFJvbGVzLl9ub3JtYWxpemVPcHRpb25zKG9wdGlvbnMpXG5cbiAgICAvLyBlbnN1cmUgYXJyYXlzXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHVzZXJzKSkgdXNlcnMgPSBbdXNlcnNdXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJvbGVzKSkgcm9sZXMgPSBbcm9sZXNdXG5cbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob3B0aW9ucy5zY29wZSlcblxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGlmRXhpc3RzOiBmYWxzZSxcbiAgICAgIGFueVNjb3BlOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMpXG5cbiAgICB1c2Vycy5mb3JFYWNoKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICBpZiAodHlwZW9mIHVzZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlkID0gdXNlci5faWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlkID0gdXNlclxuICAgICAgfVxuICAgICAgLy8gd2UgZmlyc3QgY2xlYXIgYWxsIHJvbGVzIGZvciB0aGUgdXNlclxuICAgICAgY29uc3Qgc2VsZWN0b3IgPSB7ICd1c2VyLl9pZCc6IGlkIH1cbiAgICAgIGlmICghb3B0aW9ucy5hbnlTY29wZSkge1xuICAgICAgICBzZWxlY3Rvci5zY29wZSA9IG9wdGlvbnMuc2NvcGVcbiAgICAgIH1cblxuICAgICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnJlbW92ZShzZWxlY3RvcilcblxuICAgICAgLy8gYW5kIHRoZW4gYWRkIGFsbFxuICAgICAgcm9sZXMuZm9yRWFjaChmdW5jdGlvbiAocm9sZSkge1xuICAgICAgICBSb2xlcy5fYWRkVXNlclRvUm9sZShpZCwgcm9sZSwgb3B0aW9ucylcbiAgICAgIH0pXG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogQWRkIG9uZSB1c2VyIHRvIG9uZSByb2xlLlxuICAgKlxuICAgKiBAbWV0aG9kIF9hZGRVc2VyVG9Sb2xlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWQgVGhlIHVzZXIgSUQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByb2xlTmFtZSBOYW1lIG9mIHRoZSByb2xlIHRvIGFkZCB0aGUgdXNlciB0by4gVGhlIHJvbGUgaGF2ZSB0byBleGlzdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uczpcbiAgICogICAtIGBzY29wZWA6IG5hbWUgb2YgdGhlIHNjb3BlLCBvciBgbnVsbGAgZm9yIHRoZSBnbG9iYWwgcm9sZVxuICAgKiAgIC0gYGlmRXhpc3RzYDogaWYgYHRydWVgLCBkbyBub3QgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSByb2xlIGRvZXMgbm90IGV4aXN0XG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9hZGRVc2VyVG9Sb2xlOiBmdW5jdGlvbiAodXNlcklkLCByb2xlTmFtZSwgb3B0aW9ucykge1xuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHJvbGVOYW1lKVxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgaWYgKCF1c2VySWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHJvbGUgPSBNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogcm9sZU5hbWUgfSwgeyBmaWVsZHM6IHsgY2hpbGRyZW46IDEgfSB9KVxuXG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICBpZiAob3B0aW9ucy5pZkV4aXN0cykge1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUm9sZSBcXCcnICsgcm9sZU5hbWUgKyAnXFwnIGRvZXMgbm90IGV4aXN0LicpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtaWdodCBjcmVhdGUgZHVwbGljYXRlcywgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgdW5pcXVlIGluZGV4LCBidXQgdGhhdCdzIGFsbCByaWdodC4gSW4gY2FzZSB0aGVyZSBhcmUgdHdvLCB3aXRoZHJhd2luZyB0aGUgcm9sZSB3aWxsIGVmZmVjdGl2ZWx5IGtpbGwgdGhlbSBib3RoLlxuICAgIGNvbnN0IHJlcyA9IE1ldGVvci5yb2xlQXNzaWdubWVudC51cHNlcnQoe1xuICAgICAgJ3VzZXIuX2lkJzogdXNlcklkLFxuICAgICAgJ3JvbGUuX2lkJzogcm9sZU5hbWUsXG4gICAgICBzY29wZTogb3B0aW9ucy5zY29wZVxuICAgIH0sIHtcbiAgICAgICRzZXRPbkluc2VydDoge1xuICAgICAgICB1c2VyOiB7IF9pZDogdXNlcklkIH0sXG4gICAgICAgIHJvbGU6IHsgX2lkOiByb2xlTmFtZSB9LFxuICAgICAgICBzY29wZTogb3B0aW9ucy5zY29wZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAocmVzLmluc2VydGVkSWQpIHtcbiAgICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC51cGRhdGUoeyBfaWQ6IHJlcy5pbnNlcnRlZElkIH0sIHtcbiAgICAgICAgJHNldDoge1xuICAgICAgICAgIGluaGVyaXRlZFJvbGVzOiBbcm9sZU5hbWUsIC4uLlJvbGVzLl9nZXRJbmhlcml0ZWRSb2xlTmFtZXMocm9sZSldLm1hcChyID0+ICh7IF9pZDogciB9KSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygcm9sZSBuYW1lcyB0aGUgZ2l2ZW4gcm9sZSBuYW1lIGlzIGEgY2hpbGQgb2YuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBSb2xlcy5fZ2V0UGFyZW50Um9sZU5hbWVzKHsgX2lkOiAnYWRtaW4nLCBjaGlsZHJlbjsgW10gfSlcbiAgICpcbiAgICogQG1ldGhvZCBfZ2V0UGFyZW50Um9sZU5hbWVzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSByb2xlIFRoZSByb2xlIG9iamVjdFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZ2V0UGFyZW50Um9sZU5hbWVzOiBmdW5jdGlvbiAocm9sZSkge1xuICAgIHZhciBwYXJlbnRSb2xlc1xuXG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICBwYXJlbnRSb2xlcyA9IG5ldyBTZXQoW3JvbGUuX2lkXSlcblxuICAgIHBhcmVudFJvbGVzLmZvckVhY2gocm9sZU5hbWUgPT4ge1xuICAgICAgTWV0ZW9yLnJvbGVzLmZpbmQoeyAnY2hpbGRyZW4uX2lkJzogcm9sZU5hbWUgfSkuZmV0Y2goKS5mb3JFYWNoKHBhcmVudFJvbGUgPT4ge1xuICAgICAgICBwYXJlbnRSb2xlcy5hZGQocGFyZW50Um9sZS5faWQpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBwYXJlbnRSb2xlcy5kZWxldGUocm9sZS5faWQpXG5cbiAgICByZXR1cm4gWy4uLnBhcmVudFJvbGVzXVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHJvbGUgbmFtZXMgdGhlIGdpdmVuIHJvbGUgbmFtZSBpcyBhIHBhcmVudCBvZi5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgIFJvbGVzLl9nZXRJbmhlcml0ZWRSb2xlTmFtZXMoeyBfaWQ6ICdhZG1pbicsIGNoaWxkcmVuOyBbXSB9KVxuICAgKlxuICAgKiBAbWV0aG9kIF9nZXRJbmhlcml0ZWRSb2xlTmFtZXNcbiAgICogQHBhcmFtIHtvYmplY3R9IHJvbGUgVGhlIHJvbGUgb2JqZWN0XG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9nZXRJbmhlcml0ZWRSb2xlTmFtZXM6IGZ1bmN0aW9uIChyb2xlKSB7XG4gICAgY29uc3QgaW5oZXJpdGVkUm9sZXMgPSBuZXcgU2V0KClcbiAgICBjb25zdCBuZXN0ZWRSb2xlcyA9IG5ldyBTZXQoW3JvbGVdKVxuXG4gICAgbmVzdGVkUm9sZXMuZm9yRWFjaChyID0+IHtcbiAgICAgIGNvbnN0IHJvbGVzID0gTWV0ZW9yLnJvbGVzLmZpbmQoeyBfaWQ6IHsgJGluOiByLmNoaWxkcmVuLm1hcChyID0+IHIuX2lkKSB9IH0sIHsgZmllbGRzOiB7IGNoaWxkcmVuOiAxIH0gfSkuZmV0Y2goKVxuXG4gICAgICByb2xlcy5mb3JFYWNoKHIyID0+IHtcbiAgICAgICAgaW5oZXJpdGVkUm9sZXMuYWRkKHIyLl9pZClcbiAgICAgICAgbmVzdGVkUm9sZXMuYWRkKHIyKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIFsuLi5pbmhlcml0ZWRSb2xlc11cbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIHVzZXJzIGZyb20gYXNzaWduZWQgcm9sZXMuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBSb2xlcy5yZW1vdmVVc2Vyc0Zyb21Sb2xlcyh1c2VySWQsICdhZG1pbicpXG4gICAqICAgICBSb2xlcy5yZW1vdmVVc2Vyc0Zyb21Sb2xlcyhbdXNlcklkLCB1c2VyMl0sIFsnZWRpdG9yJ10pXG4gICAqICAgICBSb2xlcy5yZW1vdmVVc2Vyc0Zyb21Sb2xlcyh1c2VySWQsIFsndXNlciddLCAnZ3JvdXAxJylcbiAgICpcbiAgICogQG1ldGhvZCByZW1vdmVVc2Vyc0Zyb21Sb2xlc1xuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gdXNlcnMgVXNlciBJRChzKSBvciBvYmplY3Qocykgd2l0aCBhbiBgX2lkYCBmaWVsZC5cbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzIE5hbWUocykgb2Ygcm9sZXMgdG8gcmVtb3ZlIHVzZXJzIGZyb20uIFJvbGVzIGhhdmUgdG8gZXhpc3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gW29wdGlvbnNdIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHRoZSBzY29wZSwgb3IgYG51bGxgIGZvciB0aGUgZ2xvYmFsIHJvbGVcbiAgICogICAtIGBhbnlTY29wZWA6IGlmIHNldCwgcm9sZSBjYW4gYmUgaW4gYW55IHNjb3BlIChgc2NvcGVgIG9wdGlvbiBpcyBpZ25vcmVkKVxuICAgKlxuICAgKiBBbHRlcm5hdGl2ZWx5LCBpdCBjYW4gYmUgYSBzY29wZSBuYW1lIHN0cmluZy5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgcmVtb3ZlVXNlcnNGcm9tUm9sZXM6IGZ1bmN0aW9uICh1c2Vycywgcm9sZXMsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXVzZXJzKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgXFwndXNlcnNcXCcgcGFyYW0uJylcbiAgICBpZiAoIXJvbGVzKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgXFwncm9sZXNcXCcgcGFyYW0uJylcblxuICAgIG9wdGlvbnMgPSBSb2xlcy5fbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgLy8gZW5zdXJlIGFycmF5c1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh1c2VycykpIHVzZXJzID0gW3VzZXJzXVxuICAgIGlmICghQXJyYXkuaXNBcnJheShyb2xlcykpIHJvbGVzID0gW3JvbGVzXVxuXG4gICAgUm9sZXMuX2NoZWNrU2NvcGVOYW1lKG9wdGlvbnMuc2NvcGUpXG5cbiAgICB1c2Vycy5mb3JFYWNoKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICBpZiAoIXVzZXIpIHJldHVyblxuXG4gICAgICByb2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChyb2xlKSB7XG4gICAgICAgIGxldCBpZFxuICAgICAgICBpZiAodHlwZW9mIHVzZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgaWQgPSB1c2VyLl9pZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlkID0gdXNlclxuICAgICAgICB9XG5cbiAgICAgICAgUm9sZXMuX3JlbW92ZVVzZXJGcm9tUm9sZShpZCwgcm9sZSwgb3B0aW9ucylcbiAgICAgIH0pXG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIG9uZSB1c2VyIGZyb20gb25lIHJvbGUuXG4gICAqXG4gICAqIEBtZXRob2QgX3JlbW92ZVVzZXJGcm9tUm9sZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSB1c2VyIElELlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcm9sZU5hbWUgTmFtZSBvZiB0aGUgcm9sZSB0byBhZGQgdGhlIHVzZXIgdG8uIFRoZSByb2xlIGhhdmUgdG8gZXhpc3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHRoZSBzY29wZSwgb3IgYG51bGxgIGZvciB0aGUgZ2xvYmFsIHJvbGVcbiAgICogICAtIGBhbnlTY29wZWA6IGlmIHNldCwgcm9sZSBjYW4gYmUgaW4gYW55IHNjb3BlIChgc2NvcGVgIG9wdGlvbiBpcyBpZ25vcmVkKVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfcmVtb3ZlVXNlckZyb21Sb2xlOiBmdW5jdGlvbiAodXNlcklkLCByb2xlTmFtZSwgb3B0aW9ucykge1xuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHJvbGVOYW1lKVxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgaWYgKCF1c2VySWQpIHJldHVyblxuXG4gICAgY29uc3Qgc2VsZWN0b3IgPSB7XG4gICAgICAndXNlci5faWQnOiB1c2VySWQsXG4gICAgICAncm9sZS5faWQnOiByb2xlTmFtZVxuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5hbnlTY29wZSkge1xuICAgICAgc2VsZWN0b3Iuc2NvcGUgPSBvcHRpb25zLnNjb3BlXG4gICAgfVxuXG4gICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnJlbW92ZShzZWxlY3RvcilcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdXNlciBoYXMgc3BlY2lmaWVkIHJvbGVzLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgLy8gZ2xvYmFsIHJvbGVzXG4gICAqICAgICBSb2xlcy51c2VySXNJblJvbGUodXNlciwgJ2FkbWluJylcbiAgICogICAgIFJvbGVzLnVzZXJJc0luUm9sZSh1c2VyLCBbJ2FkbWluJywnZWRpdG9yJ10pXG4gICAqICAgICBSb2xlcy51c2VySXNJblJvbGUodXNlcklkLCAnYWRtaW4nKVxuICAgKiAgICAgUm9sZXMudXNlcklzSW5Sb2xlKHVzZXJJZCwgWydhZG1pbicsJ2VkaXRvciddKVxuICAgKlxuICAgKiAgICAgLy8gc2NvcGUgcm9sZXMgKGdsb2JhbCByb2xlcyBhcmUgc3RpbGwgY2hlY2tlZClcbiAgICogICAgIFJvbGVzLnVzZXJJc0luUm9sZSh1c2VyLCAnYWRtaW4nLCAnZ3JvdXAxJylcbiAgICogICAgIFJvbGVzLnVzZXJJc0luUm9sZSh1c2VySWQsIFsnYWRtaW4nLCdlZGl0b3InXSwgJ2dyb3VwMScpXG4gICAqICAgICBSb2xlcy51c2VySXNJblJvbGUodXNlcklkLCBbJ2FkbWluJywnZWRpdG9yJ10sIHtzY29wZTogJ2dyb3VwMSd9KVxuICAgKlxuICAgKiBAbWV0aG9kIHVzZXJJc0luUm9sZVxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHVzZXIgVXNlciBJRCBvciBhbiBhY3R1YWwgdXNlciBvYmplY3QuXG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlcyBOYW1lIG9mIHJvbGUgb3IgYW4gYXJyYXkgb2Ygcm9sZXMgdG8gY2hlY2sgYWdhaW5zdC4gSWYgYXJyYXksXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIHJldHVybiBgdHJ1ZWAgaWYgdXNlciBpcyBpbiBfYW55XyByb2xlLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUm9sZXMgZG8gbm90IGhhdmUgdG8gZXhpc3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gW29wdGlvbnNdIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHRoZSBzY29wZTsgaWYgc3VwcGxpZWQsIGxpbWl0cyBjaGVjayB0byBqdXN0IHRoYXQgc2NvcGVcbiAgICogICAgIHRoZSB1c2VyJ3MgZ2xvYmFsIHJvbGVzIHdpbGwgYWx3YXlzIGJlIGNoZWNrZWQgd2hldGhlciBzY29wZSBpcyBzcGVjaWZpZWQgb3Igbm90XG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBzZXQsIHJvbGUgY2FuIGJlIGluIGFueSBzY29wZSAoYHNjb3BlYCBvcHRpb24gaXMgaWdub3JlZClcbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSwgaXQgY2FuIGJlIGEgc2NvcGUgbmFtZSBzdHJpbmcuXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiB1c2VyIGlzIGluIF9hbnlfIG9mIHRoZSB0YXJnZXQgcm9sZXNcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgdXNlcklzSW5Sb2xlOiBmdW5jdGlvbiAodXNlciwgcm9sZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgaWRcbiAgICB2YXIgc2VsZWN0b3JcblxuICAgIG9wdGlvbnMgPSBSb2xlcy5fbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgLy8gZW5zdXJlIGFycmF5IHRvIHNpbXBsaWZ5IGNvZGVcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocm9sZXMpKSByb2xlcyA9IFtyb2xlc11cblxuICAgIHJvbGVzID0gcm9sZXMuZmlsdGVyKHIgPT4gciAhPSBudWxsKVxuXG4gICAgaWYgKCFyb2xlcy5sZW5ndGgpIHJldHVybiBmYWxzZVxuXG4gICAgUm9sZXMuX2NoZWNrU2NvcGVOYW1lKG9wdGlvbnMuc2NvcGUpXG5cbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBhbnlTY29wZTogZmFsc2VcbiAgICB9LCBvcHRpb25zKVxuXG4gICAgaWYgKHVzZXIgJiYgdHlwZW9mIHVzZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZCA9IHVzZXIuX2lkXG4gICAgfSBlbHNlIHtcbiAgICAgIGlkID0gdXNlclxuICAgIH1cblxuICAgIGlmICghaWQpIHJldHVybiBmYWxzZVxuICAgIGlmICh0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2VcblxuICAgIHNlbGVjdG9yID0ge1xuICAgICAgJ3VzZXIuX2lkJzogaWRcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMuYW55U2NvcGUpIHtcbiAgICAgIHNlbGVjdG9yLnNjb3BlID0geyAkaW46IFtvcHRpb25zLnNjb3BlLCBudWxsXSB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvbGVzLnNvbWUoKHJvbGVOYW1lKSA9PiB7XG4gICAgICBzZWxlY3RvclsnaW5oZXJpdGVkUm9sZXMuX2lkJ10gPSByb2xlTmFtZVxuXG4gICAgICByZXR1cm4gTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmZpbmQoc2VsZWN0b3IsIHsgbGltaXQ6IDEgfSkuY291bnQoKSA+IDBcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB1c2VyJ3Mgcm9sZXMuXG4gICAqXG4gICAqIEBtZXRob2QgZ2V0Um9sZXNGb3JVc2VyXG4gICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gdXNlciBVc2VyIElEIG9yIGFuIGFjdHVhbCB1c2VyIG9iamVjdC5cbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBbb3B0aW9uc10gT3B0aW9uczpcbiAgICogICAtIGBzY29wZWA6IG5hbWUgb2Ygc2NvcGUgdG8gcHJvdmlkZSByb2xlcyBmb3I7IGlmIG5vdCBzcGVjaWZpZWQsIGdsb2JhbCByb2xlcyBhcmUgcmV0dXJuZWRcbiAgICogICAtIGBhbnlTY29wZWA6IGlmIHNldCwgcm9sZSBjYW4gYmUgaW4gYW55IHNjb3BlIChgc2NvcGVgIGFuZCBgb25seUFzc2lnbmVkYCBvcHRpb25zIGFyZSBpZ25vcmVkKVxuICAgKiAgIC0gYG9ubHlTY29wZWRgOiBpZiBzZXQsIG9ubHkgcm9sZXMgaW4gdGhlIHNwZWNpZmllZCBzY29wZSBhcmUgcmV0dXJuZWRcbiAgICogICAtIGBvbmx5QXNzaWduZWRgOiByZXR1cm4gb25seSBhc3NpZ25lZCByb2xlcyBhbmQgbm90IGF1dG9tYXRpY2FsbHkgaW5mZXJyZWQgKGxpa2Ugc3Vicm9sZXMpXG4gICAqICAgLSBgZnVsbE9iamVjdHNgOiByZXR1cm4gZnVsbCByb2xlcyBvYmplY3RzIChgdHJ1ZWApIG9yIGp1c3QgbmFtZXMgKGBmYWxzZWApIChgb25seUFzc2lnbmVkYCBvcHRpb24gaXMgaWdub3JlZCkgKGRlZmF1bHQgYGZhbHNlYClcbiAgICogICAgIElmIHlvdSBoYXZlIGEgdXNlLWNhc2UgZm9yIHRoaXMgb3B0aW9uLCBwbGVhc2UgZmlsZSBhIGZlYXR1cmUtcmVxdWVzdC4gWW91IHNob3VsZG4ndCBuZWVkIHRvIHVzZSBpdCBhcyBpdCdzXG4gICAqICAgICByZXN1bHQgc3Ryb25nbHkgZGVwZW5kYW50IG9uIHRoZSBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZSBvZiB0aGlzIHBsdWdpbi5cbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSwgaXQgY2FuIGJlIGEgc2NvcGUgbmFtZSBzdHJpbmcuXG4gICAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiB1c2VyJ3Mgcm9sZXMsIHVuc29ydGVkLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBnZXRSb2xlc0ZvclVzZXI6IGZ1bmN0aW9uICh1c2VyLCBvcHRpb25zKSB7XG4gICAgdmFyIGlkXG4gICAgdmFyIHNlbGVjdG9yXG4gICAgdmFyIGZpbHRlclxuICAgIHZhciByb2xlc1xuXG4gICAgb3B0aW9ucyA9IFJvbGVzLl9ub3JtYWxpemVPcHRpb25zKG9wdGlvbnMpXG5cbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob3B0aW9ucy5zY29wZSlcblxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGZ1bGxPYmplY3RzOiBmYWxzZSxcbiAgICAgIG9ubHlBc3NpZ25lZDogZmFsc2UsXG4gICAgICBhbnlTY29wZTogZmFsc2UsXG4gICAgICBvbmx5U2NvcGVkOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMpXG5cbiAgICBpZiAodXNlciAmJiB0eXBlb2YgdXNlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlkID0gdXNlci5faWRcbiAgICB9IGVsc2Uge1xuICAgICAgaWQgPSB1c2VyXG4gICAgfVxuXG4gICAgaWYgKCFpZCkgcmV0dXJuIFtdXG5cbiAgICBzZWxlY3RvciA9IHtcbiAgICAgICd1c2VyLl9pZCc6IGlkXG4gICAgfVxuXG4gICAgZmlsdGVyID0ge1xuICAgICAgZmllbGRzOiB7ICdpbmhlcml0ZWRSb2xlcy5faWQnOiAxIH1cbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMuYW55U2NvcGUpIHtcbiAgICAgIHNlbGVjdG9yLnNjb3BlID0geyAkaW46IFtvcHRpb25zLnNjb3BlXSB9XG5cbiAgICAgIGlmICghb3B0aW9ucy5vbmx5U2NvcGVkKSB7XG4gICAgICAgIHNlbGVjdG9yLnNjb3BlLiRpbi5wdXNoKG51bGwpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMub25seUFzc2lnbmVkKSB7XG4gICAgICBkZWxldGUgZmlsdGVyLmZpZWxkc1snaW5oZXJpdGVkUm9sZXMuX2lkJ11cbiAgICAgIGZpbHRlci5maWVsZHNbJ3JvbGUuX2lkJ10gPSAxXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZnVsbE9iamVjdHMpIHtcbiAgICAgIGRlbGV0ZSBmaWx0ZXIuZmllbGRzXG4gICAgfVxuXG4gICAgcm9sZXMgPSBNZXRlb3Iucm9sZUFzc2lnbm1lbnQuZmluZChzZWxlY3RvciwgZmlsdGVyKS5mZXRjaCgpXG5cbiAgICBpZiAob3B0aW9ucy5mdWxsT2JqZWN0cykge1xuICAgICAgcmV0dXJuIHJvbGVzXG4gICAgfVxuXG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KHJvbGVzLnJlZHVjZSgocmV2LCBjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5pbmhlcml0ZWRSb2xlcykge1xuICAgICAgICByZXR1cm4gcmV2LmNvbmNhdChjdXJyZW50LmluaGVyaXRlZFJvbGVzLm1hcChyID0+IHIuX2lkKSlcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudC5yb2xlKSB7XG4gICAgICAgIHJldi5wdXNoKGN1cnJlbnQucm9sZS5faWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmV2XG4gICAgfSwgW10pKV1cbiAgfSxcblxuICAvKipcbiAgICogUmV0cmlldmUgY3Vyc29yIG9mIGFsbCBleGlzdGluZyByb2xlcy5cbiAgICpcbiAgICogQG1ldGhvZCBnZXRBbGxSb2xlc1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3F1ZXJ5T3B0aW9uc10gT3B0aW9ucyB3aGljaCBhcmUgcGFzc2VkIGRpcmVjdGx5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdWdoIHRvIGBNZXRlb3Iucm9sZXMuZmluZChxdWVyeSwgb3B0aW9ucylgLlxuICAgKiBAcmV0dXJuIHtDdXJzb3J9IEN1cnNvciBvZiBleGlzdGluZyByb2xlcy5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgZ2V0QWxsUm9sZXM6IGZ1bmN0aW9uIChxdWVyeU9wdGlvbnMpIHtcbiAgICBxdWVyeU9wdGlvbnMgPSBxdWVyeU9wdGlvbnMgfHwgeyBzb3J0OiB7IF9pZDogMSB9IH1cblxuICAgIHJldHVybiBNZXRlb3Iucm9sZXMuZmluZCh7fSwgcXVlcnlPcHRpb25zKVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbGwgdXNlcnMgd2hvIGFyZSBpbiB0YXJnZXQgcm9sZS5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogQG1ldGhvZCBnZXRVc2Vyc0luUm9sZVxuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gcm9sZXMgTmFtZSBvZiByb2xlIG9yIGFuIGFycmF5IG9mIHJvbGVzLiBJZiBhcnJheSwgdXNlcnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkIHdpbGwgaGF2ZSBhdCBsZWFzdCBvbmUgb2YgdGhlIHJvbGVzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjaWZpZWQgYnV0IG5lZWQgbm90IGhhdmUgX2FsbF8gcm9sZXMuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb2xlcyBkbyBub3QgaGF2ZSB0byBleGlzdC5cbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBbb3B0aW9uc10gT3B0aW9uczpcbiAgICogICAtIGBzY29wZWA6IG5hbWUgb2YgdGhlIHNjb3BlIHRvIHJlc3RyaWN0IHJvbGVzIHRvOyB1c2VyJ3MgZ2xvYmFsXG4gICAqICAgICByb2xlcyB3aWxsIGFsc28gYmUgY2hlY2tlZFxuICAgKiAgIC0gYGFueVNjb3BlYDogaWYgc2V0LCByb2xlIGNhbiBiZSBpbiBhbnkgc2NvcGUgKGBzY29wZWAgb3B0aW9uIGlzIGlnbm9yZWQpXG4gICAqICAgLSBgb25seVNjb3BlZGA6IGlmIHNldCwgb25seSByb2xlcyBpbiB0aGUgc3BlY2lmaWVkIHNjb3BlIGFyZSByZXR1cm5lZFxuICAgKiAgIC0gYHF1ZXJ5T3B0aW9uc2A6IG9wdGlvbnMgd2hpY2ggYXJlIHBhc3NlZCBkaXJlY3RseVxuICAgKiAgICAgdGhyb3VnaCB0byBgTWV0ZW9yLnVzZXJzLmZpbmQocXVlcnksIG9wdGlvbnMpYFxuICAgKlxuICAgKiBBbHRlcm5hdGl2ZWx5LCBpdCBjYW4gYmUgYSBzY29wZSBuYW1lIHN0cmluZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtxdWVyeU9wdGlvbnNdIE9wdGlvbnMgd2hpY2ggYXJlIHBhc3NlZCBkaXJlY3RseVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3VnaCB0byBgTWV0ZW9yLnVzZXJzLmZpbmQocXVlcnksIG9wdGlvbnMpYFxuICAgKiBAcmV0dXJuIHtDdXJzb3J9IEN1cnNvciBvZiB1c2VycyBpbiByb2xlcy5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgZ2V0VXNlcnNJblJvbGU6IGZ1bmN0aW9uIChyb2xlcywgb3B0aW9ucywgcXVlcnlPcHRpb25zKSB7XG4gICAgdmFyIGlkc1xuXG4gICAgaWRzID0gUm9sZXMuZ2V0VXNlckFzc2lnbm1lbnRzRm9yUm9sZShyb2xlcywgb3B0aW9ucykuZmV0Y2goKS5tYXAoYSA9PiBhLnVzZXIuX2lkKVxuXG4gICAgcmV0dXJuIE1ldGVvci51c2Vycy5maW5kKHsgX2lkOiB7ICRpbjogaWRzIH0gfSwgKChvcHRpb25zICYmIG9wdGlvbnMucXVlcnlPcHRpb25zKSB8fCBxdWVyeU9wdGlvbnMpIHx8IHt9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbGwgYXNzaWdubWVudHMgb2YgYSB1c2VyIHdoaWNoIGFyZSBmb3IgdGhlIHRhcmdldCByb2xlLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiBAbWV0aG9kIGdldFVzZXJBc3NpZ25tZW50c0ZvclJvbGVcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzIE5hbWUgb2Ygcm9sZSBvciBhbiBhcnJheSBvZiByb2xlcy4gSWYgYXJyYXksIHVzZXJzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5lZCB3aWxsIGhhdmUgYXQgbGVhc3Qgb25lIG9mIHRoZSByb2xlc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lmaWVkIGJ1dCBuZWVkIG5vdCBoYXZlIF9hbGxfIHJvbGVzLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUm9sZXMgZG8gbm90IGhhdmUgdG8gZXhpc3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gW29wdGlvbnNdIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHRoZSBzY29wZSB0byByZXN0cmljdCByb2xlcyB0bzsgdXNlcidzIGdsb2JhbFxuICAgKiAgICAgcm9sZXMgd2lsbCBhbHNvIGJlIGNoZWNrZWRcbiAgICogICAtIGBhbnlTY29wZWA6IGlmIHNldCwgcm9sZSBjYW4gYmUgaW4gYW55IHNjb3BlIChgc2NvcGVgIG9wdGlvbiBpcyBpZ25vcmVkKVxuICAgKiAgIC0gYHF1ZXJ5T3B0aW9uc2A6IG9wdGlvbnMgd2hpY2ggYXJlIHBhc3NlZCBkaXJlY3RseVxuICAgKiAgICAgdGhyb3VnaCB0byBgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmZpbmQocXVlcnksIG9wdGlvbnMpYFxuXG4gICAqIEFsdGVybmF0aXZlbHksIGl0IGNhbiBiZSBhIHNjb3BlIG5hbWUgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtDdXJzb3J9IEN1cnNvciBvZiB1c2VyIGFzc2lnbm1lbnRzIGZvciByb2xlcy5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgZ2V0VXNlckFzc2lnbm1lbnRzRm9yUm9sZTogZnVuY3Rpb24gKHJvbGVzLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IFJvbGVzLl9ub3JtYWxpemVPcHRpb25zKG9wdGlvbnMpXG5cbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBhbnlTY29wZTogZmFsc2UsXG4gICAgICBxdWVyeU9wdGlvbnM6IHt9XG4gICAgfSwgb3B0aW9ucylcblxuICAgIHJldHVybiBSb2xlcy5fZ2V0VXNlcnNJblJvbGVDdXJzb3Iocm9sZXMsIG9wdGlvbnMsIG9wdGlvbnMucXVlcnlPcHRpb25zKVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9nZXRVc2Vyc0luUm9sZUN1cnNvclxuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gcm9sZXMgTmFtZSBvZiByb2xlIG9yIGFuIGFycmF5IG9mIHJvbGVzLiBJZiBhcnJheSwgaWRzIG9mIHVzZXJzIGFyZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWQgd2hpY2ggaGF2ZSBhdCBsZWFzdCBvbmUgb2YgdGhlIHJvbGVzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZCBidXQgbmVlZCBub3QgaGF2ZSBfYWxsXyByb2xlcy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvbGVzIGRvIG5vdCBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGUgdG8gcmVzdHJpY3Qgcm9sZXMgdG87IHVzZXIncyBnbG9iYWxcbiAgICogICAgIHJvbGVzIHdpbGwgYWxzbyBiZSBjaGVja2VkXG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBzZXQsIHJvbGUgY2FuIGJlIGluIGFueSBzY29wZSAoYHNjb3BlYCBvcHRpb24gaXMgaWdub3JlZClcbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSwgaXQgY2FuIGJlIGEgc2NvcGUgbmFtZSBzdHJpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbZmlsdGVyXSBPcHRpb25zIHdoaWNoIGFyZSBwYXNzZWQgZGlyZWN0bHlcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm91Z2ggdG8gYE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKHF1ZXJ5LCBvcHRpb25zKWBcbiAgICogQHJldHVybiB7T2JqZWN0fSBDdXJzb3IgdG8gdGhlIGFzc2lnbm1lbnQgZG9jdW1lbnRzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9nZXRVc2Vyc0luUm9sZUN1cnNvcjogZnVuY3Rpb24gKHJvbGVzLCBvcHRpb25zLCBmaWx0ZXIpIHtcbiAgICB2YXIgc2VsZWN0b3JcblxuICAgIG9wdGlvbnMgPSBSb2xlcy5fbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgYW55U2NvcGU6IGZhbHNlLFxuICAgICAgb25seVNjb3BlZDogZmFsc2VcbiAgICB9LCBvcHRpb25zKVxuXG4gICAgLy8gZW5zdXJlIGFycmF5IHRvIHNpbXBsaWZ5IGNvZGVcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocm9sZXMpKSByb2xlcyA9IFtyb2xlc11cblxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgZmlsdGVyID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBmaWVsZHM6IHsgJ3VzZXIuX2lkJzogMSB9XG4gICAgfSwgZmlsdGVyKVxuXG4gICAgc2VsZWN0b3IgPSB7XG4gICAgICAnaW5oZXJpdGVkUm9sZXMuX2lkJzogeyAkaW46IHJvbGVzIH1cbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMuYW55U2NvcGUpIHtcbiAgICAgIHNlbGVjdG9yLnNjb3BlID0geyAkaW46IFtvcHRpb25zLnNjb3BlXSB9XG5cbiAgICAgIGlmICghb3B0aW9ucy5vbmx5U2NvcGVkKSB7XG4gICAgICAgIHNlbGVjdG9yLnNjb3BlLiRpbi5wdXNoKG51bGwpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKHNlbGVjdG9yLCBmaWx0ZXIpXG4gIH0sXG5cbiAgLyoqXG4gICAqIERlcHJlY2F0ZWQuIFVzZSBgZ2V0U2NvcGVzRm9yVXNlcmAgaW5zdGVhZC5cbiAgICpcbiAgICogQG1ldGhvZCBnZXRHcm91cHNGb3JVc2VyXG4gICAqIEBzdGF0aWNcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldEdyb3Vwc0ZvclVzZXI6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgaWYgKCFnZXRHcm91cHNGb3JVc2VyRGVwcmVjYXRpb25XYXJuaW5nKSB7XG4gICAgICBnZXRHcm91cHNGb3JVc2VyRGVwcmVjYXRpb25XYXJuaW5nID0gdHJ1ZVxuICAgICAgY29uc29sZSAmJiBjb25zb2xlLndhcm4oJ2dldEdyb3Vwc0ZvclVzZXIgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGdldFNjb3Blc0ZvclVzZXIgaW5zdGVhZC4nKVxuICAgIH1cblxuICAgIHJldHVybiBSb2xlcy5nZXRTY29wZXNGb3JVc2VyKC4uLmFyZ3MpXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHVzZXJzIHNjb3BlcywgaWYgYW55LlxuICAgKlxuICAgKiBAbWV0aG9kIGdldFNjb3Blc0ZvclVzZXJcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB1c2VyIFVzZXIgSUQgb3IgYW4gYWN0dWFsIHVzZXIgb2JqZWN0LlxuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gW3JvbGVzXSBOYW1lIG9mIHJvbGVzIHRvIHJlc3RyaWN0IHNjb3BlcyB0by5cbiAgICpcbiAgICogQHJldHVybiB7QXJyYXl9IEFycmF5IG9mIHVzZXIncyBzY29wZXMsIHVuc29ydGVkLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBnZXRTY29wZXNGb3JVc2VyOiBmdW5jdGlvbiAodXNlciwgcm9sZXMpIHtcbiAgICB2YXIgc2NvcGVzXG4gICAgdmFyIGlkXG5cbiAgICBpZiAocm9sZXMgJiYgIUFycmF5LmlzQXJyYXkocm9sZXMpKSByb2xlcyA9IFtyb2xlc11cblxuICAgIGlmICh1c2VyICYmIHR5cGVvZiB1c2VyID09PSAnb2JqZWN0Jykge1xuICAgICAgaWQgPSB1c2VyLl9pZFxuICAgIH0gZWxzZSB7XG4gICAgICBpZCA9IHVzZXJcbiAgICB9XG5cbiAgICBpZiAoIWlkKSByZXR1cm4gW11cblxuICAgIGNvbnN0IHNlbGVjdG9yID0ge1xuICAgICAgJ3VzZXIuX2lkJzogaWQsXG4gICAgICBzY29wZTogeyAkbmU6IG51bGwgfVxuICAgIH1cblxuICAgIGlmIChyb2xlcykge1xuICAgICAgc2VsZWN0b3JbJ2luaGVyaXRlZFJvbGVzLl9pZCddID0geyAkaW46IHJvbGVzIH1cbiAgICB9XG5cbiAgICBzY29wZXMgPSBNZXRlb3Iucm9sZUFzc2lnbm1lbnQuZmluZChzZWxlY3RvciwgeyBmaWVsZHM6IHsgc2NvcGU6IDEgfSB9KS5mZXRjaCgpLm1hcChvYmkgPT4gb2JpLnNjb3BlKVxuXG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KHNjb3BlcyldXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbmFtZSBhIHNjb3BlLlxuICAgKlxuICAgKiBSb2xlcyBhc3NpZ25lZCB3aXRoIGEgZ2l2ZW4gc2NvcGUgYXJlIGNoYW5nZWQgdG8gYmUgdW5kZXIgdGhlIG5ldyBzY29wZS5cbiAgICpcbiAgICogQG1ldGhvZCByZW5hbWVTY29wZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb2xkTmFtZSBPbGQgbmFtZSBvZiBhIHNjb3BlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmV3TmFtZSBOZXcgbmFtZSBvZiBhIHNjb3BlLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICByZW5hbWVTY29wZTogZnVuY3Rpb24gKG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgICB2YXIgY291bnRcblxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvbGROYW1lKVxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShuZXdOYW1lKVxuXG4gICAgaWYgKG9sZE5hbWUgPT09IG5ld05hbWUpIHJldHVyblxuXG4gICAgZG8ge1xuICAgICAgY291bnQgPSBNZXRlb3Iucm9sZUFzc2lnbm1lbnQudXBkYXRlKHtcbiAgICAgICAgc2NvcGU6IG9sZE5hbWVcbiAgICAgIH0sIHtcbiAgICAgICAgJHNldDoge1xuICAgICAgICAgIHNjb3BlOiBuZXdOYW1lXG4gICAgICAgIH1cbiAgICAgIH0sIHsgbXVsdGk6IHRydWUgfSlcbiAgICB9IHdoaWxlIChjb3VudCA+IDApXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHNjb3BlLlxuICAgKlxuICAgKiBSb2xlcyBhc3NpZ25lZCB3aXRoIGEgZ2l2ZW4gc2NvcGUgYXJlIHJlbW92ZWQuXG4gICAqXG4gICAqIEBtZXRob2QgcmVtb3ZlU2NvcGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgYSBzY29wZS5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgcmVtb3ZlU2NvcGU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgUm9sZXMuX2NoZWNrU2NvcGVOYW1lKG5hbWUpXG5cbiAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQucmVtb3ZlKHsgc2NvcGU6IG5hbWUgfSlcbiAgfSxcblxuICAvKipcbiAgICogVGhyb3cgYW4gZXhjZXB0aW9uIGlmIGByb2xlTmFtZWAgaXMgYW4gaW52YWxpZCByb2xlIG5hbWUuXG4gICAqXG4gICAqIEBtZXRob2QgX2NoZWNrUm9sZU5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJvbGVOYW1lIEEgcm9sZSBuYW1lIHRvIG1hdGNoIGFnYWluc3QuXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9jaGVja1JvbGVOYW1lOiBmdW5jdGlvbiAocm9sZU5hbWUpIHtcbiAgICBpZiAoIXJvbGVOYW1lIHx8IHR5cGVvZiByb2xlTmFtZSAhPT0gJ3N0cmluZycgfHwgcm9sZU5hbWUudHJpbSgpICE9PSByb2xlTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJvbGUgbmFtZSBcXCcnICsgcm9sZU5hbWUgKyAnXFwnLicpXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kIG91dCBpZiBhIHJvbGUgaXMgYW4gYW5jZXN0b3Igb2YgYW5vdGhlciByb2xlLlxuICAgKlxuICAgKiBXQVJOSU5HOiBJZiB5b3UgY2hlY2sgdGhpcyBvbiB0aGUgY2xpZW50LCBwbGVhc2UgbWFrZSBzdXJlIGFsbCByb2xlcyBhcmUgcHVibGlzaGVkLlxuICAgKlxuICAgKiBAbWV0aG9kIGlzUGFyZW50T2ZcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmVudFJvbGVOYW1lIFRoZSByb2xlIHlvdSB3YW50IHRvIHJlc2VhcmNoLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gY2hpbGRSb2xlTmFtZSBUaGUgcm9sZSB5b3UgZXhwZWN0IHRvIGJlIGFtb25nIHRoZSBjaGlsZHJlbiBvZiBwYXJlbnRSb2xlTmFtZS5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgaXNQYXJlbnRPZjogZnVuY3Rpb24gKHBhcmVudFJvbGVOYW1lLCBjaGlsZFJvbGVOYW1lKSB7XG4gICAgaWYgKHBhcmVudFJvbGVOYW1lID09PSBjaGlsZFJvbGVOYW1lKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChwYXJlbnRSb2xlTmFtZSA9PSBudWxsIHx8IGNoaWxkUm9sZU5hbWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocGFyZW50Um9sZU5hbWUpXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUoY2hpbGRSb2xlTmFtZSlcblxuICAgIHZhciByb2xlc1RvQ2hlY2sgPSBbcGFyZW50Um9sZU5hbWVdXG4gICAgd2hpbGUgKHJvbGVzVG9DaGVjay5sZW5ndGggIT09IDApIHtcbiAgICAgIHZhciByb2xlTmFtZSA9IHJvbGVzVG9DaGVjay5wb3AoKVxuXG4gICAgICBpZiAocm9sZU5hbWUgPT09IGNoaWxkUm9sZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cblxuICAgICAgdmFyIHJvbGUgPSBNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogcm9sZU5hbWUgfSlcblxuICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgYnV0IHRoaXMgaXMgYSBwcm9ibGVtIHRvIGFkZHJlc3MgYXQgc29tZSBvdGhlciB0aW1lLlxuICAgICAgaWYgKCFyb2xlKSBjb250aW51ZVxuXG4gICAgICByb2xlc1RvQ2hlY2sgPSByb2xlc1RvQ2hlY2suY29uY2F0KHJvbGUuY2hpbGRyZW4ubWFwKHIgPT4gci5faWQpKVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgb3B0aW9ucy5cbiAgICpcbiAgICogQG1ldGhvZCBfbm9ybWFsaXplT3B0aW9uc1xuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIHRvIG5vcm1hbGl6ZS5cbiAgICogQHJldHVybiB7T2JqZWN0fSBOb3JtYWxpemVkIG9wdGlvbnMuXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9ub3JtYWxpemVPcHRpb25zOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zID09PSB1bmRlZmluZWQgPyB7fSA6IG9wdGlvbnNcblxuICAgIGlmIChvcHRpb25zID09PSBudWxsIHx8IHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsgc2NvcGU6IG9wdGlvbnMgfVxuICAgIH1cblxuICAgIG9wdGlvbnMuc2NvcGUgPSBSb2xlcy5fbm9ybWFsaXplU2NvcGVOYW1lKG9wdGlvbnMuc2NvcGUpXG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9LFxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgc2NvcGUgbmFtZS5cbiAgICpcbiAgICogQG1ldGhvZCBfbm9ybWFsaXplU2NvcGVOYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzY29wZU5hbWUgQSBzY29wZSBuYW1lIHRvIG5vcm1hbGl6ZS5cbiAgICogQHJldHVybiB7U3RyaW5nfSBOb3JtYWxpemVkIHNjb3BlIG5hbWUuXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9ub3JtYWxpemVTY29wZU5hbWU6IGZ1bmN0aW9uIChzY29wZU5hbWUpIHtcbiAgICAvLyBtYXAgdW5kZWZpbmVkIGFuZCBudWxsIHRvIG51bGxcbiAgICBpZiAoc2NvcGVOYW1lID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzY29wZU5hbWVcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRocm93IGFuIGV4Y2VwdGlvbiBpZiBgc2NvcGVOYW1lYCBpcyBhbiBpbnZhbGlkIHNjb3BlIG5hbWUuXG4gICAqXG4gICAqIEBtZXRob2QgX2NoZWNrUm9sZU5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNjb3BlTmFtZSBBIHNjb3BlIG5hbWUgdG8gbWF0Y2ggYWdhaW5zdC5cbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2NoZWNrU2NvcGVOYW1lOiBmdW5jdGlvbiAoc2NvcGVOYW1lKSB7XG4gICAgaWYgKHNjb3BlTmFtZSA9PT0gbnVsbCkgcmV0dXJuXG5cbiAgICBpZiAoIXNjb3BlTmFtZSB8fCB0eXBlb2Ygc2NvcGVOYW1lICE9PSAnc3RyaW5nJyB8fCBzY29wZU5hbWUudHJpbSgpICE9PSBzY29wZU5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzY29wZSBuYW1lIFxcJycgKyBzY29wZU5hbWUgKyAnXFwnLicpXG4gICAgfVxuICB9XG59KVxuIiwiLyogZ2xvYmFsIE1ldGVvciwgUm9sZXMgKi9cbmlmIChNZXRlb3Iucm9sZXMuY3JlYXRlSW5kZXgpIHtcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmNyZWF0ZUluZGV4KHsgJ3VzZXIuX2lkJzogMSwgJ2luaGVyaXRlZFJvbGVzLl9pZCc6IDEsIHNjb3BlOiAxIH0pXG4gIE1ldGVvci5yb2xlQXNzaWdubWVudC5jcmVhdGVJbmRleCh7ICd1c2VyLl9pZCc6IDEsICdyb2xlLl9pZCc6IDEsIHNjb3BlOiAxIH0pXG4gIE1ldGVvci5yb2xlQXNzaWdubWVudC5jcmVhdGVJbmRleCh7ICdyb2xlLl9pZCc6IDEgfSlcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmNyZWF0ZUluZGV4KHsgc2NvcGU6IDEsICd1c2VyLl9pZCc6IDEsICdpbmhlcml0ZWRSb2xlcy5faWQnOiAxIH0pIC8vIEFkZGluZyB1c2VySWQgYW5kIHJvbGVJZCBtaWdodCBzcGVlZCB1cCBvdGhlciBxdWVyaWVzIGRlcGVuZGluZyBvbiB0aGUgZmlyc3QgaW5kZXhcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmNyZWF0ZUluZGV4KHsgJ2luaGVyaXRlZFJvbGVzLl9pZCc6IDEgfSlcblxuICBNZXRlb3Iucm9sZXMuY3JlYXRlSW5kZXgoeyAnY2hpbGRyZW4uX2lkJzogMSB9KVxufSBlbHNlIHtcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50Ll9lbnN1cmVJbmRleCh7ICd1c2VyLl9pZCc6IDEsICdpbmhlcml0ZWRSb2xlcy5faWQnOiAxLCBzY29wZTogMSB9KVxuICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQuX2Vuc3VyZUluZGV4KHsgJ3VzZXIuX2lkJzogMSwgJ3JvbGUuX2lkJzogMSwgc2NvcGU6IDEgfSlcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50Ll9lbnN1cmVJbmRleCh7ICdyb2xlLl9pZCc6IDEgfSlcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50Ll9lbnN1cmVJbmRleCh7IHNjb3BlOiAxLCAndXNlci5faWQnOiAxLCAnaW5oZXJpdGVkUm9sZXMuX2lkJzogMSB9KSAvLyBBZGRpbmcgdXNlcklkIGFuZCByb2xlSWQgbWlnaHQgc3BlZWQgdXAgb3RoZXIgcXVlcmllcyBkZXBlbmRpbmcgb24gdGhlIGZpcnN0IGluZGV4XG4gIE1ldGVvci5yb2xlQXNzaWdubWVudC5fZW5zdXJlSW5kZXgoeyAnaW5oZXJpdGVkUm9sZXMuX2lkJzogMSB9KVxuXG4gIE1ldGVvci5yb2xlcy5fZW5zdXJlSW5kZXgoeyAnY2hpbGRyZW4uX2lkJzogMSB9KVxufVxuXG4vKlxuICogUHVibGlzaCBsb2dnZWQtaW4gdXNlcidzIHJvbGVzIHNvIGNsaWVudC1zaWRlIGNoZWNrcyBjYW4gd29yay5cbiAqXG4gKiBVc2UgYSBuYW1lZCBwdWJsaXNoIGZ1bmN0aW9uIHNvIGNsaWVudHMgY2FuIGNoZWNrIGByZWFkeSgpYCBzdGF0ZS5cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ19yb2xlcycsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxvZ2dlZEluVXNlcklkID0gdGhpcy51c2VySWRcbiAgdmFyIGZpZWxkcyA9IHsgcm9sZXM6IDEgfVxuXG4gIGlmICghbG9nZ2VkSW5Vc2VySWQpIHtcbiAgICB0aGlzLnJlYWR5KClcbiAgICByZXR1cm5cbiAgfVxuXG4gIHJldHVybiBNZXRlb3IudXNlcnMuZmluZChcbiAgICB7IF9pZDogbG9nZ2VkSW5Vc2VySWQgfSxcbiAgICB7IGZpZWxkczogZmllbGRzIH1cbiAgKVxufSlcblxuT2JqZWN0LmFzc2lnbihSb2xlcywge1xuICAvKipcbiAgICogQG1ldGhvZCBfaXNOZXdSb2xlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByb2xlIGBNZXRlb3Iucm9sZXNgIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHJvbGVgIGlzIGluIHRoZSBuZXcgZm9ybWF0LlxuICAgKiAgICAgICAgICAgICAgICAgICBJZiBpdCBpcyBhbWJpZ3VvdXMgb3IgaXQgaXMgbm90LCByZXR1cm5zIGBmYWxzZWAuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2lzTmV3Um9sZTogZnVuY3Rpb24gKHJvbGUpIHtcbiAgICByZXR1cm4gISgnbmFtZScgaW4gcm9sZSkgJiYgJ2NoaWxkcmVuJyBpbiByb2xlXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2lzT2xkUm9sZVxuICAgKiBAcGFyYW0ge09iamVjdH0gcm9sZSBgTWV0ZW9yLnJvbGVzYCBkb2N1bWVudC5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGByb2xlYCBpcyBpbiB0aGUgb2xkIGZvcm1hdC5cbiAgICogICAgICAgICAgICAgICAgICAgSWYgaXQgaXMgYW1iaWd1b3VzIG9yIGl0IGlzIG5vdCwgcmV0dXJucyBgZmFsc2VgLlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9pc09sZFJvbGU6IGZ1bmN0aW9uIChyb2xlKSB7XG4gICAgcmV0dXJuICduYW1lJyBpbiByb2xlICYmICEoJ2NoaWxkcmVuJyBpbiByb2xlKVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9pc05ld0ZpZWxkXG4gICAqIEBwYXJhbSB7QXJyYXl9IHJvbGVzIGBNZXRlb3IudXNlcnNgIGRvY3VtZW50IGByb2xlc2AgZmllbGQuXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgcm9sZXNgIGZpZWxkIGlzIGluIHRoZSBuZXcgZm9ybWF0LlxuICAgKiAgICAgICAgICAgICAgICAgICBJZiBpdCBpcyBhbWJpZ3VvdXMgb3IgaXQgaXMgbm90LCByZXR1cm5zIGBmYWxzZWAuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2lzTmV3RmllbGQ6IGZ1bmN0aW9uIChyb2xlcykge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHJvbGVzKSAmJiAodHlwZW9mIHJvbGVzWzBdID09PSAnb2JqZWN0JylcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfaXNPbGRGaWVsZFxuICAgKiBAcGFyYW0ge0FycmF5fSByb2xlcyBgTWV0ZW9yLnVzZXJzYCBkb2N1bWVudCBgcm9sZXNgIGZpZWxkLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHJvbGVzYCBmaWVsZCBpcyBpbiB0aGUgb2xkIGZvcm1hdC5cbiAgICogICAgICAgICAgICAgICAgICAgSWYgaXQgaXMgYW1iaWd1b3VzIG9yIGl0IGlzIG5vdCwgcmV0dXJucyBgZmFsc2VgLlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9pc09sZEZpZWxkOiBmdW5jdGlvbiAocm9sZXMpIHtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkocm9sZXMpICYmICh0eXBlb2Ygcm9sZXNbMF0gPT09ICdzdHJpbmcnKSkgfHwgKCh0eXBlb2Ygcm9sZXMgPT09ICdvYmplY3QnKSAmJiAhQXJyYXkuaXNBcnJheShyb2xlcykpXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2NvbnZlcnRUb05ld1JvbGVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9sZFJvbGUgYE1ldGVvci5yb2xlc2AgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge09iamVjdH0gQ29udmVydGVkIGByb2xlYCB0byB0aGUgbmV3IGZvcm1hdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY29udmVydFRvTmV3Um9sZTogZnVuY3Rpb24gKG9sZFJvbGUpIHtcbiAgICBpZiAoISh0eXBlb2Ygb2xkUm9sZS5uYW1lID09PSAnc3RyaW5nJykpIHRocm93IG5ldyBFcnJvcihcIlJvbGUgbmFtZSAnXCIgKyBvbGRSb2xlLm5hbWUgKyBcIicgaXMgbm90IGEgc3RyaW5nLlwiKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIF9pZDogb2xkUm9sZS5uYW1lLFxuICAgICAgY2hpbGRyZW46IFtdXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9jb252ZXJ0VG9PbGRSb2xlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBuZXdSb2xlIGBNZXRlb3Iucm9sZXNgIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IENvbnZlcnRlZCBgcm9sZWAgdG8gdGhlIG9sZCBmb3JtYXQuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2NvbnZlcnRUb09sZFJvbGU6IGZ1bmN0aW9uIChuZXdSb2xlKSB7XG4gICAgaWYgKCEodHlwZW9mIG5ld1JvbGUuX2lkID09PSAnc3RyaW5nJykpIHRocm93IG5ldyBFcnJvcihcIlJvbGUgbmFtZSAnXCIgKyBuZXdSb2xlLl9pZCArIFwiJyBpcyBub3QgYSBzdHJpbmcuXCIpXG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmV3Um9sZS5faWRcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2NvbnZlcnRUb05ld0ZpZWxkXG4gICAqIEBwYXJhbSB7QXJyYXl9IG9sZFJvbGVzIGBNZXRlb3IudXNlcnNgIGRvY3VtZW50IGByb2xlc2AgZmllbGQgaW4gdGhlIG9sZCBmb3JtYXQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzIFNob3VsZCB3ZSBjb252ZXJ0IHVuZGVyc2NvcmVzIHRvIGRvdHMgaW4gZ3JvdXAgbmFtZXMuXG4gICAqIEByZXR1cm4ge0FycmF5fSBDb252ZXJ0ZWQgYHJvbGVzYCB0byB0aGUgbmV3IGZvcm1hdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY29udmVydFRvTmV3RmllbGQ6IGZ1bmN0aW9uIChvbGRSb2xlcywgY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzKSB7XG4gICAgdmFyIHJvbGVzID0gW11cbiAgICBpZiAoQXJyYXkuaXNBcnJheShvbGRSb2xlcykpIHtcbiAgICAgIG9sZFJvbGVzLmZvckVhY2goZnVuY3Rpb24gKHJvbGUsIGluZGV4KSB7XG4gICAgICAgIGlmICghKHR5cGVvZiByb2xlID09PSAnc3RyaW5nJykpIHRocm93IG5ldyBFcnJvcihcIlJvbGUgJ1wiICsgcm9sZSArIFwiJyBpcyBub3QgYSBzdHJpbmcuXCIpXG5cbiAgICAgICAgcm9sZXMucHVzaCh7XG4gICAgICAgICAgX2lkOiByb2xlLFxuICAgICAgICAgIHNjb3BlOiBudWxsLFxuICAgICAgICAgIGFzc2lnbmVkOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9sZFJvbGVzID09PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmVudHJpZXMob2xkUm9sZXMpLmZvckVhY2goKFtncm91cCwgcm9sZXNBcnJheV0pID0+IHtcbiAgICAgICAgaWYgKGdyb3VwID09PSAnX19nbG9iYWxfcm9sZXNfXycpIHtcbiAgICAgICAgICBncm91cCA9IG51bGxcbiAgICAgICAgfSBlbHNlIGlmIChjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMpIHtcbiAgICAgICAgICAvLyB1bmVzY2FwZVxuICAgICAgICAgIGdyb3VwID0gZ3JvdXAucmVwbGFjZSgvXy9nLCAnLicpXG4gICAgICAgIH1cblxuICAgICAgICByb2xlc0FycmF5LmZvckVhY2goZnVuY3Rpb24gKHJvbGUpIHtcbiAgICAgICAgICBpZiAoISh0eXBlb2Ygcm9sZSA9PT0gJ3N0cmluZycpKSB0aHJvdyBuZXcgRXJyb3IoXCJSb2xlICdcIiArIHJvbGUgKyBcIicgaXMgbm90IGEgc3RyaW5nLlwiKVxuXG4gICAgICAgICAgcm9sZXMucHVzaCh7XG4gICAgICAgICAgICBfaWQ6IHJvbGUsXG4gICAgICAgICAgICBzY29wZTogZ3JvdXAsXG4gICAgICAgICAgICBhc3NpZ25lZDogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcm9sZXNcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfY29udmVydFRvT2xkRmllbGRcbiAgICogQHBhcmFtIHtBcnJheX0gbmV3Um9sZXMgYE1ldGVvci51c2Vyc2AgZG9jdW1lbnQgYHJvbGVzYCBmaWVsZCBpbiB0aGUgbmV3IGZvcm1hdC5cbiAgICogQHBhcmFtIHtCb29sZWFufSB1c2luZ0dyb3VwcyBTaG91bGQgd2UgdXNlIGdyb3VwcyBvciBub3QuXG4gICAqIEByZXR1cm4ge0FycmF5fSBDb252ZXJ0ZWQgYHJvbGVzYCB0byB0aGUgb2xkIGZvcm1hdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY29udmVydFRvT2xkRmllbGQ6IGZ1bmN0aW9uIChuZXdSb2xlcywgdXNpbmdHcm91cHMpIHtcbiAgICB2YXIgcm9sZXNcblxuICAgIGlmICh1c2luZ0dyb3Vwcykge1xuICAgICAgcm9sZXMgPSB7fVxuICAgIH0gZWxzZSB7XG4gICAgICByb2xlcyA9IFtdXG4gICAgfVxuXG4gICAgbmV3Um9sZXMuZm9yRWFjaChmdW5jdGlvbiAodXNlclJvbGUpIHtcbiAgICAgIGlmICghKHR5cGVvZiB1c2VyUm9sZSA9PT0gJ29iamVjdCcpKSB0aHJvdyBuZXcgRXJyb3IoXCJSb2xlICdcIiArIHVzZXJSb2xlICsgXCInIGlzIG5vdCBhbiBvYmplY3QuXCIpXG5cbiAgICAgIC8vIFdlIGFzc3VtZSB0aGF0IHdlIGFyZSBjb252ZXJ0aW5nIGJhY2sgYSBmYWlsZWQgbWlncmF0aW9uLCBzbyB2YWx1ZXMgY2FuIG9ubHkgYmVcbiAgICAgIC8vIHdoYXQgd2VyZSB2YWxpZCB2YWx1ZXMgaW4gMS4wLiBTbyBubyBncm91cCBuYW1lcyBzdGFydGluZyB3aXRoICQgYW5kIG5vIHN1YnJvbGVzLlxuXG4gICAgICBpZiAodXNlclJvbGUuc2NvcGUpIHtcbiAgICAgICAgaWYgKCF1c2luZ0dyb3VwcykgdGhyb3cgbmV3IEVycm9yKFwiUm9sZSAnXCIgKyB1c2VyUm9sZS5faWQgKyBcIicgd2l0aCBzY29wZSAnXCIgKyB1c2VyUm9sZS5zY29wZSArIFwiJyB3aXRob3V0IGVuYWJsZWQgZ3JvdXBzLlwiKVxuXG4gICAgICAgIC8vIGVzY2FwZVxuICAgICAgICB2YXIgc2NvcGUgPSB1c2VyUm9sZS5zY29wZS5yZXBsYWNlKC9cXC4vZywgJ18nKVxuXG4gICAgICAgIGlmIChzY29wZVswXSA9PT0gJyQnKSB0aHJvdyBuZXcgRXJyb3IoXCJHcm91cCBuYW1lICdcIiArIHNjb3BlICsgXCInIHN0YXJ0IHdpdGggJC5cIilcblxuICAgICAgICByb2xlc1tzY29wZV0gPSByb2xlc1tzY29wZV0gfHwgW11cbiAgICAgICAgcm9sZXNbc2NvcGVdLnB1c2godXNlclJvbGUuX2lkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHVzaW5nR3JvdXBzKSB7XG4gICAgICAgICAgcm9sZXMuX19nbG9iYWxfcm9sZXNfXyA9IHJvbGVzLl9fZ2xvYmFsX3JvbGVzX18gfHwgW11cbiAgICAgICAgICByb2xlcy5fX2dsb2JhbF9yb2xlc19fLnB1c2godXNlclJvbGUuX2lkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJvbGVzLnB1c2godXNlclJvbGUuX2lkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gcm9sZXNcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfZGVmYXVsdFVwZGF0ZVVzZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IHVzZXIgYE1ldGVvci51c2Vyc2AgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSByb2xlcyBWYWx1ZSB0byB3aGljaCB1c2VyJ3MgYHJvbGVzYCBmaWVsZCBzaG91bGQgYmUgc2V0LlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9kZWZhdWx0VXBkYXRlVXNlcjogZnVuY3Rpb24gKHVzZXIsIHJvbGVzKSB7XG4gICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7XG4gICAgICBfaWQ6IHVzZXIuX2lkLFxuICAgICAgLy8gbWFraW5nIHN1cmUgbm90aGluZyBjaGFuZ2VkIGluIG1lYW50aW1lXG4gICAgICByb2xlczogdXNlci5yb2xlc1xuICAgIH0sIHtcbiAgICAgICRzZXQ6IHsgcm9sZXMgfVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2RlZmF1bHRVcGRhdGVSb2xlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvbGRSb2xlIE9sZCBgTWV0ZW9yLnJvbGVzYCBkb2N1bWVudC5cbiAgICogQHBhcmFtIHtPYmplY3R9IG5ld1JvbGUgTmV3IGBNZXRlb3Iucm9sZXNgIGRvY3VtZW50LlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9kZWZhdWx0VXBkYXRlUm9sZTogZnVuY3Rpb24gKG9sZFJvbGUsIG5ld1JvbGUpIHtcbiAgICBNZXRlb3Iucm9sZXMucmVtb3ZlKG9sZFJvbGUuX2lkKVxuICAgIE1ldGVvci5yb2xlcy5pbnNlcnQobmV3Um9sZSlcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfZHJvcENvbGxlY3Rpb25JbmRleFxuICAgKiBAcGFyYW0ge09iamVjdH0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIG9uIHdoaWNoIHRvIGRyb3AgdGhlIGluZGV4LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaW5kZXhOYW1lIE5hbWUgb2YgdGhlIGluZGV4IHRvIGRyb3AuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2Ryb3BDb2xsZWN0aW9uSW5kZXg6IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleE5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgY29sbGVjdGlvbi5fZHJvcEluZGV4KGluZGV4TmFtZSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnTW9uZ29FcnJvcicpIHRocm93IGVcbiAgICAgIGlmICghL2luZGV4IG5vdCBmb3VuZC8udGVzdChlLmVyciB8fCBlLmVycm1zZykpIHRocm93IGVcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVzIGBNZXRlb3IudXNlcnNgIGFuZCBgTWV0ZW9yLnJvbGVzYCB0byB0aGUgbmV3IGZvcm1hdC5cbiAgICpcbiAgICogQG1ldGhvZCBfZm9yd2FyZE1pZ3JhdGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gdXBkYXRlVXNlciBGdW5jdGlvbiB3aGljaCB1cGRhdGVzIHRoZSB1c2VyIG9iamVjdC4gRGVmYXVsdCBgX2RlZmF1bHRVcGRhdGVVc2VyYC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gdXBkYXRlUm9sZSBGdW5jdGlvbiB3aGljaCB1cGRhdGVzIHRoZSByb2xlIG9iamVjdC4gRGVmYXVsdCBgX2RlZmF1bHRVcGRhdGVSb2xlYC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMgU2hvdWxkIHdlIGNvbnZlcnQgdW5kZXJzY29yZXMgdG8gZG90cyBpbiBncm91cCBuYW1lcy5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZm9yd2FyZE1pZ3JhdGU6IGZ1bmN0aW9uICh1cGRhdGVVc2VyLCB1cGRhdGVSb2xlLCBjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMpIHtcbiAgICB1cGRhdGVVc2VyID0gdXBkYXRlVXNlciB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVVzZXJcbiAgICB1cGRhdGVSb2xlID0gdXBkYXRlUm9sZSB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVJvbGVcblxuICAgIFJvbGVzLl9kcm9wQ29sbGVjdGlvbkluZGV4KE1ldGVvci5yb2xlcywgJ25hbWVfMScpXG5cbiAgICBNZXRlb3Iucm9sZXMuZmluZCgpLmZvckVhY2goZnVuY3Rpb24gKHJvbGUsIGluZGV4LCBjdXJzb3IpIHtcbiAgICAgIGlmICghUm9sZXMuX2lzTmV3Um9sZShyb2xlKSkge1xuICAgICAgICB1cGRhdGVSb2xlKHJvbGUsIFJvbGVzLl9jb252ZXJ0VG9OZXdSb2xlKHJvbGUpKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBNZXRlb3IudXNlcnMuZmluZCgpLmZvckVhY2goZnVuY3Rpb24gKHVzZXIsIGluZGV4LCBjdXJzb3IpIHtcbiAgICAgIGlmICghUm9sZXMuX2lzTmV3RmllbGQodXNlci5yb2xlcykpIHtcbiAgICAgICAgdXBkYXRlVXNlcih1c2VyLCBSb2xlcy5fY29udmVydFRvTmV3RmllbGQodXNlci5yb2xlcywgY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzKSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgYXNzaWdubWVudHMgZnJvbSBgTWV0ZW9yLnVzZXJzYCB0byBgTWV0ZW9yLnJvbGVBc3NpZ25tZW50YC5cbiAgICpcbiAgICogQG1ldGhvZCBfZm9yd2FyZE1pZ3JhdGUyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1c2VyU2VsZWN0b3IgQW4gb3Bwb3J0dW5pdHkgdG8gc2hhcmUgdGhlIHdvcmsgYW1vbmcgaW5zdGFuY2VzLiBJdCdzIGFkdmlzYWJsZSB0byBkbyB0aGUgZGl2aXNpb24gYmFzZWQgb24gdXNlci1pZC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZm9yd2FyZE1pZ3JhdGUyOiBmdW5jdGlvbiAodXNlclNlbGVjdG9yKSB7XG4gICAgdXNlclNlbGVjdG9yID0gdXNlclNlbGVjdG9yIHx8IHt9XG4gICAgT2JqZWN0LmFzc2lnbih1c2VyU2VsZWN0b3IsIHsgcm9sZXM6IHsgJG5lOiBudWxsIH0gfSlcblxuICAgIE1ldGVvci51c2Vycy5maW5kKHVzZXJTZWxlY3RvcikuZm9yRWFjaChmdW5jdGlvbiAodXNlciwgaW5kZXgpIHtcbiAgICAgIHVzZXIucm9sZXMuZmlsdGVyKChyKSA9PiByLmFzc2lnbmVkKS5mb3JFYWNoKHIgPT4ge1xuICAgICAgICAvLyBBZGRlZCBgaWZFeGlzdHNgIHRvIG1ha2UgaXQgbGVzcyBlcnJvci1wcm9uZVxuICAgICAgICBSb2xlcy5fYWRkVXNlclRvUm9sZSh1c2VyLl9pZCwgci5faWQsIHsgc2NvcGU6IHIuc2NvcGUsIGlmRXhpc3RzOiB0cnVlIH0pXG4gICAgICB9KVxuXG4gICAgICBNZXRlb3IudXNlcnMudXBkYXRlKHsgX2lkOiB1c2VyLl9pZCB9LCB7ICR1bnNldDogeyByb2xlczogJycgfSB9KVxuICAgIH0pXG5cbiAgICAvLyBObyBuZWVkIHRvIGtlZXAgdGhlIGluZGV4ZXMgYXJvdW5kXG4gICAgUm9sZXMuX2Ryb3BDb2xsZWN0aW9uSW5kZXgoTWV0ZW9yLnVzZXJzLCAncm9sZXMuX2lkXzFfcm9sZXMuc2NvcGVfMScpXG4gICAgUm9sZXMuX2Ryb3BDb2xsZWN0aW9uSW5kZXgoTWV0ZW9yLnVzZXJzLCAncm9sZXMuc2NvcGVfMScpXG4gIH0sXG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVzIGBNZXRlb3IudXNlcnNgIGFuZCBgTWV0ZW9yLnJvbGVzYCB0byB0aGUgb2xkIGZvcm1hdC5cbiAgICpcbiAgICogV2UgYXNzdW1lIHRoYXQgd2UgYXJlIGNvbnZlcnRpbmcgYmFjayBhIGZhaWxlZCBtaWdyYXRpb24sIHNvIHZhbHVlcyBjYW4gb25seSBiZVxuICAgKiB3aGF0IHdlcmUgdmFsaWQgdmFsdWVzIGluIHRoZSBvbGQgZm9ybWF0LiBTbyBubyBncm91cCBuYW1lcyBzdGFydGluZyB3aXRoIGAkYCBhbmRcbiAgICogbm8gc3Vicm9sZXMuXG4gICAqXG4gICAqIEBtZXRob2QgX2JhY2t3YXJkTWlncmF0ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB1cGRhdGVVc2VyIEZ1bmN0aW9uIHdoaWNoIHVwZGF0ZXMgdGhlIHVzZXIgb2JqZWN0LiBEZWZhdWx0IGBfZGVmYXVsdFVwZGF0ZVVzZXJgLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB1cGRhdGVSb2xlIEZ1bmN0aW9uIHdoaWNoIHVwZGF0ZXMgdGhlIHJvbGUgb2JqZWN0LiBEZWZhdWx0IGBfZGVmYXVsdFVwZGF0ZVJvbGVgLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHVzaW5nR3JvdXBzIFNob3VsZCB3ZSB1c2UgZ3JvdXBzIG9yIG5vdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfYmFja3dhcmRNaWdyYXRlOiBmdW5jdGlvbiAodXBkYXRlVXNlciwgdXBkYXRlUm9sZSwgdXNpbmdHcm91cHMpIHtcbiAgICB1cGRhdGVVc2VyID0gdXBkYXRlVXNlciB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVVzZXJcbiAgICB1cGRhdGVSb2xlID0gdXBkYXRlUm9sZSB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVJvbGVcblxuICAgIFJvbGVzLl9kcm9wQ29sbGVjdGlvbkluZGV4KE1ldGVvci51c2VycywgJ3JvbGVzLl9pZF8xX3JvbGVzLnNjb3BlXzEnKVxuICAgIFJvbGVzLl9kcm9wQ29sbGVjdGlvbkluZGV4KE1ldGVvci51c2VycywgJ3JvbGVzLnNjb3BlXzEnKVxuXG4gICAgTWV0ZW9yLnJvbGVzLmZpbmQoKS5mb3JFYWNoKGZ1bmN0aW9uIChyb2xlLCBpbmRleCwgY3Vyc29yKSB7XG4gICAgICBpZiAoIVJvbGVzLl9pc09sZFJvbGUocm9sZSkpIHtcbiAgICAgICAgdXBkYXRlUm9sZShyb2xlLCBSb2xlcy5fY29udmVydFRvT2xkUm9sZShyb2xlKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgTWV0ZW9yLnVzZXJzLmZpbmQoKS5mb3JFYWNoKGZ1bmN0aW9uICh1c2VyLCBpbmRleCwgY3Vyc29yKSB7XG4gICAgICBpZiAoIVJvbGVzLl9pc09sZEZpZWxkKHVzZXIucm9sZXMpKSB7XG4gICAgICAgIHVwZGF0ZVVzZXIodXNlciwgUm9sZXMuX2NvbnZlcnRUb09sZEZpZWxkKHVzZXIucm9sZXMsIHVzaW5nR3JvdXBzKSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgYXNzaWdubWVudHMgZnJvbSBgTWV0ZW9yLnJvbGVBc3NpZ25tZW50YCBiYWNrIHRvIHRvIGBNZXRlb3IudXNlcnNgLlxuICAgKlxuICAgKiBAbWV0aG9kIF9iYWNrd2FyZE1pZ3JhdGUyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhc3NpZ25tZW50U2VsZWN0b3IgQW4gb3Bwb3J0dW5pdHkgdG8gc2hhcmUgdGhlIHdvcmsgYW1vbmcgaW5zdGFuY2VzLiBJdCdzIGFkdmlzYWJsZSB0byBkbyB0aGUgZGl2aXNpb24gYmFzZWQgb24gdXNlci1pZC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfYmFja3dhcmRNaWdyYXRlMjogZnVuY3Rpb24gKGFzc2lnbm1lbnRTZWxlY3Rvcikge1xuICAgIGFzc2lnbm1lbnRTZWxlY3RvciA9IGFzc2lnbm1lbnRTZWxlY3RvciB8fCB7fVxuXG4gICAgaWYgKE1ldGVvci51c2Vycy5jcmVhdGVJbmRleCkge1xuICAgICAgTWV0ZW9yLnVzZXJzLmNyZWF0ZUluZGV4KHsgJ3JvbGVzLl9pZCc6IDEsICdyb2xlcy5zY29wZSc6IDEgfSlcbiAgICAgIE1ldGVvci51c2Vycy5jcmVhdGVJbmRleCh7ICdyb2xlcy5zY29wZSc6IDEgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgTWV0ZW9yLnVzZXJzLl9lbnN1cmVJbmRleCh7ICdyb2xlcy5faWQnOiAxLCAncm9sZXMuc2NvcGUnOiAxIH0pXG4gICAgICBNZXRlb3IudXNlcnMuX2Vuc3VyZUluZGV4KHsgJ3JvbGVzLnNjb3BlJzogMSB9KVxuICAgIH1cblxuICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKGFzc2lnbm1lbnRTZWxlY3RvcikuZm9yRWFjaChyID0+IHtcbiAgICAgIGNvbnN0IHJvbGVzID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoeyBfaWQ6IHIudXNlci5faWQgfSkucm9sZXMgfHwgW11cblxuICAgICAgY29uc3QgY3VycmVudFJvbGUgPSByb2xlcy5maW5kKG9sZFJvbGUgPT4gb2xkUm9sZS5faWQgPT09IHIucm9sZS5faWQgJiYgb2xkUm9sZS5zY29wZSA9PT0gci5zY29wZSlcbiAgICAgIGlmIChjdXJyZW50Um9sZSkge1xuICAgICAgICBjdXJyZW50Um9sZS5hc3NpZ25lZCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJvbGVzLnB1c2goe1xuICAgICAgICAgIF9pZDogci5yb2xlLl9pZCxcbiAgICAgICAgICBzY29wZTogci5zY29wZSxcbiAgICAgICAgICBhc3NpZ25lZDogdHJ1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIHIuaW5oZXJpdGVkUm9sZXMuZm9yRWFjaChpbmhlcml0ZWRSb2xlID0+IHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50SW5oZXJpdGVkUm9sZSA9IHJvbGVzLmZpbmQob2xkUm9sZSA9PiBvbGRSb2xlLl9pZCA9PT0gaW5oZXJpdGVkUm9sZS5faWQgJiYgb2xkUm9sZS5zY29wZSA9PT0gci5zY29wZSlcblxuICAgICAgICAgIGlmICghY3VycmVudEluaGVyaXRlZFJvbGUpIHtcbiAgICAgICAgICAgIHJvbGVzLnB1c2goe1xuICAgICAgICAgICAgICBfaWQ6IGluaGVyaXRlZFJvbGUuX2lkLFxuICAgICAgICAgICAgICBzY29wZTogci5zY29wZSxcbiAgICAgICAgICAgICAgYXNzaWduZWQ6IGZhbHNlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7IF9pZDogci51c2VyLl9pZCB9LCB7ICRzZXQ6IHsgcm9sZXMgfSB9KVxuICAgICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnJlbW92ZSh7IF9pZDogci5faWQgfSlcbiAgICB9KVxuICB9XG59KVxuIl19
