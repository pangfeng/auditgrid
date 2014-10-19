window.app = window.app || {}; 
window.app.gridService = {
	get: function(type, id, callback){
		var key = type+'_grid_'+id;
		if(key in localStorage){
			callback($.parseJSON(localStorage[key]));
		}else{
			$.getJSON("data/audit-"+type+".json",function(data){
				var jsonObject = null;
				if(data && (id in data)){
					jsonObject = data[id];
					localStorage[key] = JSON.stringify(jsonObject);
				}
				if(_.isFunction(callback)){
					callback(jsonObject);
				}
			});
		}
	},
	
	save: function(type, id, data){
		data = (typeof data === 'string')?data: JSON.stringify(data);
		localStorage[type+'_grid_'+id] = data;
	}
};
