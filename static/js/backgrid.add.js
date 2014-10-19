Backgrid.Cell.prototype.render = function () {
	this.$el.empty();
	var model = this.model;
	this.$el.text(this.formatter.fromRaw(model.get(this.column.get("name")), model));
	this.delegateEvents();
	//Attach model name on 'td' element, easy to find brothers in same column. 
	if(this.column && this.column.attributes){
		this.$el.attr('field-name',this.column.attributes.name);
		this.$el.addClass(this.column.attributes.name);
	}
	return this;
}