const Nightmare = require('nightmare');
const nightmare = Nightmare({show: true});
const Credentials = require('./credentialss');
const domain = 'https://facebook.com';

return nightmare
    .useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36") // browser info - not essential
    .goto(domain)
    .type('input[id="email"]', Credentials.facebook_username)
    .type('input[id="pass"]', Credentials.facebook_password)
    .click('input[value="Log In"]')
    .goto('https://www.facebook.com/photo.php?fbid=2098408123635885&set=pcb.3199112453479870&type=3&theater&ifg=1')
    .wait(20000)
    .inject('js', './node_modules/jquery/dist/jquery.js')
    .click('a[title="Next"]')
    .wait(20000)
    .evaluate(() => {
    console.log('evaluating image');
    let imgSrc = $('img[class="spotlight"]').attr('src');
    console.log('Image Source : ' + imgSrc);
    //return imgSrc;
    })
    .catch((error) => {
        console.log('inside catch')
        console.log(error);
     })