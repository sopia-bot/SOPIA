const { getNowSong } = require('./build/Release/get-now-song');

try
{
	console.log(getNowSong());	
}
catch (e)
{
	console.log('Exception', e);
}
