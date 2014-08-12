window.onload = function() {
    window.scrollTo(0, 0);
    window.scroll(0, 0);

    var that = null;
    var Application = function() {
        this.name = "Test facebook connect";
        this.facebookConnect = new FacebookConnect("492601667470211");
    };

    Application.prototype.main = function() {
        that = this;
        this.facebookConnect.init();
        this.facebookConnect.getStatusLogin(function(status) {
            if (status === "connected") {
                document.getElementById("wrapper").style.display = "block";
                setTimeout(function() {
                    that.getMyData();
                    that.friends();
                    that.listeners();
                }, 200);
            }

            if (status === "not_authorized" || status === "not_logged_in") {
                document.getElementById("login").style.display = "block";
                setTimeout(function() {
                    that.show("login-button");
                }, 200);
                that.listeners();
            }

        });
    };

    Application.prototype.login = function() {
        var scope = "email,friends_online_presence";
        var redirect_uri = "http://innovacenter.co/proyectos/facebookApp/";
        this.facebookConnect.loginFacebook(scope, redirect_uri);
    };

    Application.prototype.getMyData = function() {
        var attributes = "name,id,picture";
        this.facebookConnect.getDataUser(attributes, function(response) {
            document.getElementById("user").innerHTML = "<img src=" + response.data.picture.data.url + " alt='user_image'/><span>" + response.data.name + "</span>";
            that.show("user");
        });
    };

    Application.prototype.friends = function() {
        document.getElementById("loading").style.display = "block";
        var optionsAll = {
            getFriends: "all",
            limit: 10,
            dataToGet: "name,id,picture",
            getStatusFriends: true
        };

        var optionsInstalled = {
            getFriends: "installed",
            dataToGet: "name,id,picture",
            getStatusFriends: true
        };

        that.facebookConnect.getDataFriends(optionsAll, function(resp) {
            if (!resp.data.error) {
                var tbody = document.getElementById("table-user").getElementsByTagName("tbody")[0];
                for (var i in resp.data) {
                    var row = document.createElement("tr");
                    var name = document.createElement("td");
                    var status = document.createElement("td");
                    var id = document.createElement("td");

                    name.innerHTML = "<img src=" + resp.data[i].picture.data.url + " alt='user_image' class='item' data-id='" + resp.data[i].id + "'/><span class='name'>" + resp.data[i].name + "</span>";
                    if (resp.data[i].status === "active")
                        status.innerHTML = "<div class='dot active'></div>";
                    else
                        status.innerHTML = "<div class='dot offline'></div>";

                    id.innerHTML = resp.data[i].id;

                    row.appendChild(name);
                    row.appendChild(status);
                    row.appendChild(id);
                    tbody.appendChild(row);

                    if (i == (resp.data.length - 1)) {
                        that.show("friends");
                        document.getElementById("loading").style.display = "none";

                        var items = document.getElementsByClassName("item");
                        for (var i = 0, j = items.length; i < j; i++) {
                            items[i].addEventListener("click", function() {
                                var id = this.getAttribute("data-id");
                                that.goTo(1, id);
                            });
                        }
                    }
                }
            } else {
                document.getElementById("loading").style.display = "none";
            }
        });
    };

    Application.prototype.hasClass = function(ele, cls) {
        return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    };

    Application.prototype.addClass = function(ele, cls, that) {
        if (!that.hasClass(ele, cls))
            ele.className += cls;
    };

    Application.prototype.removeClass = function(ele, cls, that) {
        if (that.hasClass(ele, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            ele.className = ele.className.replace(reg, '');
        }
    };

    Application.prototype.listeners = function() {
        var btnAdd = document.getElementById("add");
        var btnLogout = document.getElementById("logout");
        var btnLogin = document.getElementById("login-button");
        var btnBack = document.getElementById("back-button");

        btnAdd.addEventListener("click", function() {
            that.invite();
        }, false);


        btnLogout.addEventListener("click", function() {
            that.facebookConnect.logoutFacebook(function() {
                that.hide("friends");
                that.hide("user");
                setTimeout(function() {
                    document.getElementById("wrapper").style.display = "none";
                    document.getElementById("login").style.display = "block";
                    setTimeout(function() {
                        that.show("login-button");
                    }, 200);
                }, 1000);
            });
        }, false);

        if (window.addEventListener) {
            btnLogin.addEventListener("click", function() {
                that.login();
            }, false);
        }
        else if (window.attachEvent) {
            btnLogin.attachEvent("onclick", function() {
                alert("click");
                that.login();
            }, false);
        }

        btnBack.addEventListener("click", function() {
            that.goTo(0);
        }, false);
    };

    Application.prototype.goTo = function(idPage, id) {
        var obj = document.getElementById("pages");
        var property = this.getTransformProperty(obj);
        if (id) {
            var options = {
                id: id,
                attributes: "name,gender,link,username,cover,email,picture.type(large)"
            };
            that.facebookConnect.dataFriends(options, function(data) {
                console.log(data);
                if (data.data.cover) {
                    var loadImage = new Image();
                    loadImage.src = data.data.picture.data.url;
                    if (window.addEventListener) {
                        loadImage.addEventListener("load", function() {
                            document.getElementById("picture-profile").innerHTML = "<img class='img-polaroid' src='" + data.data.picture.data.url + "' alt='img-user'/>";
                            document.getElementById("data-profile").innerHTML = "<div>Name: " + data.data.name + "</div><div>Username: " + data.data.username + "</div><div class='btn-link'>" + data.data.link + "</div>";
                            changePage();
                        }, false);
                    }
                    else if (window.attachEvent) {
                        loadImage.attachEvent("onload", function() {
                            document.getElementById("picture-profile").innerHTML = "<img class='img-polaroid' src='" + data.data.picture.data.url + "' alt='img-user'/>";
                            document.getElementById("data-profile").innerHTML = "<div>Name: " + data.data.name + "</div><div>Username: " + data.data.username + "</div><div class='btn-link'>" + data.data.link + "</div>";
                            changePage();
                        }, false);
                    }

                    /*loadImage.onload = function() {
                     document.getElementById("picture-profile").innerHTML = "<img class='img-polaroid' src='" + data.data.picture.data.url + "' alt='img-user'/>";
                     document.getElementById("data-profile").innerHTML = "<div>Name: " + data.data.name + "</div><div>Username: " + data.data.username + "</div><div class='btn-link'>" + data.data.link + "</div>";
                     changePage();
                     };*/
                } else {
                    document.getElementById("picture-profile").innerHTML = "<img src='img/default.jpg'>";
                    document.getElementById("data-profile").innerHTML = "<div>Name: " + data.data.name + "</div><div>Username: " + data.data.username + "</div><div class='btn-link'>" + data.data.link + "</div>";
                    changePage();
                }
            });
        } else {
            changePage();
        }

        function changePage() {
            window.scrollTo(0, 0);
            window.scroll(0, 0);

            if (property) {
                obj.style[property] = 'translateX(-' + (idPage * (~~(100 / 2))) + '%)';
            }
        }
    };

    Application.prototype.getTransformProperty = function(obj) {
        var properties = [
            'transform',
            'WebkitTransform',
            'msTransform',
            'MozTransform',
            'OTransform'
        ];
        var p;
        while (p = properties.shift()) {
            if (typeof obj.style[p] != 'undefined') {
                return p;
            }
        }
        return false;
    }

    Application.prototype.show = function(obj) {
        that.addClass(document.getElementById(obj), " content-enable", that);
    };

    Application.prototype.hide = function(obj) {
        that.removeClass(document.getElementById(obj), "content-enable", that);
    };

    Application.prototype.invite = function() {
        var path = {
            message: "Add your friends",
            title: "App Facebook test",
            redirect_uri: "http://innovacenter.co/proyectos/facebookApp/"
        };
        that.facebookConnect.inviteFriends(path);
    };

    var app = new Application();
    app.main();
};