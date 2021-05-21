export default function useSwaggerUIAuthStoragePlugin(): any {
  /* eslint-disable */
    // prettier-ignore
    const afterLoad = function(ui) {
      // NOTE: Code inside this afterLoad function will run in the browser!
      //
      // **Therefore, you cannot use an closure variables in here!**
      // Also you should follow ES5 coding style.
      //
      // See: https://github.com/scottie1984/swagger-ui-express/blob/master/index.js#L239
      //
      // Other Notes:
      // See https://github.com/scottie1984/swagger-ui-express/issues/44
      // See https://github.com/swagger-api/swagger-ui/blob/master/src/core/system.js#L344
      // See https://github.com/swagger-api/swagger-ui/issues/2915#issuecomment-297405865
  
      var AUTH_SCHEME = "bearer";
      // var swaggerOptions = this;
      var currentAuthToken = undefined;
  
      setTimeout(function() {
        // Restore auth token from localStorage, if any.
        var token = localStorage.getItem(AUTH_SCHEME);
        if (token) {
          setAuthToken(token);
          console.log("Restored " + AUTH_SCHEME + " token from localStorage.");
        }
        // Start polling ui.getState() to see if the user changed tokens.
        setTimeout(checkForNewLogin, 3000);
      }, 1000);
  
      function checkForNewLogin() {
        var stateToken = getAuthTokenFromState();
        if (stateToken !== currentAuthToken) {
          console.log("Saved " + AUTH_SCHEME + " token to localStorage.");
          if (stateToken) {
            localStorage.setItem(AUTH_SCHEME, stateToken);
          } else {
            localStorage.removeItem(AUTH_SCHEME);
          }
          currentAuthToken = stateToken;
        }
        // Continue checking every second...
        setTimeout(checkForNewLogin, 1000);
      }
  
      function getAuthTokenFromState() {
        var state = ui.getState();
        // Get token from state "auth.authorized[AUTH_SCHEME].value"
        return getUIStateEntry(
          getUIStateEntry(
            getUIStateEntry(getUIStateEntry(state, "auth"), "authorized"),
            AUTH_SCHEME
          ),
          "value"
        );
      }
  
      function getUIStateEntry(state, name) {
        if (state && state._root && Array.isArray(state._root.entries)) {
          var entry = state._root.entries.find(e => e && e[0] === name);
          return entry ? entry[1] : undefined;
        }
        return undefined;
      }
  
      function setAuthToken(token) {
        var authorization = {};
        authorization[AUTH_SCHEME] = {
          name: AUTH_SCHEME,
          schema: {
            type: "http",
            in: "header",
            name: "",
            description: "",
          },
          value: token,
        };
        var result = ui.authActions.authorize(authorization);
        currentAuthToken = token;
        return result;
      }
    };
    /* eslint-enable */
  return {
    afterLoad,
  };
}
