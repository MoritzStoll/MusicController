let loading = document.getElementById("loading");
let mainScreen = document.getElementById("mainScreen");

function stopLoading() {
  loading.style.opacity = 0;
  setTimeout(() => {
    loading.style.visibility = "hidden";
  }, 500);
}
