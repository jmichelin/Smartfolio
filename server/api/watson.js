var watson = require('watson-developer-cloud');
var fs = require('fs');
var db = require('../config/db');
var path = require('path')

var visual_recognition = watson.visual_recognition({
  api_key: '',
  version: 'v3',
  version_date: '2016-05-20'
});


db.raw(`SELECT images.idimages from images where images.idimages not in  (select tags.idimages from tags)`)
  .then(function (results) {
    results[0].forEach(function (imgid) {
      db.raw(`SELECT imghash from images where idimages  = ${imgid.idimages}`)
        .then(function (imgResult) {
          var imgName = imgResult[0][0].imghash;
          var params = {
            images_file: fs.createReadStream(`../uploads/${imgName}`)
          };

          visual_recognition.detectFaces(params, function (err, res) {
            if (err) {
              console.log(err);
            } else {
              res.images[0].faces.forEach(function (face) {
                var age;
                if (face.age.max) {
                  age = `age\: ${face.age.min} - ${face.age.max}`;
                } else {
                  age = `age\: around ${face.age.min}`;
                }
                db.raw(`INSERT INTO tags VALUES (null, ${imgid.idimages} ,'${age}')`)
                .then( function (results) {
                  console.log('more success')
                })
                .catch( function (err) {
                  console.log(err)
                })
                db.raw(`INSERT INTO tags VALUES (null, ${imgid.idimages} ,'${face.gender.gender}')`)
                .then( function (results) {
                  console.log('success')
                })
                .catch( function (error) {
                  console.log('error')
                })
                
              })
            }

          });

        })
        .catch(function (err) {
          console.log(err)
        })
      db.raw(`SELECT imghash from images where idimages  = ${imgid.idimages}`)
        .then(function (imgResult) {
          var imgName = imgResult[0][0].imghash;
          var params = {
            images_file: fs.createReadStream(`../uploads/${imgName}`)
          };
          visual_recognition.classify(params, function (err, res) {
            if (err) {
              console.log(err);
            } else {
              res.images[0].classifiers[0].classes.forEach(function (tagClass) {

                db.raw(`INSERT INTO tags VALUES (null, ${imgid.idimages}, '${tagClass.class}')`)
                  .then(function (results) {
                  })
                  .catch(function (err) {
                    console.log(err)
                  })
              });
            }
          });
        })
    });
  }).catch(function (err) {
    console.log(err)
  })

// var params = {
//   images_file: fs.createReadStream('../uploads/michelle@michelle.com download-free-coreldraw-tutorials-vector-design.png')
// };

// visual_recognition.detectFaces(params,
//   function(err, response) {
//     if (err)
//       console.log(err);
//     else
//       console.log(typeof response);
//       console.log(JSON.stringify(response,null,2));
//   });