$(function() {
    $('#createButton').prop("disabled", true);
    document.getElementById("createButton").style.cursor = "not-allowed";

    var cropped = false;
    var jcrop_api;
    var textFill = "";


    $("#userInfoButton").click(function() {
        submitUserInfo();
    });

    $("#startcropping").click(function() {
        var canvas = document.getElementById('canvas2');
        // var viewport = document.getElementById("viewport");
        // viewport.height = canvas.height;
        // viewport.width = canvas.width;
        cropped = true;
        jcrop_api = $('#canvas2').Jcrop({
            onSelect: updatePreview,
            allowSelect: true,
            allowMove: true,
            allowResize: true,
            aspectRatio: 0
        });
    });

    $("#cropimage").click(function() {
        //changeToCroppedImage()
        cropImageToSend();
    });

    $("#newset").click(function() {
        createSet();
    });


    function changeToCroppedImage() {
        var c = document.getElementById("canvas2");
        c.remove();
        $("div").remove(".jcrop-holder")
    }

    function cropImageToSend() {
        var canvas = document.getElementById("viewport");
        var title = document.getElementById('newtitleset').value;
        // analyze(canvas, function(terms, defs) {
        //     console.log('hi');
        //     console.log("terms pt 2 " + terms);
        //     console.log("defs pt2 " + defs);
        //     var t = [];
        //     var d = [];
        //     console.log("DEFS" + JSON.stringify(defs));
        //     for (var i = 0; i < terms.length; i++) {
        //         t[i] = terms[i].text;
        //         d[i] = defs[i].text;
        //     }
        //     //console.log("terms" + terms);
        //     //console.log("defs " + defs);
        //    postSet(t, d, title);
        // });
    }

    function upperCase(word) {
        var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return upperCase.indexOf(word.charAt(0))
    }

    function updatePreview(c) {
        if (parseInt(c.w) > 0) {
            var imageObj = $("#canvas2")[0];
            var canvas = document.getElementById("viewport");
            var context = canvas.getContext("2d");
            if (imageObj != null && c.w != 0 && c.h != 0) {
                //because the param coming in is the actual canvas tracking the cropping oops :)
                canvas.height = c.h;
                canvas.width = c.w;
                context.drawImage(imageObj, c.x, c.y, c.w, c.h, 0, 0, canvas.width, canvas.height);
            }
        }
    }


    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    var accessToken;


    if (window.location.href.indexOf("code") != -1) {
        createPostReqForSet();
    }

    function createPostReqForSet() {
        continueQuizletAuth();
    }

    function handleFileSelect(evt) {
        var files = evt.target.files;
        for (var i = 0, f; f = files[i]; i++) {

            if (!f.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();
            $('html, body').animate({
                scrollTop: $("#scrollId").offset().top
            }, 500);
            reader.onload = (function(theFile) {
                return function(e) {
                    convertToCanvas(e.target.result);
                };
            })(f);
            reader.readAsDataURL(f);
        }
    }

    function showProgress(p) {
        console.log(p);
    }

    function convertToCanvas(lastPhoto) {

        var canvas2 = document.getElementById("canvas2");

        canvas2.width = lastPhoto.width;

        canvas2.height = lastPhoto.height;

        var canvasbanana = canvas2.getContext("2d");

        var img = new Image();
        img.src = lastPhoto;
        img.onload = function() {
            canvas2.width = img.width;
            canvas2.height = img.height;
            canvasbanana.drawImage(img, 0, 0);
        }
        console.log(img.width + " " + img.height);


        return canvasbanana;
    }

    function passData(username, accessToken) {
        var username = username;
        if (username != null) {
            document.getElementById("loggedIn").textContent = username;
            document.getElementById("loggedOut").textContent = "";
            $('#createButton').prop("disabled", false);
            document.getElementById("createButton").style.cursor = "pointer";
        }
    }

    function continueQuizletAuth() {
        var currentURL = window.location.href;
        var code = currentURL.substring(currentURL.indexOf("code=") + 5);

        $.ajax({
            type: "GET",
            url: "http://107.170.194.160/quizlet?code=" + code,
            success: function(msg) {
                passData(msg.username, msg.access);
            },
            error: function(error) {
                console.log(error);
            }
        });
    }

    function postSet(terms, definitions, ntitle) {
        var title = ntitle;
        console.log('new title is ' + ntitle)
        var body = {
            'terms': terms,
            'definitions': definitions
        }
        console.log('terms: ' + JSON.stringify(terms));
        console.log('definitions ' + JSON.stringify(definitions));
        $.ajax({
            type: "POST",
            url: "http://107.170.194.160/newSet?title=" + title,
            contentType: "application/json",
            processData: false,
            dataType: "json",
            data: JSON.stringify(body),
            success: function(msg) {
                $("#createButton").text('Create set');
                var x = window.confirm("Would you like to go to your set?");
                if (x) {
                    window.open("http://quizlet.com");
                }
            },
            error: function(error) {
                alert("error with creating a new set");
            }
        });
    }

    function createSet() {
        $("#createButton").text('Loading...');
        if (cropped) {
            var canvas = document.getElementById('viewport');
            console.log('sending cropped image');
        } else {
            var canvas = document.getElementById('canvas2');
            console.log('sending og image');
        }
        var title = document.getElementById('newtitleset').value;

        analyze(canvas, function(terms, defs) {
            var t = [];
            var d = [];
            console.log("DEFS" + JSON.stringify(defs));
            for (var i = 0; i < terms.length; i++) {
                t[i] = terms[i].text;
                d[i] = defs[i].text;
            }
            //console.log("terms" + terms);
            //console.log("defs " + defs);
            postSet(t, d, title);


        })
    }



    function form2Json(str) {
        var obj, i, pt, keys, j, ev;
        if (typeof form2Json.br !== 'function') {
            form2Json.br = function(repl) {
                if (repl.indexOf(']') !== -1) {
                    return repl.replace(/\](.+?)(,|$)/g, function($1, $2, $3) {
                        return form2Json.br($2 + '}' + $3);
                    });
                }
                return repl;
            };
        }
        str = '{"' + (str.indexOf('%') !== -1 ? decodeURI(str) : str) + '"}';
        obj = str.replace(/\=/g, '":"').replace(/&/g, '","').replace(/\[/g, '":{"');
        obj = JSON.parse(obj.replace(/\](.+?)(,|$)/g, function($1, $2, $3) {
            return form2Json.br($2 + '}' + $3);
        }));
        pt = ('&' + str).replace(/(\[|\]|\=)/g, '"$1"').replace(/\]"+/g, ']').replace(/&([^\[\=]+?)(\[|\=)/g, '"&["$1]$2');
        pt = (pt + '"').replace(/^"&/, '').split('&');
        for (i = 0; i < pt.length; i++) {
            ev = obj;
            keys = pt[i].match(/(?!:(\["))([^"]+?)(?=("\]))/g);
            for (j = 0; j < keys.length; j++) {
                if (!ev.hasOwnProperty(keys[j])) {
                    if (keys.length > (j + 1)) {
                        ev[keys[j]] = {};
                    } else {
                        ev[keys[j]] = pt[i].split('=')[1].replace(/"/g, '');
                        break;
                    }
                }
                ev = ev[keys[j]];
            }
        }
        return obj;
    }

    function submitUserInfo() {
        quizletAuth();

    }


    function quizletAuth() {
        var str = makeid();
        var redirectURI = "https://quizlet.com/authorize?response_type=code&client_id=6DNHhMVpeH&scope=write_set&state=" + str;
        var currentURL = window.location.href;
        console.log(currentURL.indexOf("code"));
        window.open(redirectURI, 'auth time');
    }


    function waitForUrlToChangeTo(urlRegex) {
        var currentUrl;

        return browser.getCurrentUrl().then(function storeCurrentUrl(url) {
            currentUrl = url;
        }).then(function waitForUrlToChangeTo() {
            return browser.wait(function waitForUrlToChangeTo() {
                return browser.getCurrentUrl().then(function compareCurrentUrl(url) {
                    return urlRegex.test(url);
                });
            });
        });
    }

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {
            type: 'image/jpeg'
        });
    }

    function giveUpperBounds(bounds) {
        return parseInt(bounds[0]) + parseInt(bounds[2]);
    }

    function isCapital(string) {
        return (/[A-Z]/.test(string));
    }

    function analyze(canvas, handleData) {

        //if we wanna ever use tesseract, which I don't really see why to
        //         Tesseract.recognize(canvas, {progress: showProgress, lang: 'eng'}).then(function (d) {
        // textFill = (d.text).replace(/(\r\n|\n|\r)/gm," ");
        // console.log(textFill);
        // dispTerms(textFill);
        //         }, function (err) {
        //             console.log(err);
        //         });

        var imageData = canvas.toDataURL();

        var blob = dataURItoBlob(imageData);
        var params = {
            "language": "unk",
            "detectOrientation ": "true",
        };
        $.ajax({
                url: "https://api.projectoxford.ai/vision/v1/ocr?" + $.param(params),
                beforeSend: function(req) {
                    req.setRequestHeader("Content-Type", "application/octet-stream");
                    req.setRequestHeader("Ocp-Apim-Subscription-Key", "8e115deee2784030a3f5931899bec42e");
                    req.setRequestHeader("Access-Control-Allow-Origin", "*");
                },
                processData: false,
                type: "POST",
                data: blob
            })
            .done(function(data) {
                console.log(JSON.stringify(data));
                var lineText = "";
                var ter = [];
                var de = [];

                //works but glitches sometimes
                // if (data.regions != null) {
                //  console.log(data.regions.length);
                //  var bounds = data.regions[0].boundingBox.split(',');
                //  var upperbound = giveUpperBounds(bounds);
                //  console.log(upperbound);
                //  for(var i = 0; i < data.regions.length; i++){
                //      for(var j = 0; j < data.regions[i].lines.length; j++){
                //          for(var k = 0; k <  data.regions[i].lines[j].words.length; k++) {
                //              var boundstemp = data.regions[i].lines[j].words[k].boundingBox.split(',');
                //              var upperboundstemp = giveUpperBounds(boundstemp);
                //              if(upperboundstemp < upperbound)
                //                  ter.push(data.regions[i].lines[j].words[k].text);
                //              else
                //                  de.push(data.regions[i].lines[j].words[k].text);
                //          }
                //      }
                //  }

                //  if (ter.length > de.length)
                //      ter.splice(0, de.length); 
                //  else if (de.length > ter.length)
                //      de.splice(0, ter.length);
                console.log(data.regions[0].lines[0].words[0].text);
                if (!isCapital(data.regions[0].lines[0].words[0].text)) {
                    console.log('lowercase');
                    for (var i = 0; i < data.regions[0].lines.length; i++) {
                        var text = ""
                        for (var j = 0; j < data.regions[0].lines[i].words.length; j++) {
                            text = text + (data.regions[0].lines[i].words[j].text) + " ";
                        }
                        var objToAdd = {
                            'text': text
                        }
                        ter.push(objToAdd);
                    }
                    for (var i = 0; i < data.regions[1].lines.length; i++) {
                        var text = "";
                        for (var j = 0; j < data.regions[1].lines[i].words.length; j++) {
                            text = text + (data.regions[1].lines[i].words[j].text) + " ";
                        }
                        var objToAdd = {
                            'text': text
                        }
                        de.push(objToAdd);
                    }


                    //console.log('i go here bc ter: ' + ter.length + ' de ' + de.length);
                    if (ter.length > de.length) {
                        ter = ter.slice(0, de.length);
                        //console.log('ter ' + ter.length);
                    } else /**(de.length > ter.length)*/ {
                        de = de.slice(0, ter.length);
                    }
                    console.log('definitions sending:' + JSON.stringify(de));
                    console.log('terms sending:' + JSON.stringify(ter))

                    handleData(ter, de);
                } else {
                    console.log('uppercase')
                    for (var i = 0; i < data.regions[0].lines.length; i++) {
                        var text = "";
                        var boundingBox;
                        for (var j = 0; j < data.regions[0].lines[i].words.length; j++) {
                            text = text + (data.regions[0].lines[i].words[j].text) + " ";
                            if (j == data.regions[0].lines[i].words.length - 1)
                                boundingBox = data.regions[0].lines[i].words[j].boundingBox;
                        }
                        var toAdd = {
                            'text': text,
                            'boundingBox': boundingBox.split(',')
                        }
                        ter.push(toAdd);
                    }
                    for (var i = 0; i < data.regions[1].lines.length; i++) {
                        var text = "";
                        var boundingBox;
                        for (var j = 0; j < data.regions[1].lines[i].words.length; j++) {
                            text = text + (data.regions[1].lines[i].words[j].text) + " ";
                            if (j == data.regions[1].lines[i].words.length - 1)
                                boundingBox = data.regions[1].lines[i].words[j].boundingBox;
                        }
                        var toAdd = {
                            'text': text,
                            'boundingBox': boundingBox.split(',')
                        }
                        de.push(toAdd);
                    }


                    var newterms = [];
                    for (var i = 0; i < ter.length;) {

                        if (upperCase(ter[i].text) != -1) {
                            var newTerm = ter[i].text;
                            //console.log(ter[i].text)
                            i++
                            while (i < ter.length && upperCase(ter[i].text) == -1) {
                                console.log(ter[i].text)
                                newTerm += ter[i].text
                                    //boundingBox = ter[i].boundingBox[0] + ter[i].boundingBox[2];
                                i++;
                            }
                            bb = [parseInt(ter[i - 1].boundingBox[1]), parseInt(ter[i - 1].boundingBox[3])];

                            var objToAdd = {
                                'text': newTerm,
                                'bb': bb
                            }

                            newterms.push(objToAdd)
                        }
                    }
                    console.log('NEW TERMS' + JSON.stringify(newterms));

                    var newdefs = [];

                    var starting = 0;
                    var index = 0;
                    var j = parseInt(de[0].boundingBox[1]) + parseInt(de[0].boundingBox[3]);
                    for (var i = 1; i < newterms.length; i++) {
                        var upperLimitBounds = newterms[i].bb[0];
                        //console.log('new bounds' + upperLimitBounds);

                        var newdef = "";

                        console.log('starting at: ' + j)
                        while (j < upperLimitBounds) {
                            newdef += de[index].text;
                            index++;
                            j = parseInt(de[index].boundingBox[1]) + parseInt(de[index].boundingBox[3]);

                        }
                        //console.log(newdef);
                        var objToAdd = {
                            'text': newdef
                        }
                        newdefs.push(objToAdd);
                    }

                    //console.log("INDEX" + index);


                    // for(var i = index; i<de.length; i++){

                    //  if(newterms[i] != null){
                    //      var obj = {
                    //          'text':de[i].text
                    //      }
                    //      newdefs.push(obj)
                    //  }
                    // }


                    console.log('NEW DEFS ' + JSON.stringify(newdefs))
                        //console.log(ter);
                        //console.log(de);


                    if (newterms.length > newdefs.length) {
                        console.log('hihihihihi');
                        newterms = newterms.slice(0, newdefs.length);
                    } else if (newdefs.length > newterms.length) {
                        newdefs = newdefs.slice(0, newterms.length);
                    }

                    console.log('length1 ' + newterms.length);
                    console.log('length2 ' + newdefs.length);




                    handleData(newterms, newdefs);
                }

            })
            .fail(function(err) {
                console.log(JSON.stringify(err));
            });
    }
    //thank you http://fiddle.jshell.net/BADfT/12/ 

    var dropZoneId = "drop-zone";
    var buttonId = "clickHere";
    var mouseOverClass = "mouse-over";

    var dropZone = $("#" + dropZoneId);
    var ooleft = dropZone.offset().left;
    var ooright = dropZone.outerWidth() + ooleft;
    var ootop = dropZone.offset().top;
    var oobottom = dropZone.outerHeight() + ootop;
    var inputFile = dropZone.find("input");
    document.getElementById(dropZoneId).addEventListener("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.addClass(mouseOverClass);
        var x = e.pageX;
        var y = e.pageY;

        if (!(x < ooleft || x > ooright || y < ootop || y > oobottom)) {
            inputFile.offset({
                top: y - 15,
                left: x - 100
            });
        } else {
            inputFile.offset({
                top: -400,
                left: -400
            });
        }

    }, true);

    if (buttonId != "") {
        var clickZone = $("#" + buttonId);

        var oleft = clickZone.offset().left;
        var oright = clickZone.outerWidth() + oleft;
        var otop = clickZone.offset().top;
        var obottom = clickZone.outerHeight() + otop;

        $("#" + buttonId).mousemove(function(e) {
            var x = e.pageX;
            var y = e.pageY;
            if (!(x < oleft || x > oright || y < otop || y > obottom)) {
                inputFile.offset({
                    top: y - 15,
                    left: x - 160
                });
            } else {
                inputFile.offset({
                    top: -400,
                    left: -400
                });
            }
        });
    }

    document.getElementById(dropZoneId).addEventListener("drop", function(e) {
        $("#" + dropZoneId).removeClass(mouseOverClass);
    }, true);
});
