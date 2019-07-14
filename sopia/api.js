var blockUser = (id, tidx=0) => {
	if ( Number.isInteger(id) ) {
		if ( sopia.var.props && sopia.var.props.SPOONCAST_authKey ) {
			if ( sopia.live && sopia.live.id ) {
				sopia.modules.axios({
					headers: {
						"authorization": sopia.var.props.SPOONCAST_authKey
					},
					method: 'post',
					url: `https://api.spooncast.net/lives/${sopia.live.id}/block/`,
					data: {
						block_user_id: id
					}
				});
			}
		} else {
			if ( tidx >= 5 ) {
				return;
			}
			updateProps();
			setTimeout(() => {
				sopia.blockUser(id, tidx+1);
			}, 1000);
		}
	}
};

var getMembers = () => {
	return new Promise(function (resolve, reject) {
		if ( sopia.live && sopia.live.id ) {
			sopia.modules.axios({
				method: 'get',
				url: `https://api.spooncast.net/lives/${sopia.live.id}/members/`
			}).then(res => {
				if ( res.status === 200 ) {
					resolve(res.data.results);
				} else {
					reject(new Error("Request is failed"));
				}
			});
		}
	});
};

var getUserInfo = (id) => {
	return new Promise(function (resolve, reject) {
		sopia.modules.axios({
			method: 'get',
			url: `https://api.spooncast.net/users/${id}/`
		}).then(res => {
			if ( res.status === 200 ) {
				resolve(res.data.results);
			} else {
				reject(new Error("Request is failed"));
			}
		});
	});
};