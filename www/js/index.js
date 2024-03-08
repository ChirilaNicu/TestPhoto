document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    db = window.sqlitePlugin.openDatabase({
        name: 'photoLocator.db',
        location: 'default'
    });

    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Photos (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT, latitude REAL, longitude REAL)');
    }, function (error) {
        alert('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Database and table created');
    });
    var takePhotoButton = document.getElementById('take-photo-btn');
    takePhotoButton.addEventListener('click', takePhoto);
}

function savePhotoData(uri, latitude, longitude) {
    db.transaction(function (tx) {
        tx.executeSql('INSERT INTO Photos (uri, latitude, longitude) VALUES (?, ?, ?)', [uri, latitude, longitude]);
    }, function (error) {
        alert('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Photo data saved successfully');
    });
    displayPhotos();

}

function takePhoto() {
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        saveToPhotoAlbum: true,
        correctOrientation: true
    });
}

function onPhotoSuccess(imageURI) {
    // Get GPS coordinates
    navigator.geolocation.getCurrentPosition(function (position) {
        // Save photo URI and GPS coordinates to the local database
        savePhotoData(imageURI, position.coords.latitude, position.coords.longitude);
    }, onGeoError, { enableHighAccuracy: true });
}

function onPhotoFail(message) {
    alert('Failed to get picture: ' + message);
}

function onGeoError(error) {
    alert('Failed to get GPS location: ' + error.message);
}
function displayPhotos() {
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM Photos', [], function (tx, results) {
            var photoContainer = document.getElementById('photo-container');
            photoContainer.innerHTML = ''; // Clear the container

            var len = results.rows.length;
            for (var i = 0; i < len; i++) {
                var photo = results.rows.item(i);
                var img = new Image();
                img.src = photo.uri; // Assuming 'uri' contains a valid path for the image
                img.className = "photo-thumbnail"; // CSS class for styling
                img.setAttribute("alt", "Photo with ID " + photo.id);

                // Optionally, you can include latitude and longitude information
                var caption = document.createElement('div');
                caption.innerText = "Latitude: " + photo.latitude + ", Longitude: " + photo.longitude;

                // Append the image and caption to your photo container
                photoContainer.appendChild(img);
                photoContainer.appendChild(caption);
            }
        }, function (tx, error) {
            alert('SELECT error: ' + error.message);
        });
    });
}