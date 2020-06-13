const fs = require('fs');
const axios = require('axios');
const path = require('path');

axios({
    url: 'https://scontent.fccj2-1.fna.fbcdn.net/v/t1.0-9/102718639_10157000052287133_600512927240305032_o.jpg?_nc_cat=103&_nc_sid=07e735&_nc_ohc=-LCEaX-D3qwAX8UwvgE&_nc_ht=scontent.fccj2-1.fna&oh=6dd204fce1615fa79e25a92b813b5c9f&oe=5F0A7412',
    method: 'GET',
    responseType: 'stream'
}).then((response) => {
    
    console.log(response.data);

    var imgPath = path.join('/Users/faiz/Documents/Faiz/Personal/Projects/FB Groups/Sanchari/7659786958470', '0.jpg');
    //let imgPath = '/Users/faiz/Documents/Faiz/Personal/Projects/FB Groups/Sanchari/7659786958470/0.jpg';

    response.data.pipe(fs.createWriteStream(imgPath))
    .on('finish', () => {
        console.log(imgPath + ' successfully downloaded');
        console.log(imgPath + ' downloded');
    })
    .on('error', (error) => {
        console.log('Error downloading ' + imgPath);
        console.log(error);
    })
})