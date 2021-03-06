

if (session.user.isLoggedIn) {
	<div> "Welcome ", session.user.name </div>
} else {
	<div> "You are not logged in" </div>
}


=========>>>




(function(domHook, session){ // session is an argument because it was seen as a root level variable in the execution block
	var lastEvaluation, user, userView
	
	function ifTrue() {
		userView = fin.getView("<div>Welcome (( name ))</div>", user)
	}
	
	function ifFalse() {
		if (userView) { 
			userView.destroy()
			delete userView
		}
		domHook.innerHTML = "You are not logged in"
	}
	
	function evaluate() {
		var evaluation = user.getProperty('isLoggedIn');
		if (typeof lastEvaluation == 'undefined' || evaluation != lastEvaluation) {
			evaluation ? ifTrue() : ifFalse()
		}
	}
	
	function updateUser(newUser) {
		user.removeDependency(evaluate)
		user = session.getProp('user')
		user.addDependency('isLoggedIn', evaluate)
	}
	
	session.addDependency('user', updateUser)
	
})(document.appendChild(document.createElement('div')), session);