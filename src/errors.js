(function () {
  function fail(message) {
    const el = document.getElementById("startup");
    if (el) {
      el.hidden = false;
      el.textContent =
        "The 3D kitchen could not start. " +
        message +
        " Try Chrome or Edge with hardware acceleration enabled.";
    }
  }
  window.addEventListener(
    "error",
    (e) => fail(e.message || "A local script failed to load."),
    true,
  );
  window.addEventListener("unhandledrejection", (e) => fail(String(e.reason)));
  window.fridgeFail = fail;
  setTimeout(() => {
    if (!window.fridgeReady) fail("Rendering is taking longer than expected.");
  }, 15000);
})();
