app.PlanGrid = app.BasicGrid.extend({
	type: 'plan',
	
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
		if(id){//query plan		
			this.getData(id, function(){
				self.renderGrid();				
			});
		}else{//add a new plan			
    		this.checkboxList = new app.CheckboxList({
				data: app.columnsManager.getColumns('plan')
			});
			self.collection = new Backbone.QueryCollection();
			this.showInfoDialog();
			this.showTemplateListDialog();
		}
	},
	
	showInfoDialog: function(){
		var name = prompt('请输入名称','');
		this.id = this.getNewId();
		this.data = {
			id: this.id,
			name: name,
			columns: {},
			items: []
		};
	},
	
	showTemplateListDialog: function(){
		var self = this;	
		BootstrapDialog.show({
	            title: '请选择要使用的模板',
	            message: function(dialogRef){
	            	var htmlContent = $("<div></div>");
	            	for(var i in localStorage){
	            		if(i.indexOf('template_grid_')===0){
	            			var json = $.parseJSON(localStorage[i]);
	            			id = Number(i.replace('template_grid_',''));
	            			(function(id){
		            			htmlContent.append(
		            				$('<a href="javascript:void(0)">'+json.name+'</a><br/>').click(function(){
		            					self.getTemplate(id);
	                					dialogRef.close();
		            				})
	            				);
	            			}(id));
	            		}
	            	}
	            	return htmlContent;
	            },
	            buttons: [{
	                label: 'close',
	                action: function(dialogRef) {
	                	dialogRef.close();
	                }
	            }]
	        });
	},
	
	getTemplate: function(id){
		var self = this;
		app.gridService.get('template',id,function(data){
			if(!data || !('columns' in data)){
				return;
			}
			var columns = data.columns, items = data.items;
			if('applicability' in data.columns){
				var applicability = columns.applicability;
				if(applicability.metadata === 'all'){
					app.columnsManager.setColumnAsString(self.type,'applicability');
					columns.applicability = {
						cellType: 'string',
						metadata: ''
					}
				}else if(applicability.metadata === 'byset'){
					var metadata = [["适用", "适用"], ["不适用", "不适用"]];
					app.columnsManager.setColumnAsSelect(self.type,'applicability', metadata);
					columns.applicability = {
						cellType: 'select-cell',
						metadata: metadata
					}
				}
				for(var i =0,l=items.length;i<l;i++){
					items[i]['applicability'] = '适用';
				}
			}
			if('weight' in data.columns){
				var weightCol = data.columns['weight'];
				if(weightCol.cellType === 'string'){
					app.columnsManager.setColumnAsString(self.type,'weight');
				}else if(weightCol.cellType === 'select-cell'){
					app.columnsManager.setColumnAsSelect(self.type,'weight', weightCol.metadata);
				}
			}
			_.extend(self.data,{columns: columns,items:items});
			self.collection = new Backbone.QueryCollection(items);
			self.save();
			self.renderGrid();
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
		var editPanel = app.PlanGrid.prototype.headHandleEditPanelMapping[headerValue.name]
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
		
		app.PlanGrid.prototype.headHandleEditPanelMapping = {
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
				htmlTemplate: this.htmlTemplate.find('#applicability-edit-panel').html()
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