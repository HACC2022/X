chrome.identity.getProfileUserInfo(function(info) { email = info.email; });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse( {email: email})
});