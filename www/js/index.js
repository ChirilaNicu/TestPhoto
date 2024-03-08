
const app = {
    tempURL: null,
    permFolder: null,
    oldFile: null,
    permFile: null,
    KEY: "OLDfileNAMEkey",
    init: () => {
        setTimeout(function () {
            console.log("File system/plugin is ready");
            app.addListeners();
            //create the folder where we will save files
            app.getPermFolder();
        }, 2000);
    },
    addListeners: () => {
        document.getElementById("btnCam").addEventListener("click", app.takePic);
        document.getElementById("btnFile").addEventListener("click", app.copyImage);
    },
    getPermFolder: () => {
        let path = cordova.file.dataDirectory;
        //save the reference to the folder as a global app property
        resolveLocalFileSystemURL(
            path,
            dirEntry => {
                //create the permanent folder
                dirEntry.getDirectory(
                    "images",
                    { create: true },
                    permDir => {
                        app.permFolder = permDir;
                        console.log("Created or opened", permDir.nativeURL);
                        //check for an old image from last time app ran
                        app.loadOldImage();
                    },
                    err => {
                        console.warn("failed to create or open permanent image dir");
                    }
                );
            },
            err => {
                console.warn("We should not be getting an error yet");
            }
        );
    },
    loadOldImage: () => {
        //check localstorage to see if there was an old file stored
        let oldFilePath = localStorage.getItem(app.KEY);
        //if there was an old file then load it into the imgFile
        if (oldFilePath) {
            resolveLocalFileSystemURL(
                oldFilePath,
                oldFileEntry => {
                    app.oldFileEntry = oldFileEntry;
                    let img = document.getElementById("imgFile");
                    img.src = oldFileEntry.nativeURL;
                },
                err => {
                    console.warn(err);
                }
            );
        }
    },
    takePic: ev => {
        ev.preventDefault();
        ev.stopPropagation();
        let options = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth: 400,
            targetHeight: 400
        };
        console.log(options);
        navigator.camera.getPicture(app.gotImage, app.failImage, options);
    },
    gotImage: uri => {
        app.tempURL = uri;
        document.getElementById("imgCamera").src = uri;
    },
    failImage: err => {
        console.warn(err);
    },
    copyImage: ev => {
        ev.preventDefault();
        ev.stopPropagation();
        //copy the temp image to a permanent location
        let fileName = Date.now().toString() + ".jpg";

        resolveLocalFileSystemURL(
            app.tempURL,
            entry => {
                //we have a reference to the temp file now
                console.log(entry);
                console.log("copying", entry.name);
                console.log(
                    "copy",
                    entry.name,
                    "to",
                    app.permFolder.nativeURL + fileName
                );
                //copy the temp file to app.permFolder
                entry.copyTo(
                    app.permFolder,
                    fileName,
                    permFile => {
                        //the file has been copied
                        //save file name in localstorage
                        let path = permFile.nativeURL;
                        localStorage.setItem(app.KEY, path);
                        app.permFile = permFile;
                        console.log(permFile);
                        console.log("add", permFile.nativeURL, "to the 2nd image");
                        document.getElementById("imgFile").src = permFile.nativeURL;
                        //delete the old image file in the app.permFolder
                        if (app.oldFile !== null) {
                            app.oldFile.remove(
                                () => {
                                    console.log("successfully deleted old file");
                                    //save the current file as the old file
                                    app.oldFile = permFile;
                                },
                                err => {
                                    console.warn("Delete failure", err);
                                }
                            );
                        }
                    },
                    fileErr => {
                        console.warn("Copy error", fileErr);
                    }
                );
            },
            err => {
                console.error(err);
            }
        );
    }
};
const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
document.addEventListener(ready, app.init);