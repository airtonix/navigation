
function NavigationSvc () {}

NavigationSvc.prototype.initialize = function NavigationSvc_initialize($win, $http, $q) {
	this.callbacks = [];

	var deferred = $q.defer();
	this.initial = deferred.promise;

	$http({
    method: 'GET',
    url: navigator.location,
    headers: {'Accept': 'application/json; version=1'},
  }).success(function(data, status, header) {
    deferred.resolve(data);
  }).error(function(data, status, header) {
    deferred.reject();
  });
};

NavigationSvc.prototype.onArrival = function NavigationSvc_onArrival(callback) {
	this.callbacks.push(callback);
	this.initial.then(callback);
};

NavigationSvc.prototype.handleData = function NavigationSvc_handleData(data) {
	for (var i = 0, l = this.callbacks.length; i < l; i++) {
		this.callbacks[i](data);
	};
};

NavigationSvc.prototype.handleError = function NavigationSvc_handleError() {
	console.error('Error!');
};

function SinglePageNavigator($win, $http, $q) {
	this.http = $http;
	this.initialize($win, $http, $q);
}

SinglePageNavigator.prototype = new NavigationSvc();

SinglePageNavigator.prototype.goto = function SinglePageNavigator_goto(url) {
	var self = this;
	this.http({
		method: 'GET',
		url: url,
		headers: {'Accept': 'application/json; version=1'}
	}).success(function(data, status, get_header) {
		self.handleData(data);
	}).error(function(data, status, get_header) {
		self.handleError();
	});
};

function PageLoadNavigator($win, $http, $q) {
	this.win = $win;
	this.initialize($win, $http, $q);
}

PageLoadNavigator.prototype = new NavigationSvc();

PageLoadNavigator.prototype.goto = function PageLoadNavigator_goto(url) {
	this.win.location = url;
};

function PushStateNavigator($win, $http, $q) {
	this.win = $win;
	this.http = $http;

	var self = this;
	this.win.onpopstate = function(ev) {
		if (ev.state) {
			self.handleData(ev.state);
		}
	};

	this.initialize($win, $http, $q);
	this.initial.then(function(data) {
		self.win.history.replaceState(data);
	});
}

PushStateNavigator.prototype = new NavigationSvc();

PushStateNavigator.prototype.goto = function PushStateNavigator_goto(url) {
	var self = this;
	this.http({
		method: 'GET',
		url: url,
		headers: {'Accept': 'application/json; version=1'}
	}).success(function(data, status, get_header) {
		self.win.history.pushState(data, '', url);
		self.handleData(data);
	}).error(function(data, status, get_header) {
		self.handleError();
	});
};

