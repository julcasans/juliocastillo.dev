module.exports = {
    markdown: 'kramdown',
    highlighter: 'rouge',
    permalink: 'none',
    title: 'juliocastillo.dev',
    description: "YaDS - Yet another Developer's Site",
    author: 'Julio Castillo Anselmi',
    settings: {
        menu: [ 
            {name: 'About', path: 'menu', url: 'about'},
            {name: 'Writing', path: 'menu', url: 'writing'},
            {name: 'Contact', path: 'menu', url: 'contact'},
        ],
        social: [
            {icon: 'github', link: 'https://www.github.com/julcasans'},
            {icon: 'twitter', link: 'https://twitter.com/julcasans'},
            {icon: 'linkedin', link: 'http://www.linkedin.com/in/castillojulio/'},
            {icon: 'envelope', link: 'mailto:castillo.julio@gmail.com'},
            {icon: 'rss-square', link: '/feed.xml'}
        ],
        pagination: {
            next_page: 'Newer',
            previous_page: 'Older'
        },
        includeSocialSharing: false,
        sharing_button_prompt: 'Feel free to share!',
        includeRelatedPosts: false,
        related_posts: 'You may also enjoy:',
        post_date_prefix: 'Written on',
        disqus: {
            comments: true,
            "disqus_shortname": 'juliocastillo-dev'
        },
        "google-ID": 'UA-112060364-1'
    }
}