const Credentials = require('./credentialss'), // Include our credentials
Nightmare = require('nightmare'),
vo = require('vo'),
nightmare = Nightmare({show: true}),
domain = 'https://facebook.com',      // Initial navigation domain
group = 'https://www.facebook.com/groups/785863974804742/?sorting_setting=RECENT_ACTIVITY'; //group to be scraped.

let scrollTimes = [1, 2, 3, 4, 5
    , 6, 7, 8, 9, 10, 
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
    
let length = 0;
let docHeight = 0;

(async () => {
//Navigate to facebook and get the doc height.
// add console logging - makes life a bit easier
docHeight = await nightmare
.on('console', (log, msg) => {
    console.log(msg);
    console.log(Credentials.facebook_username);
})
.useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36") // browser info - not essential
.goto(domain)
.type('input[id="email"]', Credentials.facebook_username)
.type('input[id="pass"]', Credentials.facebook_password)
.click('input[value="Log In"]')
.wait(20000) // will wait 20 seconds to load next page
.goto(group)
.wait(15000)
.inject('js', './node_modules/jquery/dist/jquery.js') // injecting jQuery into the page
.evaluate(() => {
    var height = $(document).height(); // Returns height of HTML document
    console.log(height);
    return height;
})
.then((height) => {
   return height;
})
.catch((error) => {
    console.log(error);
})


//Start scrolling facebook page and extract perma links.
if(docHeight != 0)
{
    console.log('executing if condition');
    console.log('docHeight:' + docHeight);

    scrollTimes.reduce((accumulator, currentValue, currentIndex, array) => {
       

        return accumulator.then(() => {
            console.log('CurrentIndex: ' + currentIndex);
            console.log('docHeight:' + docHeight);
            return nightmare
                    .scrollTo(docHeight, 0)
                    .wait(15000)
                    .evaluate(() => {
                        var permalink = $("a[href^='/groups/TeamSanchari/permalink/']");
                        console.log(permalink.length);
                        var height = $(document).height(); // Returns height of HTML document
                        console.log(height);
                        var response = {permalinks: permalink, height:height};
                        return response;
                    })
                    .then((response) => {
                        docHeight = response.height;
                        console.log('New Height after Scroll: ' +docHeight);
                    })
        })
    }, Promise.resolve([]).then(() => {
        console.log('exiting from reduce function')
        //var permalink = $("a[href^='/groups/TeamSanchari/permalink/']");
        //console.log(permalink.length);
    }));
}
else
{
    console.log('inside else');
}
})();


