/*document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    db = window.sqlitePlugin.openDatabase({
        name: 'photoLocator.db',
        location: 'default'
    });

    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Photos (id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT, latitude REAL, longitude REAL, signature TEXT)');
    }, function (error) {
        alert('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Database and table created');
    });

    var takePhotoButton = document.getElementById('take-photo-btn');
    takePhotoButton.addEventListener('click', takePhoto);


    var secureStorage = new cordova.plugins.SecureStorage(
        function () {
            console.log('SecureStorage init success');
            secureStorage.get(
                'private_key',
                function (value) {
                    console.log('Cheia există deja: ', value);
                },
                function (error) {
                    console.log('Cheia nu există, generăm și stocăm una nouă.');
                    generateAndStorePrivateKey(secureStorage);
                }
            );
        },
        function (error) { console.log('SecureStorage init error', error); },
        'my_secure_storage'
    );

}

function generateAndStorePrivateKey(secureStorage) {
    var rsaKeypair = KEYUTIL.generateKeypair("RSA", 2048);
    var privateKey = rsaKeypair.prvKeyObj;
    var privateKeyPEM = KEYUTIL.getPEM(privateKey, "PKCS8PRV");

    secureStorage.set(
        function () { console.log('Cheia privată a fost stocată cu succes.'); },
        function (error) { console.error('Eroare la stocarea cheii', error); },
        'private_key', privateKeyPEM
    );
}

function signImage(privateKeyPEM, imageData, callback) {
    var rsa = new RSAKey();
    rsa.readPrivateKeyFromPEMString(privateKeyPEM);
    var hashAlg = 'sha256';
    var signature = rsa.signString(imageData, hashAlg); // Semnează direct string-ul
    var signatureB64 = hextob64(signature); // Convertește semnătura în Base64
    callback(signatureB64);
}


function savePhotoData(uri, latitude, longitude, signature) {
    db.transaction(function (tx) {
        tx.executeSql('INSERT INTO Photos (uri, latitude, longitude, signature) VALUES (?, ?, ?, ?)', [uri, latitude, longitude, signature]);
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
        //saveToPhotoAlbum: true,
        correctOrientation: true
    });
}

function onPhotoSuccess(imageURI) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var imageBase64 = imageURI.split(',')[1];
        var imageData = base64ToArrayBuffer(imageBase64); // Convertim direct în ArrayBuffer

        secureStorage.get('private_key', function (privateKeyPEM) {
            signImage(privateKeyPEM, imageData, function (signatureB64) {
                savePhotoData(imageURI, position.coords.latitude, position.coords.longitude, signatureB64);
            });
        }, function (error) {
            console.log('Error retrieving private key', error);
        });
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

            for (var i = 0; i < results.rows.length; i++) {
                var photo = results.rows.item(i);
                var imgElement = document.createElement('img');
                imgElement.src = "data:image/jpeg;base64," + photo.uri;
                imgElement.className = "photo-thumbnail";

                var caption = document.createElement('div');
                caption.innerText = "Latitude: " + photo.latitude + ", Longitude: " + photo.longitude;

                var signatureElement = document.createElement('div');
                signatureElement.innerText = "Signature: " + photo.signature;

                photoContainer.appendChild(imgElement);
                photoContainer.appendChild(caption);
                photoContainer.appendChild(signatureElement);
            }
        }, function (tx, error) {
            console.log('SELECT error: ', error.message);
        });
    });
}

*/
// Assumes Cordova and plugins are properly set up in your project

/*
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready');
    setupEventListeners();
    checkForPrivateKey();
}

function setupEventListeners() {
    document.getElementById('take-photo-btn').addEventListener('click', takePhoto);
}

function checkForPrivateKey() {
    withSecureStorage((secureStorage) => {
        secureStorage.get(
            () => console.log('Private key already exists.'),
            (error) => {
                if (error.code === 2) {
                    console.log('Private key does not exist, generating a new one.');
                    generateAndStorePrivateKey(secureStorage);
                } else {
                    console.error('Error accessing secure storage', error);
                }
            },
            'private_key'
        );
    });
}

function withSecureStorage(callback) {
    new cordova.plugins.SecureStorage(
        (secureStorage) => callback(secureStorage),
        (error) => console.error('SecureStorage init error', error),
        'my_secure_storage'
    );
}

function generateAndStorePrivateKey(secureStorage) {
    var rsaKeypair = KEYUTIL.generateKeypair('RSA', 1024);
    var privateKeyPEM = KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS8PRV").trim();
    console.log(privateKeyPEM)
    secureStorage.set(
        () => console.log('Private key stored successfully.'),
        (error) => console.error('Error storing private key', error),
        'private_key',
        privateKeyPEM
    );
}

function takePhoto() {
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true
    });
}

function onPhotoSuccess(imageData) {
    displayImage(imageData);
    signAndDisplayImage(imageData);
}

function displayImage(imageData) {
    var imgElement = document.createElement('img');
    imgElement.src = "data:image/jpeg;base64," + imageData;
    document.getElementById('photo-container').appendChild(imgElement);
}

function signAndDisplayImage(imageData) {
    withSecureStorage((secureStorage) => {
        secureStorage.get(
            (privateKeyPEM) => {
                var signatureBase64 = signImageData(imageData, privateKeyPEM);
                displaySignature(signatureBase64);
            },
            (error) => console.error('Error retrieving private key', error),
            'private_key'
        );
    });
}

function signImageData(imageData, privateKeyPEM) {
    var rsa = new RSAKey();
    rsa.readPrivateKeyFromPEMString(privateKeyPEM);
    var signatureHex = rsa.signString(imageData, 'sha256');
    return hextob64(signatureHex);
}

function displaySignature(signatureBase64) {
    var signatureElement = document.createElement('div');
    signatureElement.innerText = `Signature: ${signatureBase64}`;
    document.getElementById('photo-container').appendChild(signatureElement);
}

function onPhotoFail(message) {
    alert('Failed to capture photo: ' + message);
}

function onGeoError(error) {
    alert('Failed to get GPS location: ' + error.message);
}
*/

