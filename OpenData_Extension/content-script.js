
// let url = document.location.href;
//
// //idea: send the current chosen dataset url to server, and run this code in the server
// if (url.includes("https://opendata.hawaii.gov/dataset/") && url.includes("resource") == false){
//
//   let data_id = '';
//   if (url.includes("https://opendata.hawaii.gov/dataset/")){
//     //find the data id with csv file
//     let resources = document.getElementsByClassName("resource-item");
//     for (let i = 0; i < resources.length; i++) {
//       let heading = resources[i].querySelector('.heading');
//       let title = heading.getAttribute('title');
//       if (title.toLowerCase().includes('csv')) {
//         data_id = resources[i].getAttribute('data-id');
//       }
//     }
//
//     //go to csv link
//     url = `${url}/resource/${data_id}`;
//     window.location.assign(url);
//   }
// }
//
// //get csv file download
// let download_link_items = document.getElementsByClassName("resource-url-analytics");
// let download_link = download_link_items[1].getAttribute('title').toString();
// console.log(download_link);




