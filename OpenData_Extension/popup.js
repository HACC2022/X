
async function getCurrentTabURL() {
  let tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  return tabs[0].url;
}

(async () => {
  let url = await getCurrentTabURL();
  if (url.includes("https://opendata.hawaii.gov/dataset/")){

    // Redirect to server to creat graph
    // chrome.tabs.create({url: "https://www.youtube.com"});
  }
  else {
    alert(
      "Feature is disabled. Please go to https://opendata.hawaii.gov/dataset and choose a dat to use this tool.\n" +
      "For detail usage, please check the instruction page.");
  }
})();



