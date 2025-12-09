async function loadPost(path) {
    const response = await fetch(path);
    const text = await response.text();

    const metaMatch = text.match(/<!--([\s\S]*?)-->/);
    let metadata = {};

    if (metaMatch) {
        try {
            metadata = JSON.parse(metaMatch[1].replace("meta:", "").trim());
        } catch (e) {
            console.error("Metadata parse error in file:", path);
        }
    }

    const content = text.replace(metaMatch[0], "").trim();

    return { path, ...metadata, content };
}

async function loadAllPosts() {
    const postFiles = [
        "posts/engineering-post1.html",
        "posts/engineering-post2.html",
        "posts/psychology-post1.html",
        "posts/misc-post1.html"
    ];

    const promises = postFiles.map(f => loadPost(f));
    return Promise.all(promises);
}

async function renderHome() {
    const container = document.getElementById("recent-posts");
    if (!container) return;

    const posts = await loadAllPosts();
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    posts.slice(0, 4).forEach(p => {
        container.innerHTML += `
            <div class="post-card">
                <h2><a href="post.html?post=${p.path}">${p.title}</a></h2>
                <p><em>${p.date}</em></p>
                <p>${p.excerpt}</p>
            </div>
        `;
    });
}

async function renderCategory() {
    const container = document.getElementById("category-posts");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("cat");

    const posts = await loadAllPosts();
    const filtered = posts.filter(p => p.categories.includes(cat));

    document.getElementById("cat-title").innerText = cat;

    filtered.forEach(p => {
        container.innerHTML += `
            <div class="post-card">
                <h2><a href="../post.html?post=${p.path}">${p.title}</a></h2>
                <p>${p.excerpt}</p>
            </div>
        `;
    });
}

async function renderPost() {
    const container = document.getElementById("post-content");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const file = params.get("post");

    const post = await loadPost(file);

    document.getElementById("post-title").innerText = post.title;
    document.getElementById("post-date").innerText = post.date;
    container.innerHTML = post.content;
}

renderHome();
renderCategory();
renderPost();
