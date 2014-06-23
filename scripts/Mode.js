function Mode(props){
	this.init = props.init || emptyFunc;
	this.exit = props.exit || emptyFunc;
	this.firstInit = props.firstInit || emptyFunc;
	this.render = props.render || emptyFunc;
	this.update = props.update || emptyFunc;
	this.element = props.element;
	this.resizeCanvases = props.resizeCanvases || emptyFunc;
	this.active = false;
}

Mode.prototype.activate = function(){
	this.active = true;
	this.init();
	getSelector(this).show();
	this.resizeCanvases();
}

Mode.prototype.deactivate = function(){
	this.active = false;
	this.exit();
	getSelector(this).hide();
}