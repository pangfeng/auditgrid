app.TemplateGrid = app.BasicGrid.extend({
	type: 'template',
	
	checkboxList: null,
	
	headHandleEditPanelMapping: null,		
	
	htmlTemplate: $('<div></div>'),
	
	initialize: function(opt){
		app.BasicGrid.prototype.initialize.call(this, opt);
		this.htmlTemplate.load('static/html-template.html',function(){
			this.initHeadHandleEditPanelMapping();
		}.bind(this));
	},
	
	render: function(id){
		app.BasicGrid.prototype.render.call(this,id);
		var self = this;
		if(id){//query template		
			this.getData(id, function(){
				self.renderGrid();				
			});
		}else{//add a new template			
    		this.checkboxList = new app.CheckboxList({
				data: app.columnsManager.getColumns('template')
			});
			self.collection = new Backbone.QueryCollection();
			this.showInfoDialog();
			this.showColumnCheckboxDialog();
		}
	},
	
	showInfoDialog: function(){
		var name = prompt('请输入模板的名称','');
		this.id = this.getNewId();
		this.data = {
			id: this.id,
			name: name,
			columns: {},
			items: []
		};
	},
	
	showColumnCheckboxDialog: function(){
		var self = this;	
		BootstrapDialog.show({
            title: '选择需要的列',
            message: function(){
            	self.save();
				return self.checkboxList.render().el;
            },
            buttons: [{
                label: '确定',
                cssClass: 'btn-primary',
                hotkey: 13, // Enter.
                action: function(dialogRef) {
                	self.columnIndeies = self.checkboxList.getCheckedValues();
                	self.buildData();
                	self.renderGrid();
                	dialogRef.close();
                }
            }]
        });
	},
	
	buildData: function(){
		for(var i = 0,l=this.columnIndeies.length;i<l;i++){
    		var columnIndex = this.columnIndeies[i];
    		this.data.columns[columnIndex] = this.defaultColumnMetadata[columnIndex];
    	}
		app.gridService.save(this.type, this.data.id,this.data);
	},
	
	headerClickHandle: function(headerValue){
		var editPanel = app.TemplateGrid.prototype.headHandleEditPanelMapping[headerValue.name]
		if(editPanel){
			editPanel.render();
		}
	},
	
	initHeadHandleEditPanelMapping: function(){
		var self = this,
		 	TextEditPanel = app.TextEditPanel.extend({el: this.editPanelEl}),
		 	BlankPanel = app.BlankPanel.extend({el: this.editPanelEl});
		
		function editModels(models, keyValue){
			for(var i=0, l=models.length;i<l;i++){
				models[i].set(keyValue);
			}
		}
		
		app.TemplateGrid.prototype.headHandleEditPanelMapping = {
			clause: new TextEditPanel({
				titleText: '批量填写"条款"（慎用）',
				submitHandle:function(){
					editModels(self.collection.models,{'clause':this.getText()});
				}
			}),
			gudeline: new TextEditPanel({
				titleText: '批量填写"指南"（慎用）',
				submitHandle:function(){
					editModels(self.collection.models,{'gudeline':this.getText()});
				}
			}),
			applicability: new app.ApplicabilityEditPanel({
				el: this.editPanelEl,
				gridPanel: this,
				htmlTemplate: this.htmlTemplate.find('#applicability-edit-panel').html(),
				submitHandle: function(){
					self.data.columns['applicability']['metadata']= this.type;
					editModels(self.collection.models,{'applicability':({
						'all': '都适用','byset':'需判断'
					})[this.type]});
				}
			}),
			weight: new app.WeightEditPanel({
				el: this.editPanelEl,
				gridPanel: this,
				htmlTemplate: this.htmlTemplate.find('#select-edit-panel').html()
			}),
			evidence: new BlankPanel(),
			conclusion: new BlankPanel(),
			furtheraction: new BlankPanel()
		}
	}
})