$(() => {
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        //home page for anonymous
        this.get('index.html', guestHome);
        this.get('#/login', guestHome);

        //home page for authenticated users
        this.get('#/homepage', authHome);

        //register
        this.get('#/register', (ctx) => {
            ctx.isGuest = true;
            ctx.loadPartials({
                footer: './templates/common/footer.hbs',
                nav: './templates/common/nav.hbs',
                registerForm: './templates/account/register/registerForm.hbs',
            }).then(function () {
                this.partial('./templates/account/register/registerPage.hbs');
            })
        });
        this.post('#/register', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.pass;
            let confirmPass = ctx.params.checkPass;
            if (username.length < 5) {
                notify.showError('Username must be atleast 5 characters');
                return;
            }
            if (!password) {
                notify.showError('Password is required!');
                return;
            }
            if (password !== confirmPass) {
                notify.showError('Passwords must match!');
                return;
            }

            auth.register(username, password)
                .then(userData => {

                    auth.saveSession(userData);
                    notify.showInfo('User registration successful.');
                    ctx.redirect('#/homepage')
                }).catch(notify.handleError);
        });

        //login
        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.pass;
            if (!username || !password) {
                notify.showError('All fields are required!')
                return;
            }
            auth.login(username, password)
                .then(userData => {
                    auth.saveSession(userData);
                    notify.showInfo('Login successful.');
                    ctx.redirect('#/homepage')
                })
                .catch(notify.handleError);
        });

        //logout
        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(res => {
                    sessionStorage.clear();
                    notify.showInfo('Logout successful.');
                    ctx.redirect('#/login')
                }).catch(notify.handleError);
        });

        //flights

        //homepage
        function guestHome(ctx) {
            ctx.isGuest = true;
            ctx.loadPartials({
                footer: './templates/common/footer.hbs',
                nav: './templates/common/nav.hbs',
                loginForm: './templates/account/login/loginForm.hbs',
            }).then(function () {
                this.partial('./templates/account/login/loginPage.hbs');
            })
        }

        //add flight
        this.get('#/addFlight', (ctx) => {
            ctx.isAuth = true;
            ctx.username = GetUsername();
            ctx.loadPartials({
                footer: './templates/common/footer.hbs',
                nav: './templates/common/nav.hbs',
                addFlightForm: './templates/flights/add/addFlightForm.hbs',
            }).then(function () {
                this.partial('./templates/flights/add/addFlightPage.hbs');
            })
        });
        this.post('#/addFlight', (ctx) => {
            let destination = ctx.params.destination;
            let origin = ctx.params.origin;
            let departureDate = ctx.params.departureDate;
            let departureTime = ctx.params.departureTime;
            let seats = Number(ctx.params.seats);
            let cost = Number(ctx.params.cost);
            let image = ctx.params.img;
            let isPublished = ctx.params.public;


            if (destination.length === 0) {
                notify.showError('Destination field is required!');
                return;
            } else if (origin.length === 0) {
                notify.showError('Origin field is required!');
                return;
            } else if (departureDate.length === 0) {
                notify.showError('Departure Date field is required!');
                return;
            } else if (departureTime.length === 0) {
                notify.showError('Departure time field is required!');
                return;
            } else if (seats <= 0 || Number.isNaN(seats)) {
                notify.showError('Seats field must be valid positive number');
                return;
            } else if (cost <= 0 || Number.isNaN(cost)) {
                notify.showError('Cost field must be valid positive number');
                return;
            } else if (image.length === 0) {
                notify.showError('Image field is required!');
                return;
            }
            if (isPublished === 'on') {
                isPublished = true;
            } else {
                isPublished = false;
            }

            flights.Add(destination, origin, departureDate, departureTime, seats, cost, image, isPublished)
                .then(res => {
                    notify.showInfo('Created flight.');
                    ctx.redirect('#/homepage')
                }).catch(notify.handleError)
        });

        //details
        this.get('#/details/:id', (ctx) => {
            let flightId = ctx.params.id;

            flights.GetSingleById(flightId)
                .then(flight => {
                    let creatorId = flight._acl.creator;
                    let userId = GetUserId();
                    ctx.isAuth = true;
                    ctx.username = GetUsername();
                    ctx.flight = flight;
                    ctx.isCreator = isCreator(userId, creatorId);
                    ctx.loadPartials({
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                    }).then(function () {
                        this.partial('./templates/flights/detailsPage.hbs');
                    })

                }).catch(notify.handleError);
        });

        //edit
        this.get('#/edit/:id', (ctx) => {
            let flightId = ctx.params.id;
            flights.GetSingleById(flightId)
                .then(flight => {
                    let userId = GetUserId();
                    let creatorId = flight._acl.creator;

                    if (!isCreator(userId, creatorId)) {
                        notify.showError('You are not allowed to edit this flight!');
                        return;
                    }
                    ;

                    ctx.flight = flight;
                    ctx.isAuth = true;
                    ctx.username = GetUsername();
                    ctx.loadPartials({
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                        editForm: './templates/flights/edit/editForm.hbs'
                    }).then(function () {
                        this.partial('./templates/flights/edit/editPage.hbs');
                    })
                })


        });
        this.post('#/edit/:id', (ctx) => {
            let flightId = ctx.params.id;

            let destination = ctx.params.destination;
            let origin = ctx.params.origin;
            let departureDate = ctx.params.departureDate;
            let departureTime = ctx.params.departureTime;
            let seats = Number(ctx.params.seats);
            let cost = Number(ctx.params.cost);
            let image = ctx.params.img;
            let isPublished = ctx.params.public;


            if (destination.length === 0) {
                notify.showError('Destination field is required!');
                return;
            } else if (origin.length === 0) {
                notify.showError('Origin field is required!');
                return;
            } else if (departureDate.length === 0) {
                notify.showError('Departure Date field is required!');
                return;
            } else if (departureTime.length === 0) {
                notify.showError('Departure time field is required!');
                return;
            } else if (seats <= 0 || Number.isNaN(seats)) {
                notify.showError('Seats field must be valid positive number');
                return;
            } else if (cost <= 0 || Number.isNaN(cost)) {
                notify.showError('Cost field must be valid positive number');
                return;
            } else if (image.length === 0) {
                notify.showError('Image field is required!');
                return;
            }
            if (isPublished === 'on') {
                isPublished = true;
            } else {
                isPublished = false;
            }

            flights.Edit(destination, origin, departureDate, departureTime, seats, cost, image, isPublished, flightId)
                .then(res => {
                    notify.showInfo('Successfully edited flight.');
                    ctx.redirect(`#/details/${flightId}`);
                })
                .catch();
        });

        //my flights
        this.get('#/flights', (ctx) => {
            let userId = GetUserId();
            flights.GetMyFlights(userId)
                .then(f => {
                    ctx.flights = f;
                    ctx.isAuth = true;
                    ctx.username = GetUsername();

                    ctx.loadPartials({
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                    }).then(function () {
                        this.partial('./templates/flights/myFlights.hbs');
                    })

                });
        });

        //delete
        this.get('#/delete/:id', (ctx) => {
            let flightId = ctx.params.id;
            flights.RemoveFlight(flightId)
                .then(res => {
                    notify.showInfo('Flight deleted.');
                    ctx.redirect('#/flights');
                }).catch(notify.handleError);
        });

        function authHome(ctx) {
            flights.GetPublishedFlights()
                .then(f => {
                    ctx.isAuth = true;
                    ctx.username = GetUsername();
                    ctx.flights = f;
                    ctx.loadPartials({
                        footer: './templates/common/footer.hbs',
                        nav: './templates/common/nav.hbs',
                    }).then(function () {
                        this.partial('./templates/home/homepage.hbs');
                    })
                }).catch(notify.handleError);
        }


        //helper functions
        function GetUsername() {
            return sessionStorage.getItem('username');
        }

        function GetUserId() {
            return sessionStorage.getItem('userId');
        }

        function isCreator(userId, creatorId) {
            return userId === creatorId;
        }
    });
    app.run();
});
