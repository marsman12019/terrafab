
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Hello Terra!', version: require("../package.json").version });
};


/*
 * GET DTM data.
 */

exports.dtm = function(req, res){

  // The dtm.vrt file, TODO: make this configruable in application config.
  var dtm_file = "/mnt/warez/dtm/dtm.vrt";

  // The bounding box from query
  var box = req.query.box;
  if(box == null) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end('{"error": "No box param given. Should be in format: '+
      '?box=253723.176600653,6660500.4670516,267723.176600653,6646500.4670516"}');
  } else {
    box = box.split(',');
  }
  // The output size of the tile
  var outsize = req.query.outsize;
  if(outsize == null) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end('{"error": "No outsize param given. ' +
      'Should be in format: ?outsize=1000,1000  (x,y)"}');
  } else {
    outsize = outsize.split(",");
    if(outsize.length == 1) {
      outsize = [outsize,outsize];
    }
  }

  var png_file = "/tmp/"+box.join("_")+".png";
  var command = "bash -c 'gdal_translate -q -scale 0 550 -ot Byte -of PNG -outsize " +
    outsize[0] + " " + outsize[1] +
    " -projwin " + box.join(', ') +
    " " + dtm_file + " " + png_file + "'";

  var exec = require('child_process').exec;
  var fs = require('fs');

  function pipe(err, stdout, stderr) {
    if (err) {
      err.error = stderr
      return res.send(500, err);
    }
    res.writeHead(200, {'Content-Type': 'image/png' });
    var img = fs.readFileSync(png_file);
    res.end(img, 'binary');
    fs.unlinkSync(png_file);
  }
  exec(command, pipe);
};
