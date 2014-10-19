window.app.ApplicabilityEditPanel = app.EditPanel.extend({
	
	htmlTemplate: '',
	
	type: 'all',
	
	gridPanel: null,
	
	buildContent: function(){
		var content = this.content, self = this;
		content.html(this.htmlTemplate);
		content.find("input[name='applicability-radio']").on('click', function(){
			self.type=this.value;
		});	
		this.setTitle('设置"适用性"列属性');
	},
	
	submitHandle: function(){
		var gridPanel = this.gridPanel;
		var columnOpt = app.columnsManager.getColumn(gridPanel.type,'applicability');
		if(this.type==='all'){		
			app.columnsManager.setColumnAsString(gridPanel.type,'applicability');
			_.each(gridPanel.collection.models,function(e){
				if(e.has('applicability')){
					e.set('applicability','适用');
				}
			});	
			gridPanel.data.columns.applicability={
				cellType: 'string',
				metadata: ''
			};
		}else if(this.type==='byset'){
			var metadata = [["适用", "适用"], ["不适用", "不适用"]];
			app.columnsManager.setColumnAsSelect(gridPanel.type,'applicability', metadata);
			gridPanel.data.columns['applicability']={
				cellType: 'select-cell',
				metadata: metadata
			};
		}
		gridPanel.save();
		gridPanel.render(this.gridPanel.id);
	}
});