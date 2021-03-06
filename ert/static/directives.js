angular.module(
    'ertDirectives', ['ertServices', 'pascalprecht.translate']
)

// Directive to show the details for a beer in the product list
.directive('beerRow', ['currentOrder', function(currentOrder) {
    function link(scope, elem, attrs) {
	// Get this beer's brewery and style objects
	scope.breweries.$promise.then(function() {
	    scope.brewery = scope.breweries.filter(function(brewery) {
		return brewery.id === scope.beer.brewery;
	    })[0];
	});
	scope.beerStyles.$promise.then(function() {
	    scope.style = scope.beerStyles.filter(function(style) {
		return style.id === scope.beer.style;
	    })[0];
	});
	// Handler for checking and adding a new item to the order
	scope.addToOrder = function() {
	    currentOrder.add(scope.beer, scope.quantity);
	    scope.quantity = undefined;
	};
    }
    return {
	link: link,
	restrict: 'C'
    };
}])

.directive('navMenu', ['$location', function($location) {
    function link(scope, elem, attrs) {
	var regexps = {
	    'about': new RegExp('^/about/'),
	    'blog': new RegExp('^/blog/'),
	    'beer': new RegExp('^/beer/'),
	    'contact': new RegExp('^/contact/'),
	}
	function setActiveLink() {
	    var path;
	    path = $location.path();
	    scope.linkClasses = {};
	    // Set the current active link menu item
	    if (regexps.about.exec(path)) {
		scope.linkClasses.about = 'active';
	    } else if (regexps.blog.exec(path)) {
		scope.linkClasses.blog = 'active';
	    } else if (regexps.beer.exec(path)) {
		scope.linkClasses.beer = 'active';
	    } else if (regexps.contact.exec(path)) {
		scope.linkClasses.contact = 'active';
	    }
	}
	setActiveLink();
	scope.$on('$locationChangeStart', function() {
	    setActiveLink();
	});
    }
    return {
	link: link,
	restrict: 'C'
    };
}])

// Directive to show a detail product page for a single beer
.directive('beerDetail', ['$location', 'currentOrder', function($location, currentOrder) {
    function link(scope, elem, attrs) {
	// Get this beer's brewery and style objects
	scope.$watch('beer', function(newBeer) {
	    console.log(scope.beer);
	    if (newBeer !== undefined) {
		scope.breweries.$promise.then(function() {
		    scope.brewery = scope.breweries.filter(function(brewery) {
			return brewery.id === scope.beer.brewery;
		    })[0];
		});
		scope.beerStyles.$promise.then(function() {
		    scope.style = scope.beerStyles.filter(function(style) {
			return style.id === scope.beer.style;
		    })[0];
		});
	    }
	});
	scope.addToOrder = function() {
	    currentOrder.add(scope.beer, scope.quantity);
	    $location.path('/beer/');
	};
    }
    return {
	link: link,
	restrict: 'C'
    };
}])

.directive('beerCartModal', ['$location', function($location) {
    function link(scope, elem, attrs) {
	// Handler for the "checkout" button: redirects to the checkout page
	scope.checkout = function() {
	    $('#cartModal').modal('hide');
	    $location.path('/beer/checkout/');
	};
    }
    return {
	link: link,
	restrict: 'AC'
    };
}])

.directive('checkoutForm', ['$http', '$translate', 'toaster', 'currentOrder', function($http, $translate, toaster, currentOrder) {
    function link(scope, elem, attrs) {

	// Handler for the submit button: validates and POSTs checkout form
	scope.submitOrder = function() {
	    var data;
	    elem.addClass('dirty');
	    if (scope.form.$valid) {
		// Prepare POST data
		scope.order.preferred_language = $translate.use();
		data = {
		    order_data: scope.order,
		    order_items: scope.currentOrder
		};
		toaster.pop('info', "Sending", null, {timeOut: "0"});
		$http.post('/api/store/orders/', data)
		    .success(function() {
			toaster.pop('clear');
			toaster.pop('success', "Sent");
			scope.reset();
			currentOrder.reset();
		    })
		    .error(function() {
			toaster.pop('clear');
			toaster.pop('error', "Error");
		    });
	    }
	};
	scope.reset = function() {
	    scope.form.$setPristine();
	    elem.removeClass('dirty');
	    // Blank object to hold form data
	    scope.order = {
		f_name: "",
		l_name: "",
		phone: "",
		shipping_address: "",
		email: "",
		company_name: ""
	    };
	};
	// Disable the form if the shopping cart is empty
	scope.$watch(
	    function() {return currentOrder.length},
	    function(newOrderLength) {
		var fieldset = elem.find('fieldset');
		if (newOrderLength > 0) {
		    fieldset.removeAttr('disabled');
		} else {
		    fieldset.attr('disabled', 'disabled');
		}
	    }
	);
    }
    return {
	link: link,
	restrict: 'AC'
    };
}]);
