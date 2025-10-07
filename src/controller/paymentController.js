// var express = require('express');
// var checksum = require('./checksum');
// var response = require('./response');
// const transacturl = require('./config');
// var router = express.Router();
// var axios = require('axios');

// router.post('/transact', async function(req, res, next) {
//     const id = `OID${Date.now()}`
//     const data = {
//         amount: 2 *100,
//         firstName: "Waleed Shaikh",
//         buyerEmail: "codesense24@gmail.com",
//         currency: "INR",
//         merchantIdentifier: "fb2016ffd3a64b2994a6289dc2b671a4",
//         orderId: `ORID${Date.now()}`,
//         returnUrl: "https://kvgvq91d-5001.inc1.devtunnels.ms/api/status"
//     }

//     var checksumstring = checksum.getChecksumString(data);
//     var calculatedchecksum = checksum.calculateChecksum(checksumstring);
//     var url = transacturl.merchantInfo.transactApi;

//     return res.status(200).send({
//          url: url,
//          checksum: calculatedchecksum,
//          data: data
//      })
// });
  
//   // Function to get error message based on error code


// router.post('/status', async function(req, res, next) {
//     try {
//         console.log(req.body)

//         console.log("Message: " + response.getResponseCodes(req.body.responseCode))
//         if(req.body.responseCode == 100){
//             return res.redirect(`http://localhost:3001/success?id=${req.body.orderId}&checksum=${req.body.checksum}`);
//         } else {
//             return res.redirect(`http://localhost:3001/failure?id=${req.body.orderId}&checksum=${req.body.checksum}`);
//         }
//     } catch (error) {
//         console.log(error)
//     }
// });

// module.exports = router;
