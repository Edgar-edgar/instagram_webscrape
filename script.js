const puppeteer = require('puppeteer')
const fs = require('fs');


const scrapeImages = async(tags) => {
    const browser = await puppeteer.launch( {headless:false} );
    const page = await browser.newPage();
    const url = await page.goto(`https://www.instagram.com/explore/tags/${tags}/`, {waitUntil: 'networkidle2'});
  
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
                      
                if(posts.length >= 15000){
                    clearInterval(timer)
                    resolve();
                }
                
            },3000)
        })
       
        console.log(eval.length)
        return posts;
    });
    
    await browser.close()
    return eval;

}
scrapeImages('spring').then(function(result){
    let data = {
        posts: result,
        length: result.length,
    };
    fs.writeFile(`spring_${Date.now()}.json`, JSON.stringify(data, null, 2), function(error){
        if(error){
            console.log(error)
        }    
   })

//    const download = (url, path, callback) => {
//        request.head(url, (err, res, body) => {
//            request(url)
//                 .pipe(fs.createWriteStream(path))
//                 .on('close'), callback)
//        })
//    }

});

 