/*
 * Version 1.0
 * Creathors:
 *      Andrés Cataño @Andres542
 *      Felipe Janer @5h1rU
 * www.kogimobile.com
 */

/**
 * To initialize facebook connect you need to instantiate the FacebookConnect class.
 Example:<br/>
 * <code>var app = new FacebookConnect();</code><br/>
 * @static
 * @param AppId appId is a code. You can find in app config
 */
FacebookConnect = function(facebookAppId) {
    this.facebookAppId = facebookAppId;
    this.access_token = null;
};
/**
 * Load the SDK Asynchronously
 */
FacebookConnect.prototype.init = function() {
    (function(d) {
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));
};
/**
 * You need to check if user is logged or has the app installed with allowed permissions
 * Example:<br/>
 * <code>app.getStatusLogin(callback(data));</code>
 * @return {String}
 * <b>connected:</b> the user have the app installed.<br>
 * <b>not_authorized</b>: the user have not the app installed.
 * <b>not_logged_in</b>: the user is not logged into facebook
 * @param Callback function called after get status login
 */
FacebookConnect.prototype.getStatusLogin = function(callback) {
    var that = this;
    window.fbAsyncInit = function() {
        FB.init({
            appId: that.facebookAppId,
            status: true,
            cookie: true,
            xfbml: true,
            oauth: true
        }),
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                that.access_token = response.authResponse.accessToken;
                callback("connected");
            } else if (response.status === 'not_authorized') {
                callback("not_authorized");
            } else {
                callback("not_logged_in");
            }
        });
    };
};

/**
 * If user isn't logged or app isn't installed; call this method
 Example:<br/>
 * <code>app.loginFacebook(scope, redirect_uri);</code><br/><br/>
 * @static
 * @param scope String separated by "," with app permissions
 * @param redirect_uri Redirect method when user install app or is logged
 */
FacebookConnect.prototype.loginFacebook = function(scope, redirect_uri) {
    var permissions = null, redirect = null, url;
    if (!redirect_uri) {
        redirect = scope;
        url = "https://www.facebook.com/dialog/oauth?client_id=" + this.facebookAppId + "&redirect_uri=" + encodeURIComponent(redirect);
    } else {
        permissions = scope;
        redirect = redirect_uri;
        url = "https://www.facebook.com/dialog/oauth?&scope=" + permissions + "&client_id=" + this.facebookAppId + "&redirect_uri=" + encodeURIComponent(redirect);
    }

    document.location.href = url;
};

/**
 * Example:<br/>
 * <code>app.getDataUser(attributes, callback(data));</code>
 * @return {Object}
 * @param Attributes String separated by "," with the attributs that you need get. Default is id,name.
 * @param Callback function called after get data user
 */
FacebookConnect.prototype.getDataUser = function(attributes, callback) {
    var fields, back, objectContent = new Object();
    if (!callback) {
        fields = "id,name";
        back = attributes;
    } else {
        fields = attributes;
        back = callback;
    }

    FB.api('/me?fields=' + fields + '&access_token=' + this.access_token, function(response) {
        objectContent.data = response;
        back(objectContent);
    });
};

/**
 * Example:<br/>
 * <code>app.dataFriends(options, callback(data));</code>
 * @return {Object}
 * @param options Object with options to get data friends.<br/>
 * The attributes for the param options are:<br/>
 * <b>id</b>: User id<br/> 
 * <b>attributes</b>: attributes to get of friends. <br/>
 * @param Callback function called after data friends
 */
FacebookConnect.prototype.dataFriends = function(options, callback) {
    var objectContent = new Object();
    if (!callback) {
        objectContent.data = "Please specify the user id";
        options(objectContent);
    } else {
        if (options.id) {
            if (!options.attributes) {
                options.attributes = "id,name";
            }
            FB.api('/' + options.id + '?fields=' + options.attributes + '&access_token=' + this.access_token, function(response) {
                objectContent.data = response;
                callback(objectContent);
            });
        } else {
            objectContent.data = "Please specify the user id";
            callback(objectContent);
        }
    }
};

/**
 * Example:<br/>
 * <code>app.getDataFriends(options, callback(data));</code>
 * @return {Object}
 * @param options Object with options to get data friends.<br/>
 * The attributes for the param options are:<br/>
 * <b>getFriends</b>: You can give as value "all" or "installed". Default is: "all".<br/> 
 * <b>limit</b>: Define the limit of response: number or "all": Default is: "all". <br/>
 * <b>dataToGet</b>: attributes to get of friends. <br/>
 * <b>getStatusFriends</b>:  Define attributes to get of my friends. Default is: "id,name".<br/>
 * @param Callback function called after get data friends
 */
