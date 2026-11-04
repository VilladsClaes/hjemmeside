// Avatar-værksted: byg en lille avatar (ansigt + tilbehør + baggrundsfarve)
// og hent den som et rigtigt PNG-billede. Alt tegnes og eksporteres lokalt
// via <canvas> — intet sendes til eller gemmes på nogen server.
(function () {
  "use strict";

  var builder = document.querySelector(".avatar-builder");
  if (!builder) return;

  var canvas = builder.querySelector(".avatar-canvas");
  var status = builder.querySelector(".avatar-status");
  var downloadButton = builder.querySelector(".avatar-download");
  var ctx = canvas.getContext && canvas.getContext("2d");

  if (!ctx) {
    if (status) status.textContent = "Canvas understøttes ikke i denne browser.";
    if (downloadButton) downloadButton.disabled = true;
    return;
  }

  var size = canvas.width; // kvadratisk canvas (512x512)

  function valgt(navn) {
    var input = builder.querySelector('input[name="' + navn + '"]:checked');
    return input || null;
  }

  function tegn() {
    var face = valgt("avatar-face");
    var accessory = valgt("avatar-accessory");
    var color = valgt("avatar-color");
    if (!face || !color) return;

    ctx.clearRect(0, 0, size, size);

    var baggrund = color.value;
    if (baggrund) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
      ctx.fillStyle = baggrund;
      ctx.fill();
      ctx.restore();
    }

    var emojiFont = "'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = Math.round(size * 0.56) + "px " + emojiFont;
    ctx.fillText(face.value, size / 2, size / 2 + size * 0.02);

    if (accessory && accessory.value) {
      ctx.font = Math.round(size * 0.22) + "px " + emojiFont;
      ctx.fillText(accessory.value, size * 0.78, size * 0.24);
    }

    var faceName = face.dataset.name;
    var accessoryName = accessory ? accessory.dataset.name : "Intet";
    var colorName = color.dataset.name;
    status.textContent = faceName
      + (accessory && accessory.value ? " med " + accessoryName.toLocaleLowerCase("da") : " uden tilbehør")
      + " på " + colorName.toLocaleLowerCase("da") + " baggrund"
      + " — klar til at blive hentet.";
  }

  builder.addEventListener("change", tegn);

  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      canvas.toBlob(function (blob) {
        if (!blob) {
          status.textContent = "Billedet kunne ikke hentes — prøv igen.";
          return;
        }
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "min-avatar.png";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        status.textContent = "Din avatar er hentet som min-avatar.png.";
      }, "image/png");
    });
  }

  tegn();
})();
