window.app.TextEditPanel = app.EditPanel.extend({
	
	textArea: null,
	
	model: null,
	
	attr: '',

	buildContent: function(){
		this.textArea = $('<textarea></textarea>').css({
			"width":'100%', 'height':'160px'
		});
		if(this.model && this.attr){
			this.setText(this.model.get(this.attr));
			this.setTitle(this.model.get('title'));
		}else{
			this.setTitle(this.titleText || '');
		}
		this.content.append(this.textArea);
	},
	
	setText: function(text){
		this.textArea.val(text || '');
	},
	
	getText: function(){
		return this.textArea.val();
	},
	
	submitHandle: function(){
		this.model && this.attr && this.model.set(this.attr,this.getText());
	}
});