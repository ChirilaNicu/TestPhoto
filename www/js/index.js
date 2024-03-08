/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

var db;

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
        quality: 75,
        destinationType: Camera.DestinationType.FILE_URI
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
                img.src = "data:image/jpeg;base64," + photo.uri;
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