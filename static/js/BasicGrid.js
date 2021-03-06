window.app = window.app || {}; 
window.app.BasicGrid = Backbone.View.extend({
	id: 0,
	
	data: null,
	
	type: 'basic',
	
	collection: null,
	
	//edit panel Element
	editPanelEl: null,
	
	grid: null,
	
	gridEl: null,
	
	topbarEL: null,	
	
	defaultColumnMetadata: {
		"title": {"cellType":"string","metadata":""},
		"clause":{"cellType":"string","metadata":""},
		"gudeline": {"cellType":"string","metadata":""},
		"applicability":{"cellType":"string","metadata":""},
		"weight":{"cellType":"string","metadata":""},
		"evidence":{"cellType":"string","metadata":""},
		"conclusion":{"cellType":"string","metadata":""},
		"furtheraction":{"cellType":"string","metadata":""}
	},
	
	initialize: function(opt){
		_.extend(this,opt);
		app.columnsManager.setHeaderClickHandle(_.isFunction(opt.headerClickHandle)?opt.headerClickHandle:this.headerClickHandle);
		this.buildEditPanelFactory();
		var self = this;
		window.app.EditPanel.prototype.show = function(){
			self.editPanelEl.animate({"right":0},'fast');
			self.el.animate({"right":'219px'},'fast');
		}
		window.app.EditPanel.prototype.hide = function(){
			self.editPanelEl.animate({"right":'-219px'},'fast');
			self.el.animate({"right":0},'fast');
		}
	},
	
	getData: function(id, callback){
		var self = this;
		window.app.gridService.get(this.type, id, function(data){
			//if no data, reset view to add new grid.
			if(!data || !('items' in data)){
				window.location.hash='';
				return;
			}
			if('applicability' in data.columns){
				var applCol = data.columns['applicability'];
				if(applCol.cellType === 'string'){
					app.columnsManager.setColumnAsString(self.type,'applicability');
				}else if(applCol.cellType === 'select-cell'){
					app.columnsManager.setColumnAsSelect(self.type,'applicability', applCol.metadata);
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
			
			self.data = data;
			self.collection = new Backbone.QueryCollection(data.items);
			if(_.isFunction(callback)){
				callback();
			}
		});	
	},
	
	render: function(id){		
		this.id = this.id || id;
		var typeName = ({template:'模板',plan:'计划表',audit:'Audit'})[this.type];
		this.topbarEL = $("<div id='grid-topbar'>"+typeName+"名称：<span id='grid-name'></span><span class='type-name'></span></div>");
		this.topbarEL.append();
		this.gridEl = $("<div></div>");
		this.el.empty().append(this.topbarEL,this.gridEl);
	},
	
	renderGrid: function(){
		this.topbarEL.find("#grid-name").text(this.data.name);
		// Initialize a new Grid instance
		this.grid = new Backgrid.Grid({
		  columns: app.columnsManager.getColumns(this.type, this.columnIndeies),
		  collection: this.collection
		  ,emptyText: "No Data"
		});
		// Render the grid and attach the root to your HTML document
		this.gridEl.empty().append($(this.grid.render().el).addClass('table table-bordered').attr('id',this.type+"_grid"));
		this.addListeners();
	},
	
	addListeners: function(){
		var self = this, collection = this.collection;
		collection.on('change', this.save.bind(this));
		collection.on('add', this.save.bind(this));
		collection.on('remove', this.save.bind(this));
		this.el.delegate('td','click',function(){
			var $this = $(this), columnName = $this.attr('field-name');
			if(!columnName) {
				return;
			}
			if('title-applicability-weight-evidence-conclusion-furtheraction'.indexOf(columnName)>-1){
				new app.BlankPanel({el: self.editPanelEl}).render();
				return;
			}
			var trIndex = $this.parents('tr').index(),
				text = $this.text(),
				model = collection.at(trIndex),
				cellType = self.defaultColumnMetadata[columnName].cellType,
				editPanel = self.getEditPanel(cellType);
			_.extend(editPanel,{model:model,attr:columnName});
			editPanel.render();			
		});
		
		var colors={
			'none':{next:'red',value:'#ddd'},'red':{next:'blue',value:'#f94d18'},
			'blue':{next:'green',value:'#22f4f6'},'green':{next:'none',value:'#f6ef22'},
		},
		colorKeys = ['none','red','blue','green'];
		this.el.find('td.title').each(function(i,obj){
			var colorKey = colorKeys[[(Math.random()*12<<0)%4]];
			$(obj).attr('color-tag',colorKey).css('border-left-color',colors[colorKey].value);
		});
		
		this.el.delegate('td.title','click',function(){
			var $this = $(this), color = colors[$this.attr('color-tag')];
			$this.css('border-left-color',colors[color.next].value).attr('color-tag',color.next);
		});
	},
	
	buildEditPanelFactory: function(){
		this.editPanelFactory = {
			'string': new app.TextEditPanel({el: this.editPanelEl})			
		}
	},
	
	getEditPanel: function(key){
		return this.editPanelFactory[key];
	},
	
	add: function(title, index){		
		index = typeof index === 'undefined'?this.collection.length:Number(index);
		if(!title){
			title = (prompt('请输入名称：',''));
			if(title){
				this.add(title);
			}
			return;
		}
		this.collection.add({title: title},{at:index});
	},
	
	remove: function(index){
		this.collection.models.splice(index,1);
		this.save().render(this.id);
	},
		
	moveUp: function(index){
		if(index <= 0 || index > this.collection.length-1){
			return;
		}
		var num = 0,
			step = 0,
			models = this.collection.models,
			cur= models[index],
			prev= models[index-1],
			type = cur.get('type'),
			level = cur.get('level');
		
		if(type==='item'){
			num = 1;	
		}else if(type === 'section'){
			num = this.getDescendantNumber(index)+1;
		}
		
		if(prev.get('level')<level){
			return;
		}
		
		for(var i = index-1;i>=0;i--){
			if(models[i].get('level')===level){
				step = i - index;
				break;
			}
		}
		this.move(index, num, step);
	},
	
	moveDown: function(index){
		if(index < 0 || index > this.collection.length-2){
			return;
		}
		var num = 0,
			step = 0,
			models = this.collection.models,
			cur= models[index]
			type = cur.get('type'),
			level = cur.get('level');
		
		if(type==='item'){
			var next = models[index +1];
			if(next.get('level') === level){
				if(next.get('type') === 'item'){
					this.move(index, 1, 1);
				}else if(next.get('type') === 'section'){
					var step = this.getDescendantNumber(index + 1)+1;
					this.move(index, 1, step);
				}
			}
		}else if(type === 'section'){
			var num = this.getDescendantNumber(index)+1;
			var step = this.getDescendantNumber(index + num)+1;
			this.move(index, num, step);
		}
	},
	
	//从startIndex行开始连续的num行向下移动step行
	move: function(startIndex, num, step){
		if(num === 0 || step === 0){
			return;
		}
		var models = this.collection.models, rows = models.splice(startIndex, num);
		var args = rows;
		args.unshift(0);
		args.unshift(startIndex+step);
		Array.prototype.splice.apply(models, args);
		this.save().render(this.id);
	},
	
	//get the number of descendants
	getDescendantNumber:function(index){
		var models = this.collection.models, 
			cur = models[index], 
			type = cur.get('type'),
			level = cur.get('level'),
			length = models.length,
			num=0;
		if(type === 'item' || index > length-2){
			return num;
		}
			
		for(var i=index+1,l = length;i<l;i++){
			var next = models[i];
			if(next.get('level')>level){
				num ++;
			}else{
				break;
			}
		}
		return num;
	},
	
	setTitleAt: function(index, title){
		this.collection.models[index].set('title',title);
	},
	
	save: function(){
		if(this.data){
			this.data.items = this.collection.toJSON(); 
		}
		app.gridService.save(this.type, this.id, this.data);
		return this;
	},
	
	getNewId: function(){
		var i = 1;
		while(this.type+'_grid_'+i in localStorage){
			i++;
		}
		return i;		
	}
});
