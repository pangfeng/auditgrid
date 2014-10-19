window.app = window.app || {}; 
window.app.columnsManager = (function(){
	
	var headerClickHandle = function(){}
	
	var AuditHeaderCell = Backgrid.HeaderCell.extend({
		events: {
		    "click": "clickHandle"
		},
		clickHandle: function(e){
			var target = $(e.target);
			headerClickHandle({
				name: $(e.target).attr('class').split(' ').pop(),
				label: target.text()
			});
		}
	});
	
	var columns = {
		'template': {
			title: { name: "title", label: "名称", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			clause: { name: "clause", label: "条款", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			gudeline: { name: "gudeline", label: "指南", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			applicability: { name: "applicability", label: "适用性", cell: "string", sortable: false,editable:false,headerCell: AuditHeaderCell},			
			weight: { name: "weight", label: "权重", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			evidence: { name: "evidence", label: "证据", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			conclusion: { name: "conclusion", label: "结论", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			furtheraction: { name: "furtheraction", label: "下一步", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell}
		},
		'plan': {
			title: { name: "title", label: "名称", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			clause: { name: "clause", label: "条款", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			gudeline: { name: "gudeline", label: "指南", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			applicability: { name: "applicability", label: "适用性", cell: "string", sortable: false,editable:false,headerCell: AuditHeaderCell},			
			weight: { name: "weight", label: "权重", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			evidence: { name: "evidence", label: "证据", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			conclusion: { name: "conclusion", label: "结论", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell},
			furtheraction: { name: "furtheraction", label: "下一步", cell: "string",sortable: false,editable:false,headerCell: AuditHeaderCell}
		}
	};
	
	
	return {		
		setHeaderClickHandle: function(handle){
			headerClickHandle = handle;
		},
		
		//for example: 
		//type: 'template' or 'plan' or 'audit'
		//options:['title','clause','weight']
		getColumns: function(type, options){
			var cols = columns[type];
			if(_.isArray(options)){		
				var results = [];
				for(var i=0,l=options.length;i<l;i++){
					results.push(cols[options[i]]);
				}
				return results;
			}
			return _.toArray(cols);
		},
		getColumn: function(type, key){
			return columns[type][key];
		},
		setColumnAsSelect: function(type, key, enumObj){
			var col = columns[type][key];
			col.cell = Backgrid.SelectCell.extend({optionValues: enumObj});
			col.editable = true;	
		},
		setColumnAsString: function(type, key){
			var col = columns[type][key];
			col.cell = 'string';
			col.editable = false;	
		}
	}
	
})();


