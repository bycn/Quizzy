var express = require('express');        
var bodyParser = require('body-parser');
var request = require('request');
var app  = express(); 
var pyshell = require('python-shell');


var link = 'http://107.170.194.160/analyze.html'
var basicauth = 'NkROSGhNVnBlSDptNnNFZ05nUEY5UTdleEJWSGFlVGNL';                
var acstkn;
var manualText;


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.get('/quizlet', function(req, res){	
    
	var realCode = req.query.code;
	request({
	    url: 'https://api.quizlet.com/oauth/token?grant_type=authorization_code&code='+realCode+'&redirect_uri='+link, 
	    method: 'POST', 
	    headers: { 
	        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	        'Authorization': 'Basic ' + basicauth
	    }
	}, function(error, response, body){
	    if(error) {
	        console.log(error);
	        res.status(500).end("500 - something's wrong with quizlet clientid");
	    } else {
	        console.log(response.statusCode, body);
	        var acstoken = JSON.parse(body).access_token;
	        var userid = JSON.parse(body).user_id;
	        console.log("access :" + acstoken);
	        acstkn=acstoken;
	        console.log('const is ' + acstkn);
	        var resp = {
	        	daisytodd: acstoken,
	        	username:userid
	        };
	        res.send(resp);
	    }
	});
});


app.post('/manualocr', function(req, res){


	var pyImageURI = req.body.imageuri;

	var options = {
	  mode: 'json',
	  args: [pyImageURI]
	};
	
	pyshell.run('ocr.py', options, function (err, results) {
  		if (err) 
  			throw err;
  		console.log('finished');
  		manualText = results.finishedText;
	});
	
})

app.post('/newSet', function(req, res){
	
	var title = req.query.title;
	console.log('the body is ' + req.body);
	console.log('terms = ' + req.body.terms);
	console.log('definitions = ' + req.body.definitions);
	var terms = req.body.terms;
	var definitions = req.body.definitions;
	if(terms == null){
		res.status(500).send('No terms specified in the body');
	} else if(acstkn==null){
		res.status(500).send('You have to login to quizlet, before making a new set!!');
	} else if (definitions==null){
		res.status(500).send('No definitions specified in the body');
	} else {
		var termString = '';
		var defString = '';
		for(var i = 0;i < terms.length; i++){
			termString+='&terms[]='+terms[i];
			defString += '&definitions[]='+definitions[i]; 
		}
		var defs;
		var langterms = "en";
		var langdefs = "en";
		console.log('the title of the set is : ' + title);
		console.log('these are the terms I got: ' + termString);
		console.log('these are the defs  I got: ' + defString);
	    request({
	        url: 'https://api.quizlet.com/2.0/sets?title='+title+termString+defString+'&lang_terms='+langterms+'&lang_definitions='+langdefs, 
		    method: 'POST', 
		    headers: { 
		        'Content-Type': 'application/JSON; charset=UTF-8',
	            'Authorization': 'Bearer ' + acstkn
		    }
		
	    },function(err, resp, body){
	        if(err){
	            console.log(err)
	        }
	        else{
	            res.send(JSON.parse(body));
	        }
	    })
	}
})

app.use(express.static('public'));
app.listen(80);