//                                          BROWSER
/*
document.addEventListener('DOMContentLoaded', onDocumentReady, false);

function onDocumentReady() {
    // Set up event listeners after the DOM content has loaded
    document.getElementById('take-photo-btn').addEventListener('click', takePhoto);
    checkForPrivateKey();
}

function checkForPrivateKey() {
    if (localStorage.getItem('private_key')) {
        console.log('Private key already exists.');
    } else {
        console.log('Private key does not exist, generating a new one.');
        generateAndStorePrivateKey();
    }
}

function generateAndStorePrivateKey() {
    // Use jsrsasign library to generate a key pair and store in localStorage
    var rsaKeypair = KEYUTIL.generateKeypair('RSA', 2048);
    var privateKeyPEM = KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS8PRV").trim();
    localStorage.setItem('private_key', privateKeyPEM);
    console.log('Private key stored successfully.');
}

function takePhoto() {
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true
    });
}

function onPhotoSuccess(imageData) {
    displayImage(imageData);
    signAndDisplayImage(imageData);
}

function displayImage(imageData) {
    var imgElement = document.createElement('img');
    imgElement.src = "data:image/jpeg;base64," + imageData;
    document.getElementById('photo-container').appendChild(imgElement);
}

function signAndDisplayImage(imageData) {
    var privateKeyPEM = localStorage.getItem('private_key');
    if (privateKeyPEM) {
        var signatureBase64 = signImageData(imageData, privateKeyPEM);
        displaySignature(signatureBase64);
    } else {
        console.error('Private key not found in local storage');
    }
}

function signImageData(imageData, privateKeyPEM) {
    // Instantiate RSA key
    var rsa = new RSAKey();
    rsa.readPrivateKeyFromPEMString(privateKeyPEM);

    var signatureHex = rsa.sign(imageData, 'sha256');
    var signatureBase64 = hextob64(signatureHex);
    console.log(signatureBase64)
    return signatureBase64;
}


function displaySignature(signatureBase64) {
    var signatureElement = document.createElement('div');
    signatureElement.innerText = `Signature: ${signatureBase64}`;
    document.getElementById('photo-container').appendChild(signatureElement);
}

function onPhotoFail(message) {
    alert('Failed to capture photo: ' + message);
}

function onGeoError(error) {
    alert('Failed to get GPS location: ' + error.message);
}*/


document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    document.getElementById('take-photo-btn').addEventListener('click', onPhotoSuccess);
    saveToSecureStorage();
    let image2 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIALEAvAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EAD8QAAEDAgMFAgoJBAIDAAAAAAEAAgMEERIhMQUTIkFRYXEGMkJSgZGSobHwFCNTVGJy0eHxM2OTwYKiFRZD/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAECAwQFBv/EACgRAAICAQMDAgcBAAAAAAAAAAABAhEDBBIhIjFBE1EFFBUjMkJSYv/aAAwDAQACEQMRAD8A8efE5hThzrLYkYJQCyZjvwusCgJYH4ja3oK1Ts6MmJw7dimNuEh3ar3hrnh2G2IKDXOHC7kpXVkLhF8dNljc5rG8r6lQmGOIlujTooxBwJIxWKIbFiacDs+eSk2S3KkqMuTLPopwHDJiPMIh9P4uLXNQjYGPz05p0YOLTLpqcxkO5OFwoOn4Q0a80c2ojNPuJPHYbxu6jos0sxyHuQmazSX4j6EHqj4m7yFzehVDYrxx25oqma7GCzyAQUMrEmAyRYAe9SqQxwu13EQLouVrgJA9vaUC9vm6ITFOO0gxWvbiZfoqW5komPiYW9AmZx54BJdAq7Il8eSpc3NNGckKPMgdqnIxKAZlPIc1QvBWFCQZqwDNM4ZoEVvHCEwbcXUyM1a2FxGTchkglF74MB4RiCcPwgjDZE1DOFVmmxNBZrzWdo73B30grW4nHiUt266vihcx6Idh56osUcVrkVJSB7eJCzsLbOZ1sjXu3haWchYq5tKC0OOYPLoldGyxqS2xRltcGeMMjy5gpSMLnXa06c1p1NJG1gHkuyHego8QvE7FhBTsiWOUeGCFjrrQo6RpGKS1ueLVXQUzHkX0vmlWyGHHC3MWtfsPJLuOONQ6pAhc6F7ozhLWmzSEdslwbO6U3sRY6j1KFJAa1zWDJx0HL50VlYwQ1O5iOUTSHnqTqiXPBpCLX3EQqA1x8oMBNuru9BGK0n4VqtgY+IcSz5xhls3QFJew88X+T8gckWF5cdOSlHwC/VaG6Y+iAOoJ+KFMLmeN4qpOznniceUQY3FGShJmrTiw4D3ICqF3JozyR6bIRDgPcq3nNWE4WWUGtxOB7VZz2Tw2ZfqoFWyZtA6KohMTQzBmO9ExzBrAB6e9DHRRQF0adsZVsDLkg8lTTO+sz6c1cXEOJbyWLPRi0+QuOLGLHUfBDTMwvI1TxyPa4OGK90QRvfzKLOilOPHcaNv1WWWWidkro3kHS2asEbmHPSyjhbKQ0MzTTL2NVXcqvJI/AddWouko2yvcZRm1t8+aplY6GQcN8tByV7Z8TRhdZzcyESb8DxqO7q7ghJdM9zhgBcVXPFhBcGajxloT0+IucNHm+XXsUHQXp7cWRSUglgbsCppt0MTPGGa0JGioa2ctsZBZ3ehoqVodcOzKMo5hCC0+KTm0626qpPyLDFrpn2K6eKQMc1hvbkh5KRxBdq6+i1ZmZExWwFpI70FSNE0hLtWix6qU/Jpkgn0AsLWh74ag4b6Kmpx4rOFwMj3dVp1VHE+Z"
    displayImage(image2);
}

