const progressContainer = document.querySelector(".progress")
const uploader = document.getElementById('dynamic')
const fileButton = document.getElementById('fileButton')
const content = document.getElementById('content')
const alertSuccess = document.getElementById("alertSuccess")
const alertFail = document.getElementById("alertFail")

const type = window.location.search.split("=")[1]
if (!type) {
    window.location.href = "/"
}

const onProgress = snapshot => {
    const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
    uploader.style.width = percentage + "%"
}

const onError = () => { }

const onComplete = () => {
    alertNoti('success', 'Upload successfully')

    renderFiles()
}

const alertNoti = (alertType, message) => {
    const alert = alertType === "success" ? alertSuccess : alertFail
    alert.innerHTML = message
    alert.classList.add("show")
    setTimeout(() => {
        alert.classList.remove("show")
        resetForm()
    }, 1500)
}

const resetForm = () => {
    progressContainer.classList.add('d-none')
    uploader.style.width = "0%"
    fileButton.value = ""
}

const renderContent = (path, name, url) => {
    if (type === "photos") {
        return `
            <div class="col-md-3 ">
                <div class="photoContainer d-flex flex-column align-item-center">
                    <a href=${url} target="_blank"><img src="${url}" alt="" class="photo" title=${name}/></a><br />
                    <button class="deleteBtn btn btn-danger btn-sm" id="${path}">Delete</button>
                </div>
            </div>
        `
    } else {
        return `
            <div class="d-flex align-items-center">
                <a href=${url} target="_blank" class="mr-3">
                    <span>${name}</span><br />
                </a>
                <button class="deleteBtn btn btn-danger btn-sm" id="${path}">Delete</button>
            </div>
        `
    }
}

renderHtml = html => {
    if (!html.trim()) {
        html = `
            <div class="col-lg-6 pl-0">
                <div class="alert alert-primary" role="alert">
                    No data on cloud
                </div>
            </div>
        `
    }
    content.innerHTML = html
    const deleteBtns = document.getElementsByClassName('deleteBtn')
    for (const btn of deleteBtns) {
        const fileRef = firebase.storage().ref(btn.id)
        btn.addEventListener('click', () => {
            const accept = confirm("Do you want to delete this file ?")
            if (accept) {
                fileRef.delete()
                renderFiles()
            }
        })
    }

    if (type === "photos") {
        content.classList.add("row")
    }
}

const renderFiles = async () => {
    try {
        let html = ''
        const storageRefPhoto = firebase.storage().ref(type)
        const result = await storageRefPhoto.listAll()
        content.innerHTML = "Loading..."
        for (const item of result.items) {
            const url = await item.getDownloadURL()
            const name = item.name
            const path = item.fullPath
            html += renderContent(path, name, url)
        }

        renderHtml(html)
    } catch (err) {
        location.reload()
    }
}

renderFiles()

fileButton.addEventListener('change', async e => {
    // show upload progress bar
    progressContainer.classList.remove('d-none')

    // get file name
    const file = e.target.files[0]
    if (type === "photos" && !file.type.includes("image") || type === "songs" && !file.type.includes("audio")) {
        alertNoti('error', 'File type is not valid')
        return
    }

    // create ref to storage
    const storageRef = firebase.storage().ref(`${type}/${file.name}`)

    // check if file name is existed on cloud 
    try {
        await storageRef.getDownloadURL()
        const overWrite = confirm("Your cloud db has a file with this name ? Do you want to overwrite it ?")
        if (!overWrite) {
            resetForm()
            return
        }
    } catch { }

    const task = storageRef.put(file)

    task.on('state_changed', onProgress, onError, onComplete)


})