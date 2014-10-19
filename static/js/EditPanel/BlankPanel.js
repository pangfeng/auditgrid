window.app.BlankPanel = app.EditPanel.extend({
	render: function(){
		$(this.el).empty();
		this.hide();
		return this;
	}
});