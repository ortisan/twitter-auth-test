"use strict";

var request = require('request');
var crypto = require('crypto');
var moment = require('moment');
var express = require('express');
var url_module = require('url');
var app = express();

// TODO Change this
var consumerKey = "zJXYlseVQANKpUkLeBuyxRuSR";
// TODO Change this
var consumerSecret = "FMoQ9EyEEGUkONjs5Uac2nSCBQ0Y4Mcn5RLIjboIgrfEsYAHLp";

var method = 'POST'
var url_token = 'https://api.twitter.com/oauth/request_token';
var url_authenticate = 'https://api.twitter.com/oauth/authenticate';

function encodeArray(array) {
    var encodedValue = '';

    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        for (var key in obj) {
            encodedValue += encode(`&${key}=${obj[key]}`);
        }
    }
    return encodedValue.substring(3);
}

function encode(valor) {
    return encodeURIComponent(valor);
}

function createSignature(oauthHeader) {
    var valueToHash = `POST&${encode(url_token)}&${encodeArray(oauthHeader)}`;
    console.log(`BASE STRING: ${valueToHash}`);
    var signKey = `${encode(consumerSecret)}&`;
    var signature = crypto.createHmac('sha1', signKey).update(valueToHash).digest("base64");
    console.log(`Signature: ${signature}`);
    return signature;
}

function orderOauthKeys(oauthHeader) {
    oauthHeader.sort(function (obj1, obj2) {
        // Suposing that not has object inside object.
        return Object.keys(obj1)[0] < Object.keys(obj2)[0] ? -1 : 1;
    });
    return oauthHeader;
}

function getOauthAuthorizationPart(oauthHeader) {
    oauthHeader = orderOauthKeys(oauthHeader);
    var oauthPart = "";
    for (var i = 0; i < oauthHeader.length; i++) {
        var obj = oauthHeader[i];
        for (var key in obj) {
            oauthPart += `,${key}="${obj[key]}"`;
        }
    }
    return `OAuth ${oauthPart.substring(1)}`;
}

var randomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.get('/token', function (req, res) {
    return new Promise(function (resolve, reject) {
        var oauthHeader = new Array();

        oauthHeader.push({"oauth_callback": encode("http://localhost:8888/callback")});
        oauthHeader.push({"oauth_consumer_key": `${consumerKey}`});
        oauthHeader.push({"oauth_nonce": `${randomString(42)}`});
        oauthHeader.push({"oauth_signature_method": "HMAC-SHA1"});
        oauthHeader.push({"oauth_timestamp": `${Math.floor(Date.now() / 1000)}`});
        oauthHeader.push({"oauth_version": "1.0"});

        var signature = createSignature(oauthHeader);
        oauthHeader.push({'oauth_signature': encode(signature)});


        var post_options = {
            uri: url_token,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${getOauthAuthorizationPart(oauthHeader)}`
            }
        };

        request(post_options, function (err, res, body) {
            if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                resolve(body);
            } else {
                reject(res);
            }
        });
    }).then(function (data) {
        // Fake url just to parse query string
        var oauth_token = url_module.parse(`http://localhost:0000?${data}`, true).query.oauth_token;
        res.redirect(`${url_authenticate}?oauth_token=${oauth_token}`);
    }).catch(function (err) {
        res.json({
            resposta: err
        });
    });
});

app.get('/callback', function (req, res) {
    res.json({sucesso: true});
});

app.listen(8888, function () {
    console.log('Example app listening on port 8888!')
});