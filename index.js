const progressContainer = document.querySelector(".progress")
const uploader = document.getElementById('dynamic')
const fileButton = document.getElementById('fileButton')
const images = document.getElementById('images')
const alertSuccess = document.getElementById("uploadSuccess")

fileButton.addEventListener('change', async e => {
    // show upload progress bar
    progressContainer.classList.remove('d-none')

    // get file name
    const file = e.target.files[0]

    // create ref to storage
    const storageRef = firebase.storage().ref('photos/' + file.name)

    const storageRefPhoto = firebase.storage().ref("photos")
    const result = await storageRefPhoto.listAll()
    let html = ''
    for (const item of result.items) {
        const url = await item.getDownloadURL()
        html += `
            <img src="${url}" alt="" width="200px" height="200px"/>
        `
    }

    images.innerHTML = html

    try {
        await storageRef.getDownloadURL()
        alert("File exist")
        return
    } catch { }

    const task = storageRef.put(file)

    task.on('state_changed',
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            uploader.style.width = percentage + "%"
        },

        function error(err) {
            alert(err.message)
        },

        function complete() {
            alertSuccess.classList.add("show")
            setTimeout(() => {
                alertSuccess.classList.remove("show")
                progressContainer.classList.add('d-none')
                uploader.style.width = "0%"
                fileButton.value = ""
            }, 1500)
        }
    )
})