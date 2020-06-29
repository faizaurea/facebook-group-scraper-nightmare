const Credentials = require('./credentialss'), // Include our credentials
Nightmare = require('nightmare'),
vo = require('vo'),
fs = require('fs'),
axios = require('axios'),
path = require('path'),
url = require('url'),
cheerio = require('cheerio'),
jquery = require('jquery'),
nightmare = Nightmare({show: true}),
domain = 'https://facebook.com',      // Initial navigation domain
dirPath = '/Users/faiz/Documents/Faiz/Personal/Projects/FB Groups/Sanchari';
permalinkBaseUrl = 'https://www.facebook.com/groups/TeamSanchari/permalink/', //permalink Base Url
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
let fbPost;
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
   /*console.log('executing cheerio');
   var element = '<a class="_5pcq" href="/groups/TeamSanchari/permalink/3163083407082775/" target=""><abbr data-utime="1590832681" title="Saturday, 30 May 2020 at 15:28" data-shorten="1" class="_5ptz timestamp livetimestamp" aria-label="22 hours ago"><span class="timestampContent" id="js_yn">22 hrs</span></abbr></a>'
   var $ = cheerio.load(element);
   console.log('permalink url: ' + $('a').attr('href'));*/
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

            //remove duplicates if any
        
            //let uniquePermaLinks = jquery.uniqueSort(permalinks); 

            //iterate to generate an array
            let postUrls = [];
            $(permalinks).each((i, link) => {
                var href = 'https://facebook.com/' + $(link).attr('href');
                console.log('href: ' + href);
                
                if(postUrls.indexOf(href) == -1)
                {
                    postUrls.push(href);
                }
            })

            console.log('Post Urls :' + postUrls.length);

            //var $ = cheerio.load(permalinks[1]);
            //console.log('permalink url: ' + $('a').attr('href'));
            return postUrls;
            });
        
        

        //check if the permalinks is populated
        if(permalinksArr.length > 0)
        {
            //iterate over the links to extract the facebook posts.
            console.log('iterating over facebook posts');
            permalinksArr.reduce((accumulator, currentUrl, currentIndex, array) => {
                return accumulator.then(() => {
                    console.log(currentUrl);

                    let post = {Error: ''};

                    return nightmare
                    .goto(currentUrl)
                    .wait(20000)
                    .inject('js', './node_modules/jquery/dist/jquery.js')
                    .evaluate(()=>{
                       //extract post content in html format
                       console.log('inside evaluete method, extract post content');
                       var postContent =  $('.userContent').html();
                       var author = $('.fwb'); // extract author details
                       var authorName = $(author).find('a').text();
                       var authorProfileLink = $(author).find('a').attr('ajaxify');
                       //var authorAjaxifyLink = $(author).find('a').attr('ajaxify');

                       var imgHyperLinks = $('a[data-render-location="group_permalink"]');
                       var totalImageCount = 0;
                       var imgHyperLinkUrl = '';

                        if(imgHyperLinks.length)
                        {
                            //it has been identified videos does not have correct href value
                            //hence needs to be mofified.
                            var photosUrl = $.map(imgHyperLinks, (elem, index) => {
                                            var href = $(elem).attr('href');
                                            console.log('href: ' + href);
                                            if(href.indexOf('www.facebook.com') < 0)
                                            {
                                                console.log('this is a video');

                                                var hrefValue = `https://www.facebook.com${href}`;
                                                $(elem).attr('href', hrefValue);
                                                console.log('elem: ' + $(elem).attr('href'));
                                                return elem;
                                            }
                                            else
                                            {
                                                return elem;
                                            }
                                        })
                            console.log('Total Photos url: ' + photosUrl.length);

                            //set the count of images, assuning there are no additional images
                            totalImageCount = photosUrl.length;
                            imgHyperLinkUrl = $(photosUrl[0]).attr('href');
                            
                        
                            var lastHyperLinkIndex = imgHyperLinks.length - 1;
                            var div = $(imgHyperLinks[lastHyperLinkIndex]).find('div');
                            if(div.length)
                            {
                                var lastImgIndex = div.length - 1;
                                var totalImageCountText = $(div[lastImgIndex]).text();

                                //Remove the + from the totalImageCountText
                                 if(totalImageCountText.indexOf('+') > -1)
                                 {
                                     var plusIndex = totalImageCountText.indexOf('+');
                                     if(plusIndex < totalImageCountText.length)
                                     {
                                        var imageCount = totalImageCountText.substring(plusIndex+1, totalImageCountText.length);
                                        totalImageCount = (imgHyperLinks.length - 1) + parseInt(imageCount);
                                        console.log(imageCount);
                                     }
                                     else
                                     {
                                         console.log('No plus sign in count');
                                     }
                                 }
                                 else
                                 {
                                     console.log('No additional images');
                                 }
                            }
                            else
                            {
                                console.log('no additional div');
                            }
                        }
                        else
                        {
                            console.log('No images exists');
                        }

                       var response = {post: postContent, totalPhotos: totalImageCount, imgHyperLinkUrl: imgHyperLinkUrl, author: {name: authorName, profileLink: authorProfileLink}};
                       return response;
                    })
                    .then((res) => {
                        //save post to local storage
                        //extract post id from url
                        console.log('Extracting Post ID');
                        var postId = currentUrl.substring(permalinkBaseUrl.length, currentUrl.length - 1); //-1 removes / from the link
                        console.log('Post ID:' + postId);
                        console.log('Total Photos Uploaded: ' + res.totalPhotos);

                        //Create Folder and save to local storage
                        var postDirPath = path.join(dirPath, postId);
                        var authorDirPath =  path.join(postDirPath, 'Author');

                        //create post
                        post = {PostID: postId, Url: currentUrl, PostDirPath: postDirPath, AuthorDirPath: authorDirPath ,TotalPhotos: res.totalPhotos, ImgHyperlinkUrl: res.imgHyperLinkUrl, DirectoryCreated: false, PostSaved: false, Error: '', Author: res.author, AuthorDirCreated: false};

                        console.log('Printing post');
                        console.log('post author: ' + post.Author.name);
                        console.log('post profile url: ' + post.Author.profileLink);

                        fs.mkdir(postDirPath, { recursive: true }, (err) => {
                            if(!err)
                            {
                                console.log(postId + ' dir succesfully created');
                                post.DirectoryCreated = true;

                                var file = path.join(postDirPath, postId +'.html');
                                fs.writeFile(file, res.post, (err) => {
                                    if(!err)
                                    {
                                        console.log(postId + ' succesfully created');
                                        post.PostSaved = true;
                                    }
                                    else
                                    {
                                        console.log(postId + ' failed creating file'); 
                                        console.log(err);
                                    }
                                })

                                //Create author directory
                                
                                fs.mkdir(authorDirPath, { recursive: true }, (err) => {
                                    if(!err)
                                    {
                                        console.log('Author Directory Created');
                                        post.AuthorDirCreated = true;
                                    }
                                    else
                                    {
                                        console.log('Author Directory creation failed');
                                    }
                                })
                            }
                            else
                            {
                                console.log(postId + ' failed creating dir'); 
                                console.log(err);
                            }
                        }); //create directory end

                        return post;
                    })
                    .catch((error) => {
                        console.log('Error: ' + error);
                        post.Error = error;
                        return post;
                    })
                }).then((post) => {

                    //save fb post to extract profile
                    //fbPost = post;
                    //console.log('post: ' + post);
                    //console.log('fbpost: ' +fbPost);

                    if(!post.Error)
                    {
                        //Remove query string from url
                        var queryObject = url.parse(post.Author.profileLink, true).query;
                        let member_id = queryObject.member_id;

                        console.log('member_id: ' + member_id);

                        //var queryStringIndex = post.Author.profileLink.indexOf('&');
                        var profileLink = path.join('https://www.facebook.com', member_id);

                        console.log('Profile Link: ' + profileLink);

                        //set short profile link
                        post.Author.profileLink = profileLink;

                        var overviewProfileLink = profileLink + '?sk=about&section=overview'

                        console.log('New Profile Link: ' + overviewProfileLink);

                        //navigate to author overview profile
                        return nightmare
                                .goto(overviewProfileLink)
                                .wait(20000)
                                .inject('js', './node_modules/jquery/dist/jquery.js')
                                .evaluate(() =>{
                                    console.log('inside author profile');
                                    //extract User Profile details
                                    
                                    var overviewHtml = $('#u_k_4').html();
                                    let profilePicSrc = $('.profilePicThumb').find('img').attr('src'); 
                                    var userProfile = {profilePic: profilePicSrc, overview: overviewHtml};
                                    return userProfile;
                                })
                                .then((userProfile) => {
                                    console.log('saving user details');

                                    //save overview details
                                    if(post.AuthorDirCreated)
                                    {
                                        //create json file with user details
                                        var user = `{"name":"${post.Author.name}", "fburl":"${post.Author.profileLink}", "fbID:${member_id}"}`;
                                        var authorFile = path.join(post.AuthorDirPath, 'author.json');
                                        overviewFile = path.join(post.AuthorDirPath, 'overview.html');
                                        
                                        //save author file
                                        fs.writeFile(authorFile, user, (err) => {
                                            if(!err)
                                            {
                                                console.log(authorFile + ' succesfully created');
                                                //post.PostSaved = true;
                                            }
                                            else
                                            {
                                                console.log(authorFile + ' failed creating file'); 
                                                console.log(err);
                                            }
                                        })

                                        fs.writeFile(overviewFile, userProfile.overview, (err) => {
                                            if(!err)
                                            {
                                                console.log(overviewFile + ' succesfully created');
                                                //post.PostSaved = true;
                                            }
                                            else
                                            {
                                                console.log(overviewFile + ' failed creating file'); 
                                                console.log(err);
                                            }
                                        })

                                        //Download profile pic
                                        axios({
                                            url: userProfile.profilePic,
                                            method: 'GET',
                                            responseType: 'stream'
                                        }).then((response) => {
                                            var imgPath = path.join(post.AuthorDirPath, 'profilePic.jpg');
                                            response.data.pipe(fs.createWriteStream(imgPath))
                                            .on('finish', () => {
                                                console.log(userProfile.profilePic + ' successfully downloaded');
                                                console.log(imgPath + ' downloded');
                                            })
                                            .on('error', (error) => {
                                                console.log('Error downloading ' + imgPath);
                                                console.log(error);
                                            })
                                        })

                                    }

                                    if(post.TotalPhotos > 1)
                                    {
                                        //create an array with the length equivalent to the no. of photos uploaded
                                        let photos = [];
                                        for(i=0; i < post.TotalPhotos; i++)
                                        {
                                            photos.push(i);
                                        }
                                        console.log('Photos Array Length: ' + photos.length);

                                        return photos.reduce((accumulator, currentValue, currentIndex, totalPhotos) => {
                                            console.log('Iterating images ' + currentValue);
                                            return accumulator.then(() => {

                                                if(currentValue == 0)
                                                {
                                                    console.log('executing ' + currentValue);

                                                    return nightmare
                                                            .goto(post.ImgHyperlinkUrl)
                                                            .wait(20000)
                                                            .inject('js', './node_modules/jquery/dist/jquery.js')
                                                            .evaluate(() => {
                                                                console.log('evaluating image');
                                                                let imgSrc = $('img[class="spotlight"]').attr('src');
                                                                console.log('Image Source : ' + imgSrc);
                                                                return imgSrc;
                                                            })
                                                            .then((imgSrc) => {
                                                                console.log('saving image to directory : ' +post.PostDirPath);
                                                                axios({
                                                                    url: imgSrc,
                                                                    method: 'GET',
                                                                    responseType: 'stream'
                                                                }).then((response) => {
                                                                    var imgPath = path.join(post.PostDirPath, currentValue +'.jpg');
                                                                    response.data.pipe(fs.createWriteStream(imgPath))
                                                                    .on('finish', () => {
                                                                        console.log(imgSrc + ' successfully downloaded');
                                                                        console.log(imgPath + ' downloded');
                                                                    })
                                                                    .on('error', (error) => {
                                                                        console.log('Error downloading ' + imgPath);
                                                                        console.log(error);
                                                                    })
                                                                })
                                                            })
                                                            .catch((error) => {
                                                                console.log('inside catch')
                                                                console.log(error);
                                                            });
                                                }
                                                else
                                                {
                                                    console.log('executing ' + currentValue);

                                                        return nightmare
                                                                //.wait(20000)
                                                                .click('a[title="Next"]')
                                                                .wait(20000)
                                                                .evaluate(() => {
                                                                    let imgSrc = $('img[class="spotlight"]').attr('src');
                                                                    return imgSrc;
                                                                })
                                                                .then((imgSrc) => {
                                                                    axios({
                                                                        url: imgSrc,
                                                                        method: 'GET',
                                                                        responseType: 'stream'
                                                                    }).then((response) => {
                                                                        var imgPath = path.join(post.PostDirPath, currentValue +'.jpg');
                                                                        response.data.pipe(fs.createWriteStream(imgPath))
                                                                        .on('finish', () => {
                                                                            console.log(imgSrc + ' successfully downloaded');
                                                                            console.log(imgPath + ' downloded');
                                                                        })
                                                                        .on('error', (error) => {
                                                                            console.log('Error downloading ' + imgPath);
                                                                            console.log(error);
                                                                        })
                                                                    })
                                                                })
                                                                .catch((error) => {
                                                                    console.log('inside catch')
                                                                    console.log(error);
                                                                });
                                                    }
                                            })
                                        }, Promise.resolve([])).then(() => {
                                            //console.log('Author Name :' +fbPost.author.name);
                                            //console.log('Author Profile Line:' +fbPost.author.profileLink);
                                        })
                                    }
                                    //excute the else if part if there is only image uploaded
                                    else if(post.TotalPhotos == 1)
                                    {
                                                    return nightmare
                                                            .goto(post.ImgHyperlinkUrl)
                                                            .wait(20000)
                                                            .inject('js', './node_modules/jquery/dist/jquery.js')
                                                            .evaluate(() => {
                                                                console.log('evaluating image');
                                                                let imgSrc = $('img[class="spotlight"]').attr('src');
                                                                console.log('Image Source : ' + imgSrc);
                                                                return imgSrc;
                                                            })
                                                            .then((imgSrc) => {
                                                                console.log('saving image to directory : ' +post.PostDirPath);
                                                                axios({
                                                                    url: imgSrc,
                                                                    method: 'GET',
                                                                    responseType: 'stream'
                                                                }).then((response) => {
                                                                    var imgPath = path.join(post.PostDirPath, '0.jpg');
                                                                    response.data.pipe(fs.createWriteStream(imgPath))
                                                                    .on('finish', () => {
                                                                        console.log(imgSrc + ' successfully downloaded');
                                                                        console.log(imgPath + ' downloded');
                                                                    })
                                                                    .on('error', (error) => {
                                                                        console.log('Error downloading ' + imgPath);
                                                                        console.log(error);
                                                                    })
                                                                })
                                                            })
                                                            .catch((error) => {
                                                                console.log('inside catch')
                                                                console.log(error);
                                                            });
                                    }
                                
                                }) // end of then function
                    }
                })
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


