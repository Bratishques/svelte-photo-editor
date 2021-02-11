import * as faceapi from "face-api.js"
faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models")

export default faceapi