window.app.WeightEditPanel = app.EditPanel.extend({
	
	htmlTemplate: '',
	
	type: 'none',
	
	gridPanel: null,
	
	buildContent: function(){
		var content = this.content, self = this;
		content.html(this.htmlTemplate);
		content.find("input[name='measure-radio']").on('click', function(){
			content.find('.selected-value-panel').hide();
			content.find('.selected-value-panel#'+this.value+'-values').show();
			self.type=this.value;
		});		
		this.setTitle('设置"权重"列属性');
	},
	toJson: function(){
		var content = this.content;
		return ({
			'none': function(){
				return {type:'none', description:'不区分'}
			},
			'qualitative': function(){
				return {
					type:'qualitative',
					description: '定性的',
					values: _.map(content.find('#qualitative-values input'), function(obj){
						return obj.value;
					})
				}
			},
			'quantitative': function(){
				var valuePanel = content.find('#quantitative-values');
				return {
					type:'quantitative',
					description: '定量的',
					max: Number(valuePanel.find('#max').val()),
					min: Number(valuePanel.find('#min').val()),
					stepSize: Number(valuePanel.find('#step-size').val())
				}
			}
			
		})[this.type]();
	},
	
	submitHandle: function(){
		var opt = this.toJson(), gridPanel = this.gridPanel;
		if(opt.type === 'none'){
			app.columnsManager.setColumnAsString(gridPanel.type,'weight');
			_.each(gridPanel.collection.models,function(item){
				if(item.has('weight')){
					item.set('weight','不区分');
				}
			});	
			gridPanel.data.columns['weight']={
				cellType: 'string',
				metadata: ''
			};
		}else if(opt.type === 'qualitative'){
			var metadata = [];
			_.each(opt.values, function(item){
				metadata.push([item,item]);
			});
			app.columnsManager.setColumnAsSelect(gridPanel.type,'weight', metadata);
			gridPanel.data.columns['weight']={
				cellType: 'select-cell',
				metadata: metadata
			};
			_.each(gridPanel.collection.models,function(item){
				if(item.has('weight')){
					item.set('weight',metadata[0][0]);
				}
			});	
		}else if(opt.type === 'quantitative'){
			var max = Number(opt.max), 
				min = Number(opt.min), 
				stepSize = Number(opt.stepSize),
				metadata = [[min,min]],
				lastValue = min;
			
			while(lastValue<max){
				lastValue += stepSize;
				metadata.push([lastValue, lastValue]);
			}
			metadata[metadata.length-1] = [max,max];				
			app.columnsManager.setColumnAsSelect(gridPanel.type,'weight', metadata);
			gridPanel.data.columns['weight']={
				cellType: 'select-cell',
				metadata: metadata
			};
			_.each(gridPanel.collection.models,function(item){
				if(item.has('weight')){
					item.set('weight',metadata[0][0]);
				}
			});	
		}
		gridPanel.save();
		gridPanel.render(this.gridPanel.id);
	}
});