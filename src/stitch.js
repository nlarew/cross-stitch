import React from "react";
import {
  Stitch,
  AnonymousCredential,
  UserPasswordCredential,
} from "mongodb-stitch-browser-sdk";
import { config } from "dotenv";
config();
// Get our Stitch application ID (the APP_ID value in our .env file)
const APP_ID = process.env["APP_ID"];
// Stitch App Client Setup
const app = Stitch.hasAppClient(APP_ID)
  ? Stitch.getAppClient(APP_ID)
  : Stitch.initializeAppClient(APP_ID);
export default app;

export async function asAnonUser() {
  return await app.auth.loginWithCredential(new AnonymousCredential());
}

export function login(email = "", password = "") {
  // Log in a user with the specified email and password
  // Note: The user must already be registered with the Stitch app.
  // See https://docs.mongodb.com/stitch/authentication/userpass/#create-a-new-user-account
  return app.auth
    .loginWithCredential(new UserPasswordCredential(email, password))
    .then(stitchUser => {
      console.log(`logged in as: ${email}`);
      return stitchUser;
    });
}

export function getAllUsers() {
  // Return a list of all users that are associated with the app
  return app.auth.listUsers();
}

export function removeUserFromApp(stitchUser) {
  // Remove a user from the app (and log them out automatically, if necessary)
  return app.auth.removeUserWithId(stitchUser.id);
}

export function switchToUser(stitchUser) {
  // Set another logged-in user as the active user
  return app.auth.switchToUserWithId(stitchUser.id);
}

export function logoutUser(stitchUser) {
  // Log a user out of the app. Logged out users are still associated with
  // the app and will appear in the result of app.auth.listUsers()
  return app.auth.logoutUserWithId(stitchUser.id);
}

export function isActiveUser(stitchUser) {
  // Return true if the specified user is logged in and currently active
  return app.auth.currentUser && app.auth.currentUser.id === stitchUser.id;
}

/*
 * useStitchAuth
 *
 *
 *
 *
 *
 */

function useStitchAuth() {
  // We'll set up the demo by logging in some accounts automatically. The last user to
  // login should appear as the "active" user in the table.
  async function setup() {
    // Joe Schmoe will be logged in but not active
    await login("joe.schmoe@company.com", "SuperSecretPassword123");
    // Joshua Huffington has previously logged on but is currently logged off
    const joshua = await login(
      "joshua.huffington@company.com",
      "SuperSecretPassword123",
    );
    await app.auth.logoutUserWithId(joshua.id);
    // Jane Schmoe will be logged in as the initial active user
    await login("jane.schmoe@company.com", "SuperSecretPassword123");
  }
  // We call the setup function in an Effect hook. To prevent the hook from calling setup()
  // on every render, we pass an empty dependency array so that the Effect hook only runs once.
  // https://reactjs.org/docs/hooks-overview.html#effect-hook
  React.useEffect(() => {
    setup();
  }, []);

  // We'll store the list of users in state
  const [users, setUsers] = React.useState([]);
  // We'll get a current list of users and update our state with a function
  const updateUsers = () => {
    const appUsers = getAllUsers();
    setUsers(appUsers);
  };
  // Whenever some authentication event happens, we want to update our list of users in state.
  // We'll use a Stitch auth listener to call our update function whenever any type of auth event
  // is emitted. We only want to add this listener once (when the component first loads) so we pass
  // an empty dependency array.
  React.useEffect(() => {
    const listener = {
      onUserAdded: updateUsers,
      onUserLoggedIn: updateUsers,
      onActiveUserChanged: updateUsers,
      onUserLoggedOut: updateUsers,
      onUserRemoved: updateUsers,
      onUserLinked: updateUsers,
      onListenerRegistered: updateUsers,
    };
    app.auth.addAuthListener(listener);
    // React hooks canreturn a "cleanup" function that ties up any loose ends before
    // a component is unmounted. In this case, we want to remove the auth listener
    // we created to prevent a memory leak.
    return () => app.auth.removeAuthListener(listener);
  }, []);

  return users;
}
