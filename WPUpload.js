
const fs = require('fs');
const axios = require('axios');

axios({
  url: 'https://dezimallabs.com/wp-json/wp/v2/media',
  method: 'POST',
  headers: {
    'Content-Disposition':'attachment; filename="4391_7.jpg"',
     Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1OTE1MDQ5MTksImlzcyI6Imh0dHBzOlwvXC9kZXppbWFsbGFicy5jb20iLCJleHAiOjE1OTE1OTEzMTksImp0aSI6ImZlNjk0ODcwLTZhOWQtNDFmOC1hZTJjLTViZWJmOGJkOTRhZSIsInVzZXJJZCI6MSwicmV2b2NhYmxlIjp0cnVlLCJyZWZyZXNoYWJsZSI6bnVsbH0.yHPOAuwovuEXqsfP6mZT7GC3kGMoOC2BDyn3b2CiAwU",
    'Content-Type':'image/jpeg'
    },
    data: fs.readFileSync('/Users/faiz/Documents/Faiz/Personal/Projects/FB Groups/4391_7.jpg', (err, data) => {
      if (err) {
        console.log(err);
      }
    })
})
 .then(res => {
   console.log(res.data);
   console.log('Attachement ID: ' + res.data.id);
   //Update the media
   axios({
    url: 'https://dezimallabs.com/wp-json/wp/v2/media/' + res.data.id,
    method: 'POST',
    headers: {
       Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1OTE1MDQ5MTksImlzcyI6Imh0dHBzOlwvXC9kZXppbWFsbGFicy5jb20iLCJleHAiOjE1OTE1OTEzMTksImp0aSI6ImZlNjk0ODcwLTZhOWQtNDFmOC1hZTJjLTViZWJmOGJkOTRhZSIsInVzZXJJZCI6MSwicmV2b2NhYmxlIjp0cnVlLCJyZWZyZXNoYWJsZSI6bnVsbH0.yHPOAuwovuEXqsfP6mZT7GC3kGMoOC2BDyn3b2CiAwU",
       'Content-Type':'application/json',
       'Accept':'application/json'
      },
      data: {
          "id" : res.data.id,
          "post" : "4391",
          "title" : "Mumbai 5",
          "description" : "Gateway of India"
      }
  }).then((res) => {
    console.log('Successfully updated the attachment to link to the post');  
    console.log(res.data);

  })
 })
 .catch(err => {
   console.log(err)
 });

