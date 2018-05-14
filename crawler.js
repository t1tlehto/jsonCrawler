var fs = require('fs');
const cheerio = require('cheerio');
var obj;
// using global variables to contain the found pages and images. 
// TODO: create a service that would store these values for better abstraction. 
var visitedPages = [];
var validPages = [];
var errorPages = [];
var images = [];
var fileName = 'internet2.json';
//var fileName = 'internet.json';

/**
 * Using fs to read the json file. We'll start the crawler by adding the first page url and the read json object.
 */
fs.readFile(fileName, 'utf8', function (err, data) {
  if (err) throw err;
  // parsing the file data into an json object. 
  obj = JSON.parse(data);

  // adding the first page to our crawler. for this challenges purposes hardcoding is sufficient.
  // TODO: add a possibility to launch this app with arguments for the first page url. 
  // TODO: make this truly asynchronious. Right now it's okay to work through this all with synchronious code,
  // since we already have all the page data read into local memory. 
  addPage(obj, "foo.bar/page/1");

  // since we at the moment have a synchronious functionality, we can call the print function knowing that all pages have been handled. 
  printResults();
});

/**
 * Adds page to the list of visited pages and triggers parsing. Checks first that page has been visited before.
 * @param {*} data Object with all the read information. 
 * @param {*} url Url of the page. 
 */
function addPage(data,url) {	
	if(!visitedPages[url]) {
		visitedPages[url] = true;
		lookForTags(data,url);
	}
}

/**
 * Finds html a tags and returns the href urls. 
 * @param {*} html cheerio HTML object.
 */
function findATags(html) {
	// finds a href tags from the HTML given using cheerio.
	var aTags = html('a[href]'); // tag that has 'a' and 'href'
	var results = [];
	aTags.each(function() {	
		results.push(html(this).attr('href'));
	});
	return results;
}

/**
 * Finds img tags from given HTML. Returns the src of each. 
 * @param {*} html cheerio HTML object.
 */
function findImgTags(html) {
	var imgTags = html('img[src]');
	//console.log("Found " + imgTags.length + " images on page");
	var results = [];
	imgTags.each(function() {	
		//console.log($(this).attr('src'));
		results.push(html(this).attr('src'));
	});
	return results;
}

/**
 * Adds image url to the list of images. Increments the amount found.
 * @param {*} url image url.
 */
function recordImage(url) {
	images[url] = images[url] ? images[url] + 1 : 1;
}

/**
 * parses the page and finds the html tags.
 * @param {*} data 
 * @param {*} pageUrl 
 */
function lookForTags(data, pageUrl) {
	// checking if the pageUrl exist in our previously read json data object. 
	if(data[pageUrl]) {
		// marking as a valid page. 
		validPages.push(pageUrl);

		var html = cheerio.load(data[pageUrl]);
		var aTags = findATags(html);
		aTags.forEach(function(link) {
			addPage(data, link);
		});

		var imgTags = findImgTags(html);
		imgTags.forEach(function(image) {	
			recordImage(image);
		});

	} else {
		//no page Found, marking as error page.
		errorPages.push(pageUrl);
	}
}
/**
 * Prints out the results.
 * TODO: maybe look closer into how it's printed. 
 */
function printResults() {
	console.log('Valid pages: ');
	console.log(validPages);	
  
	console.log('ERROR pages: ');
	console.log(errorPages);

	console.log('IMAGES: ');
	console.log(images);	
}
