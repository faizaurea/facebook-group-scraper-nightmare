const Credentials = require('./credentialss'), // Include our credentials
Nightmare = require('nightmare'),
vo = require('vo'),
cheerio = require('cheerio'),
nightmare = Nightmare({show: true}),
domain = 'https://facebook.com',      // Initial navigation domain
group = 'https://www.facebook.com/groups/785863974804742/?sorting_setting=RECENT_ACTIVITY'; //group to be scraped.

let scrollTimes = [1, 2];
    /*, 3, 4, 5
    , 6, 7, 8, 9, 10, 
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    51, 52, 53, 54, 55, 56, 57, 58, 59, 60];*/
    
let length = 0;
let docHeight = 0;
//let permalinks = [];

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
   console.log('executing cheerio');
   var element = '<a class="_5pcq" href="/groups/TeamSanchari/permalink/3163083407082775/" target=""><abbr data-utime="1590832681" title="Saturday, 30 May 2020 at 15:28" data-shorten="1" class="_5ptz timestamp livetimestamp" aria-label="22 hours ago"><span class="timestampContent" id="js_yn">22 hrs</span></abbr></a>'
   var $ = cheerio.load(element);
   console.log('permalink url: ' + $('a').attr('href'));
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
                        console.log('inside evaluate function');
                        var height = $(document).height(); // Returns height of HTML document
                        console.log('height: ' + height);
                        var response = {height:height};
                        return response;
                    })
                    .then((response) => {
                        console.log('inside then function');
                        docHeight = response.height;
                        console.log('New Height after Scroll: ' +docHeight);
                    })
                    .catch((error) => {
                        console.log(error);
                    })
        })
    }, Promise.resolve([])).then(() => {
        console.log('completed executing the array scrollTimes');

        //execute nightmare to extract the html and load to cheerio
        (async () => {
        let permalinksArr = await nightmare
        .evaluate(() => {
            var page = $('#pagelet_group_mall').html();
            //console.log(page);
            return page;
        })
        .then((page) => {
            var $ = cheerio.load(page);
            permalinks = $("a[href^='/groups/TeamSanchari/permalink/']");
            console.log('permalinks length: ' + permalinks.length);

            //iterate to generate an array
            let postUrls = [];
            $(permalinks).each((i, link) => {
                var href = 'https://facebook.com/' + $(link).attr('href');
                console.log('href: ' + href);
                postUrls.push(href);
            })

            //var $ = cheerio.load(permalinks[1]);
            //console.log('permalink url: ' + $('a').attr('href'));
            return postUrls;
            });
        
        

        //check if the permalinks is populated
        if(permalinksArr.length > 0)
        {
            //iterate over the links to extract the facebook posts.
            console.log('iterating over facebook posts');
            permalinksArr.reduce((accumulator, currentValue, currentIndex, array) => {
                return accumulator.then(() => {
                    console.log(currentValue);

                    return nightmare
                    .goto(currentValue)
                    .wait(20000)
                    .catch((error) => {
                        console.log(error);
                    })
                });
            }, Promise.resolve([]));
        }
        else
        {
            console.log('no permalinks available, ending execution');
            nightmare.end();
        }
    })(); //ending anonymous async function
    });
}
else
{
    console.log('inside else');
}
})();


