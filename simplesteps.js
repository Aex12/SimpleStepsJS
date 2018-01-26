class SimpleStepsJS {
	constructor (config) {
		this.steps = [];
		this.actions = [];
		this.current_step = 0;
		this.loadConfig(config);
		return this;
	}

	loadConfig (config={}) {
		if(!(config && config.constructor === Object)) config = {};
		if(config.container_div)
			this.container_div = config.container_div;
		else
			throw new Error("You need to specify a container_div in the config object when initiating SimpleStepsJS");
		this.show_index = !!config.show_index;
	}

	addStep (step) {
		if(!(step && step.constructor === Object)) 
			throw new Error('Step should be an Object');

		this.steps.push(step);
		return this;
	}

	addAction (id, callback) {
		this.actions.push({id, callback});
		return this;
	}

	start () {
		this.current_step = 0;
		var step = this.steps[this.current_step];
		return this.doStep(step);
	}

	doStep (step) {
		this.container_div.innerHTML = "";
		if(this.show_index) {
			var index = this._createIndex(this.current_step+1);
			this.container_div.appendChild(index);
		}

		if(step.title){
			var title = this._createTitle(step.title);
			this.container_div.appendChild(title);
		}

		if(step.description){
			var description = this._createDescription(step.description);
			this.container_div.appendChild(description);
		}

		if(step.buttons && step.buttons.constructor === Array){
			step.buttons.forEach(button => {
				var actionButton = this._createActionButton(button);
				this.container_div.appendChild(actionButton);
			});
		}

		return this;
	}

	nextStep () {
		this.current_step++;
		var step = this.steps[this.current_step];
		if(step){
			this.doStep(step);
		} else {
			this.current_step--;
			throw new Error("Cant continue, there is no more steps.");
		}

		return this;
	}

	doStepById (id) {
		var step_index = this.steps.findIndex(step => step.id === id);
		if(step_index !== -1){
			this.current_step = step_index;
			this.doStep(this.steps[step_index]);
		} else {
			throw new Error("Cant find any step with id "+id);
		}
	}

	_buttonListener (click) {
		var action = click.target.getAttribute('simplestepsjs-action');
		var value = click.target.getAttribute('simplestepsjs-value');
		if(action)
			return this._proccessAction(action, value);
		else
			throw new Error('buttonListener didn\'t receive any action');
	}

	_proccessAction (action, value) {
		if(action === 'next')
			return this.nextStep();
		else if (action === 'goto' && value)
			return this.doStepById(value);
		else {
			var customAction = this.actions.find(customAction => customAction.id === action);
			if(customAction)
				customAction.callback.call(this, value, this.nextStep.bind(this), this.doStepById.bind(this));
			else
				throw new Error("There is no such action. Define it using addAction");
			return this;
		}
	}

	_createIndex (text) {
		var index = document.createElement('span');
		index.appendChild(document.createTextNode(text));
		index.setAttribute('class', 'ssjs-index');
		return index;
	}

	_createTitle (text) {
		var title = document.createElement('h3');
		title.appendChild(document.createTextNode(text));
		title.setAttribute('class', 'ssjs-title');
		return title;
	}

	_createDescription (text) {
		var description = document.createElement('p');
		description.appendChild(document.createTextNode(text));
		description.setAttribute('class', 'ssjs-description');
		return description;
	}

	_createActionButton (button) {
		var actionButton = document.createElement('button');
		actionButton.appendChild(document.createTextNode(button.text));
		actionButton.setAttribute('class', 'ssjs-button');
		actionButton.setAttribute('simplestepsjs-action', button.action);
		actionButton.setAttribute('simplestepsjs-value', button.value);
		actionButton.addEventListener('click', event => this._buttonListener.call(this, event));
		return actionButton;
	}
}