FacebookConnect.prototype.getDataFriends = function(options, callback) {
    var option, back;
    if (!callback) {
        option = new Object();
        back = options;
    } else {
        option = options;
        back = callback;
    }

    var persons = [], current = 0, urlApi = null, objectContent = new Object();
    if (!option.dataToGet) {
        if (option.getFriends === "installed")
            option.dataToGet = "id,installed,name";
        else
            option.dataToGet = "id,name";
    } else {
        if (option.getFriends === "installed") {
            if (!/installed/.test(option.dataToGet)) {
                option.dataToGet = option.dataToGet + ",installed";
            }
        }
    }

    if (!option.limit || option.limit === "all") {
        urlApi = '/me/friends?fields=' + option.dataToGet + '&access_token=' + this.access_token;
    } else {
        urlApi = '/me/friends?limit=' + option.limit + '&fields=' + option.dataToGet + '&access_token=' + this.access_token;
    }
    FB.api(urlApi, function(response) {
        if (!option.getFriends || option.getFriends === "all") {
            if (option.getStatusFriends) {
                for (var i in response.data) {
                    var person = response.data[i];
                    persons.push(person);

                    if (i == (response.data.length - 1))
                        getStatusFriend();
                }
            } else {
                back(response);
            }
        } else {
            for (var i in response.data) {
                var person = response.data[i];
                if (person.hasOwnProperty('installed')) {
                    persons.push(person);
                }
                if (i == (response.data.length - 1)) {
                    if (option.getStatusFriends) {
                        getStatusFriend();
                    } else {
                        objectContent.data = persons;
                        back(objectContent);
                    }
                }
            }
        }
    });

    function getStatusFriend() {
        function pushData() {
            var q = 'fql?q=' + escape('SELECT online_presence FROM user WHERE uid=' + persons[current].id + '');
            FB.api(q, function(response) {
                persons[current].status = response.data[0].online_presence;
                if (current < (persons.length - 1)) {
                    current++;
                    pushData();
                } else {
                    objectContent.data = persons;
                    back(objectContent);
                }
            });
        }
        if (persons.length > 0) {
            pushData();
        } else {
            var resp = {
                error: "Not found friends"
            };
            if (option.getFriends === "all") {
                objectContent.data = resp;
                back(objectContent);
            } else {
                objectContent.data = resp;
                back(objectContent);
            }
        }
    }
};

/**
 Example:<br/>
 * <code>app.comment(scope, redirect_uri);</code><br/><br/>
 * Redirect to facebook for comment.
 * @static
 * @param path Is a object with attributs required.<br/>
 * The attributes for the param path are:<br/>
 * <b>link</b>: link to post in the timeline<br/>
 * <b>picture</b>: add image, default is picture of app<br/>
 * <b>name</b>: name of app<br/>
 * <b>caption</b>: small caption<br/>
 * <b>description</b>: need a description<br/>
 * <b>redirect_uri</b>: redirect after comment<br/><br/>
 * Example:<br/>
 * <code>link: "http://www.kogimobile.com/",<br/>
 picture: "http://fbrell.com/f8.jpg",<br/>
 name: "Chumager",<br/>
 caption: "Game",<br/>
 description: "I have new ranking",<br/>
 redirect_uri: "http://www.kogimobile.com/html5/facebook"<br/>
 </code>
 * @param redirect_uri Is the redirect when the user accept the app or is logged<br/>
 */
FacebookConnect.prototype.comment = function(path) {
    document.location.href = "https://www.facebook.com/dialog/feed?%20app_id=" + this.facebookAppId + "&%20link=" + encodeURIComponent(path.link) + "&%20picture=" + encodeURIComponent(path.picture) + "&%20name=" + encodeURIComponent(path.name) + "&%20caption=" + encodeURIComponent(path.caption) + "&%20description=" + encodeURIComponent(path.description) + "&%20redirect_uri=" + encodeURIComponent(path.redirect_uri);
};

/**
 Example:<br/>
 * <code>app.inviteFriends(path);</code><br/><br/>
 * Redirect to facebook for invite friends.
 * @static
 * @param path Is a object with attributs required.<br/>
 * The attributes for the param path are:<br/>
 * <b>message</b>: Long message<br/>
 * <b>title</b>: add title<br/>
 * <b>redirect_uri</b>: redirect after invited friends<br/><br/>
 * Example:<br/>
 * <code>message: "Add your friends",<br/>
 title: "App Facebook test",<br/>
 redirect_uri: "http://www.kogimobile.com/html5/facebook"<br/>
 </code>
 * @param redirect_uri Is the redirect when the user accept the app or is logged<br/>
 */
FacebookConnect.prototype.inviteFriends = function(path) {
    document.location.href = "http://www.facebook.com/dialog/apprequests?app_id=" + this.facebookAppId + "&message=" + encodeURIComponent(path.message) + "&title=" + encodeURIComponent(path.title) + "&redirect_uri=" + encodeURIComponent(path.redirect_uri);
};

/**
 * Example:<br/>
 * <code>app.logoutFacebook(callback(data));</code>
 * @return {Object}
 * @param Callback function called after logout
 */
FacebookConnect.prototype.logoutFacebook = function(callback) {
    FB.logout(function(response) {
        callback(response);
    });
};

