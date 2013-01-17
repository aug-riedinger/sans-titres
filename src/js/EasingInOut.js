////////////////////////////////////////////////////////////
// ==== In Out Easing - notime version ====
// @author Gerard Ferrandez / http://www.dhteumeuleu.com/
// last update: Jan 12, 2012
// Licensed under CC-BY - do not remove this notice
////////////////////////////////////////////////////////////
var ge1doot = ge1doot || {};

ge1doot.tweens = {
	first: false,
	prev: false,
	iterate: function() {
		var obj = this.first;
		do {
			obj.ease();
			obj = obj.next;
		} while (obj);
	}
};

ge1doot.tweens.Add = function(steps, initValue, initValueTarget, isAngle, minValue, maxValue) {
	this.target = initValueTarget || 0;
	this.value = initValue || 0;
	this.steps = steps;
	this.isAngle = isAngle || false;
	this.speedMod = 1;
	this.minValue = minValue;
	this.maxValue = maxValue;
	// ---- used for normalizing angles ----
	if(isAngle) {
		this.normalizePI = function() {
			if(Math.abs(this.target - this.value) > Math.PI) {
				if(this.target < this.value) this.value -= 2 * Math.PI;
				else this.value += 2 * Math.PI;
			}
		};
	}
	// ---- init target ----
	this.setTarget(this.target, 1, false);
	// ---- add tween in queue ----
	if(!ge1doot.tweens.first) {
		ge1doot.tweens.first = this;
	} else {
		ge1doot.tweens.prev.next = this;
	}
	ge1doot.tweens.prev = this;
};

// ---- set target ----
ge1doot.tweens.Add.prototype.setTarget = function(target, strict) {
	this.speedMod = 1;
	strict = (strict !== undefined ? strict : true);
	this.target = target;
	// ---- normalize PI ----
	if(this.isAngle) {
		this.target = this.target % (2 * Math.PI);
		this.normalizePI();
	}
	this.locked = false;
	if(strict) {
		if(this.minValue && target < this.minValue) {
			this.target = this.minValue;
		}
		if(this.maxValue && target > this.maxValue) {
			this.target = this.maxValue;
		}
	} else {
		if((this.minValue && target < this.minValue) || (this.maxValue && target > this.maxValue)) {
			this.locked = true;
		}
	}
	// ---- set target ----
	if(this.running && this.oldTarget === target) {
		return;
	}
	this.oldTarget = target;
	this.running = true;
	this.prog = 0;
	this.from = this.value;
	this.dist = -(this.target - this.from) * 0.5;
};
// ---- easing ----
ge1doot.tweens.Add.prototype.ease = function() {
	if(!this.running) {
		return;
	}
	var s = this.speedMod * this.steps;
	if(this.prog++ < s) {
		// ---- inOut easing ----
		this.value = this.dist * (Math.cos(Math.PI * (this.prog / s)) - 1) + this.from;
		// ---- normalize PI ----
		if(this.isAngle) this.normalizePI();
	} else {
		// ---- stop ----
		this.running = false;
		this.value = this.target;
	}
};

ge1doot.tweens.Add.prototype.setValue = function(value) {

	if(this.isAngle) {
		this.normalizePI();
	}
	this.running = false;
	if(!this.locked) {
		if(this.minValue && value < this.minValue) {
			return this.target = this.value = this.minValue;
		}
		if(this.maxValue && value > this.maxValue) {
			return this.target = this.value = this.maxValue;
		}
		return this.target = this.value = value;
	}
};