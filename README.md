# instagram_webscrape
webscraping posts data in instagram.

# Install
```npm install puppeteer```

```npm install buffer```

```npm install request```


## import
`const puppeteer = require('puppeteer');`

```const fs = require('fs');```

```const Buffer = require('buffer/').Buffer;```

```const request = require('request');```


-`script.js` contains the program for crawling data from instagram.

 in commandline `node script.js`
-this will automatically run, and crawl data form instagram with the specific tag. also creates json after.

# Explanation of Code:

-this line makes you open the web on its link provided.
```
const scrapeImages = async(tags) => {
    const browser = await puppeteer.launch( {headless:false} );
    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/explore/tags/${tags}/`, {waitUntil: 'networkidle2'});
```
-This one evaluates the page execution on getting the data needed of image.
```
const eval = await page.evaluate(async ()=> {
        let posts = []
        let post= {};
        await new Promise(resolve =>{
            let count = 0;
            let timer = setInterval(function(){
                window.scrollBy(0,document.body.scrollHeight)
                const images = document.querySelectorAll('#react-root > section > main > article > div > div > div > div > a');
                let lastCount = posts.length;
                images.forEach(function(image){
                    let description = image.querySelector('img').alt;    
                    let image_src = image.querySelector('img').src; 
                    if(description.includes('Image may contain: ')){
                        let split_description = description.split('Image may contain: ');
                        let comma = split_description[1].split(', ');
                        let popped_comma = comma.pop();
                        let and = popped_comma.split(' and ');
                        let sorted_list = [...comma, ...and];
                        
                        sorted_list = sorted_list.filter(function(sorted_lists){
                            return sorted_lists != null;
                        });

                        post = {
                            url: image.getAttribute('href'), 
                            image_url: image_src,
                            description: sorted_list
                        }

                        let included = posts.some(function(existing_post){
                            return post.url == existing_post.url;
                        })

                        if(!included){
                            posts.push(post);
                        }
                    }    
                })

                if(lastCount == posts.length){
                    count++;
                }else{
                    count = 0;
                }
                if(count >= 10){
                    clearInterval(timer)
                    resolve()
                }
                
                console.log("adding 0 ", count)
                console.log('Storage:',posts.length)
                console.log(post)
                      
                if(posts.length >= 5){
                    clearInterval(timer)
                    resolve();
                }
                
            },1000)
        })
        
        return posts;
    });
    
    await browser.close()
    return eval;
}
```
-This function gets image url to convert in base64 data.
```
function getBase64(url){
    return new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if(error) return reject(error)
            let data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
            resolve(data)
        })
    })
}
```

-Here, we set which data we want to crawl. `scrapeImages('fame')` just simply rename the parameter of scrapeImages('love')
and also this function stores altogether with the base64 data.
```
scrapeImages('fame').then(async function(result){
    console.log("Converting image")
    await new Promise(resolve =>{
        result.map(async (post,index) => {
        let base64 = await getBase64(post.image_url)
        post.base64 = base64
        if(index === result.length-1) resolve()
        
    })
        console.log("done converting")

    })

    let data = {
        posts: result,
        length: result.length,
    };
```
    
-this function creates `.json` file which serves as our storage of crawled data.

```
    fs.writeFile(`fame_${Date.now()}.json`, JSON.stringify(data, null, 2), function(error){
        if(error){
            console.log(error)
        }
        console.log('Done saving!')
   })
});
```
