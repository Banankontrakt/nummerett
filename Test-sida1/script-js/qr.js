let qrcode = new QRCode(document.querySelector(".qrcode"));

qrcode.makeCode("Why did you scan me?");

function generateQr() {
    const inputValue = document.querySelector("input").value.trim(); // Trim to remove spaces
    if (inputValue === "") {
        alert("Input Field Is Empty");
    } else {
        qrcode.makeCode(inputValue); // Pass the value of the input field
    }
}
