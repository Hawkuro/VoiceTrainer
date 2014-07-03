var ModeHandler = {
	modes: { //Constant
		debug: Debug,
		pianoRoll: PianoRoll
	},

	activeModes: [Debug, PianoRoll],

	init: function(mic, osc, gain, proc, analy){
		var that = this;
		for(var modeName in this.modes){
			that.modes[modeName].firstInit(mic, osc, gain, proc, analy);
		}
		this._activate(this.activeModes, false);
	},

	isActive: function(mode){
		if(!(mode instanceof Mode)){
			mode = this.modes[mode];
		}
		return this.activeModes.indexOf(mode) >= 0;
	},

	_activate: function(modes, push){
		modes.forEach(this._getActFunc(push));
	},

	// The following three function take either a Mode, a modeName, an Array of Modes, or
	// an Array of modeNames (Always use modeNames when calling externally)
	activate:function(modes){
		if(!(modes instanceof Array)){
			modes = [modes];
		}

		this._activate(modes, true);
	},

	deactivate: function(modes){
		if(!(modes instanceof Array)){
			modes = [modes];
		}

		modes.forEach(this._getDeactFunc())
	},

	toggle: function(modes){
		if(!(modes instanceof Array)){
			modes = [modes];
		}
		var that = this;

		modes.forEach(function(item, index, array){
			if(!(item instanceof Mode)){
				item = that.modes[item];
			}
			(item.active ? that._getDeactFunc(): that._getActFunc(true))(item,index,array);
		})
	},

	_getActFunc: function(push){
		var that = this;
		return (function(item, index, array){
			//that._activate(item);
			if(!(item instanceof Mode)){
				item = that.modes[item];
			}
			if(push){
				that.activeModes.push(item);
			}
			item.activate();
		});
	},

	_getDeactFunc: function(){
		var that = this;
		return (function(item, index, array){
			if(!(item instanceof Mode)){
				item = that.modes[item];
			}

			that._remove(that.activeModes.indexOf(item));
			item.deactivate();
		});
	},

	_remove: function(index){
		if(index < 0){return;}
		this.activeModes.splice(index,1);
	},

	clear: function(){
		this.deactivate(activeModes);
	},

	resizeCanvases: function(){
		this.activeModes.forEach(function(item, index, array){
			item.resizeCanvases();
		});
	},

	render: function(){
		this.activeModes.forEach(function(item, index, array){
			item.render();
		});
	},

	update: function(){
		this.activeModes.forEach(function(item, index, array){
			item.update();
		});
	}
};