window.app = window.app || {}; 
window.app.CheckboxList = Backbone.View.extend({
	initialize: function(opt){
		_.extend(this, opt);
	},
	
	render: function(){
		$(this.el).html(_.map(this.data, function(obj){
			return '<label class="cleckbox-item"><input type="checkbox" name="checkboxlist" value="'+obj.name+'" checked=true/>'+obj.label+'</label>'
		}));
		return this;
	},
	
	getCheckedValues: function(){
		return _.map($(this.el).find('input:checked'), function(obj){
			return obj.value;
		});
	}

});
