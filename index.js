const container = document.getElementById('container')

const types = [
    { name: "Photos", path: "/upload.html?type=photos", icon: "fas fa-images" },
    { name: "Songs", path: "/upload.html?type=songs", icon: "fas fa-music" },
    { name: "Files", path: "/upload.html?type=files", icon: "fas fa-file-alt" }
]

let html = ``
for (const type of types) {
    html += `
        <a href=${type.path}  class="fileType">
            <i class="${type.icon}"></i>
            <span>${type.name}<span>
        </a>
    `
}

container.innerHTML = html