function saveToSecureStorage() {
    var ss = new cordova.plugins.SecureStorage(
        function () { console.log('Success'); },
        function (error) { console.log('Error', error); },
        'my_secure_storage'
    );
    let rsaKeypair = KEYUTIL.generateKeypair('RSA', 2048);
    let privateKeyPEM = KEYUTIL.getPEM(rsaKeypair.prvKeyObj, "PKCS8PRV");
    let publicKeyPEM = KEYUTIL.getPEM(rsaKeypair.pubKeyObj);

    console.log(privateKeyPEM, publicKeyPEM)
    ss.set(
        function (key) { console.log('Set ' + key); },
        function (error) { console.log('Error ' + error); },
        'mykey',
        privateKeyPEM
    );
    ss.set(
        function (key) { console.log('Public key set'); },
        function (error) { console.log('Error setting public key', error); },
        'publicKey',
        publicKeyPEM
    );
}


function takePhoto() {
    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true
    });
}

function onPhotoSuccess(imageData) {
    console.log(imageData)
    const image2 = "data:image/jpeg;base64,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"
    displayImage(image2);
    signAndDisplayImage(image2);
}

function displayImage(imageData) {
    var imgElement = document.createElement('img');
    imgElement.src = imageData;
    document.getElementById('photo-container').appendChild(imgElement);
}

function signAndDisplayImage(imageData) {
    var ss = new cordova.plugins.SecureStorage(
        function () { console.log('Success'); },
        function (error) { console.log('Error', error); },
        'my_secure_storage'
    );

    ss.get(
        (privateKeyPEM) => {
            var signatureBase64 = signImageData(imageData, privateKeyPEM);
            displaySignature(signatureBase64);

            ss.get(
                function (publicKeyPEM) {
                    var isValidSignature = verifySignature(imageData, signatureBase64, publicKeyPEM);
                    displayVerificationResult(isValidSignature);
                },
                function (error) { console.error('Error retrieving public key', error); },
                'publicKey'
            );
        },
        (error) => console.error('Error retrieving private key', error),
        'mykey'
    );
}

function signImageData(imageData, privateKeyPEM) {
    var signature = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    signature.init(privateKeyPEM);
    signature.updateString(imageData);
    var signatureHex = signature.sign();
    return hextob64(signatureHex);
}


function displaySignature(signatureBase64) {
    var signatureElement = document.createElement('div');
    signatureElement.innerText = `Signature: ${signatureBase64}`;
    document.getElementById('photo-container').appendChild(signatureElement);
}

function verifySignature(imageData, signatureBase64, publicKeyPEM) {
    var signature = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    signature.init(publicKeyPEM);
    signature.updateString(imageData);

    var signatureHex = b64tohex(signatureBase64);

    return signature.verify(signatureHex);
}

function displayVerificationResult(isValidSignature) {
    var verificationElement = document.getElementById('verificationResult');
    if (!verificationElement) {
        verificationElement = document.createElement('div');
        verificationElement.id = 'verificationResult';
        document.getElementById('photo-container').appendChild(verificationElement);
    }

    verificationElement.innerText = isValidSignature ? 'Signature is valid.' : 'Signature is NOT valid.';
}

function onPhotoFail(message) {
    alert('Failed to capture photo: ' + message);
}

function onGeoError(error) {
    alert('Failed to get GPS location: ' + error.message);
}