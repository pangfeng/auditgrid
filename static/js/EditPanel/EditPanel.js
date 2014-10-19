window.app.EditPanel = Backbone.View.extend({
	
	content: null,
	
	toolbar: null,
	
	initialize: function(opt){
		_.extend(this, opt);
		this.buildElements();
	},
	
	buildElements: function(){
		this.topbar = $('<div class="edit-panel-topbar"></div>');
		this.content = $('<div></div>').css({
			'padding':'20px'
		});
		this.toolbar = $('<div style="position:relative"></div>').append(
			$('<button class="btn btn-primary btn-sm">确定</button>').css({
				'position':'absolute', 'right':'20px'
			}).on('click',this.submitHandle.bind(this))
		);
		return this;
	},
	
	show:function(){},
	hide:function(){},
	
	setTitle: function(text){
		this.topbar.text(text);
	},
	
	buildContent: function(){},
	
	submitHandle: function(){
		console.log('submit');
	},
	
	cancelHandle: function(){
		console.log('cancel');
	},
	
	render: function(){
		this.show();
		this.buildElements().buildContent();
		$(this.el).empty().append(this.topbar, this.content, this.toolbar);
		return this;
	}
});