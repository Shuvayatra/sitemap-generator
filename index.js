var sm = require('sitemap')
    , fs = require('fs')
    , request= require('sync-request')
    , zlib = require('zlib')
    , htmlToText = require('html-to-text')
    , url='https://api.shuvayatra.org/v1/api/posts'
    , urls=[];


while (url!==null) {
    let res=request('GET', url);
    console.log('processing for '+url);
    let posts=JSON.parse(res.body);
    
    for (let post of posts.data) {
            let postNode={
                url:'https://shuvayatra.org/post/'+post.id,

            };
            let videos=[];
            let images=[];
            if(post.type==='video' && post.data.thumbnail!=='' && post.title!=='' && post.description!==''){
                let video={
                    "thumbnail_loc":post.data.thumbnail,
                    "title":post.title,
                    "description":htmlToText.fromString(post.description)
                };
                videos.push(video);
            } else if (post.featured_image!==''){
                images.push({
                        url: post.featured_image
                });
            }
            postNode.img=images;
            postNode.video=videos;
            urls.push(postNode);
        }
    url=posts.next_page_url;
}
saveSitemap(urls);




function saveSitemap(urls){
    let sitemap = sm.createSitemap({
        hostname: 'https://shuvayatra.org',
        cacheTime: 600000,  //600 sec (10 min) cache purge period 
        urls: urls,
    });

    var stringData=sitemap.toString();
    fs.writeFileSync("../webapp/sitemap.xml", stringData);
    fs.writeFileSync("../webapp/sitemap.xml.gz", zlib.gzipSync(stringData));
    console.log('sitemap saved...');
}
