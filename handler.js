'use strict';
const aws = require('aws-sdk')
const db = new aws.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
// const uuid = require('uuid/v4')

const deliveryTable = process.env.DELIVERY_TABLE
//Create a response
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  }
}

function sortByDate(a, b) {
  if (a.createdAt > b.createdAt) {
    return -1
  } else {
    return 1
  }
}

/*
..######..########..########....###....########.########....########..########.##.......####.##.....##.########.########..####.########..######.
.##....##.##.....##.##.........##.##......##....##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.......##....##
.##.......##.....##.##........##...##.....##....##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.......##......
.##.......########..######...##.....##....##....######......##.....##.######...##........##..##.....##.######...########...##..######....######.
.##.......##...##...##.......#########....##....##..........##.....##.##.......##........##...##...##..##.......##...##....##..##.............##
.##....##.##....##..##.......##.....##....##....##..........##.....##.##.......##........##....##.##...##.......##....##...##..##.......##....##
..######..##.....##.########.##.....##....##....########....########..########.########.####....###....########.##.....##.####.########..######.
*/
module.exports.createDelivery = (event, context, callback) => {
  const reqBody = JSON.parse(event.body)


  const delivery = {
    userID: reqBody.userID,
    tipAmount: reqBody.tipAmount,
    address: reqBody.address,
    locationId: reqBody.locationId,
    id: reqBody.id,
    isFinished: reqBody.isFinished,
    tripId: reqBody.tripId,
    date: reqBody.date,
    latitude: reqBody.latitude,
    longitude: reqBody.longitude
  }

  return db.put({
    TableName: deliveryTable,
    Item: delivery
  }).promise().then(() => {
    callback(null, response(201, delivery))
  }).catch(err => response(null, response(err.statusCode, err)))
}

/*
..######...########.########.......###....##.......##..........########..########.##.......####.##.....##.########.########..####.########..######.
.##....##..##..........##.........##.##...##.......##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.......##....##
.##........##..........##........##...##..##.......##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.......##......
.##...####.######......##.......##.....##.##.......##..........##.....##.######...##........##..##.....##.######...########...##..######....######.
.##....##..##..........##.......#########.##.......##..........##.....##.##.......##........##...##...##..##.......##...##....##..##.............##
.##....##..##..........##.......##.....##.##.......##..........##.....##.##.......##........##....##.##...##.......##....##...##..##.......##....##
..######...########....##.......##.....##.########.########....########..########.########.####....###....########.##.....##.####.########..######.
*/
module.exports.getAllDeliveries = (event, context, callback) => {
  return db.scan({
    TableName: deliveryTable
  }).promise().then(res => {

    callback(null, response(200, res.Items))

  }).catch(err => callback(null, response(err.statusCode, err)))
}

/*
..######...########.########....########..########.##.......####.##.....##.########.########..####.########..######.
.##....##..##..........##.......##.....##.##.......##........##..##.....##.##.......##.....##..##..##.......##....##
.##........##..........##.......##.....##.##.......##........##..##.....##.##.......##.....##..##..##.......##......
.##...####.######......##.......##.....##.######...##........##..##.....##.######...########...##..######....######.
.##....##..##..........##.......##.....##.##.......##........##...##...##..##.......##...##....##..##.............##
.##....##..##..........##.......##.....##.##.......##........##....##.##...##.......##....##...##..##.......##....##
..######...########....##.......########..########.########.####....###....########.##.....##.####.########..######.
*/

module.exports.getDeliveries = (event, context, callback) => {
  const numberOfPosts = event.pathParameters.number
  const params = {
    TableName: deliveryTable
    ,
    Limit: numberOfPosts
  }
  return db.scan(params).promise().then(res => {
    callback(null, response(200, res.Items.sort(sortByDate)))
  }).catch(err => callback(null, response(err.statusCode, err)))
}


/*
..######...########.########.....######..####.##....##..######...##.......########....########..########.##.......####.##.....##.########.########..##....##
.##....##..##..........##.......##....##..##..###...##.##....##..##.......##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.
.##........##..........##.......##........##..####..##.##........##.......##..........##.....##.##.......##........##..##.....##.##.......##.....##...####..
.##...####.######......##........######...##..##.##.##.##...####.##.......######......##.....##.######...##........##..##.....##.######...########.....##...
.##....##..##..........##.............##..##..##..####.##....##..##.......##..........##.....##.##.......##........##...##...##..##.......##...##......##...
.##....##..##..........##.......##....##..##..##...###.##....##..##.......##..........##.....##.##.......##........##....##.##...##.......##....##.....##...
..######...########....##........######..####.##....##..######...########.########....########..########.########.####....###....########.##.....##....##...
*/

module.exports.getDelivery = (event, context, callback) => {
  console.log(event)
  const userID = event.pathParameters.userID
  const id = event.pathParameters.id

  // 7F982E1F - 7FCB - 487B - B4EB - 4384059CCF50
  var params = {
    ExpressionAttributeNames: {
      "#AT": "userID",
      "#ST": "tipAmount"
    },
    ExpressionAttributeValues: {
      ":a": userID
    },
    FilterExpression: "userID = :a",
    ProjectionExpression: "#ST, #AT",
    TableName: deliveryTable
  };
  return db.scan(params).promise()
    .then(res => {
      callback(null, response(200, res))
    }).catch(err => callback(null, response(err.statusCode, err)))
}

/*
.##.....##.########..########.....###....########.########....########..########.##.......####.##.....##.########.########..##....##
.##.....##.##.....##.##.....##...##.##......##....##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.
.##.....##.##.....##.##.....##..##...##.....##....##..........##.....##.##.......##........##..##.....##.##.......##.....##...####..
.##.....##.########..##.....##.##.....##....##....######......##.....##.######...##........##..##.....##.######...########.....##...
.##.....##.##........##.....##.#########....##....##..........##.....##.##.......##........##...##...##..##.......##...##......##...
.##.....##.##........##.....##.##.....##....##....##..........##.....##.##.......##........##....##.##...##.......##....##.....##...
..#######..##........########..##.....##....##....########....########..########.########.####....###....########.##.....##....##...
*/


module.exports.updateDelivery = (event, context, callback) => {
  const id = event.pathParameters.id
  console.log("HERE IT IS", event)
  const userID = event.pathParameters.userID
  const body = JSON.parse(event.body)
  const address = body.address
  const date = body.date
  const isFinished = body.isFinished
  const locationId = body.locationId
  const tipAmount = body.tipAmount
  const tripId = body.tripId
  const latitude = body.latitude
  const longitude = body.longitude


  const params = {
    Key: {
      userID: userID,
      id: id
    },
    TableName: deliveryTable
    ,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'set address = :a, isFinished = :f, locationId = :l, tipAmount = :t, tripId = :p, latitude = :i, longitude =:g',
    ExpressionAttributeValues: {
      ':a': address,
      ':f': isFinished,
      ':l': locationId,
      ':t': tipAmount,
      ':p': tripId,
      ':i': latitude,
      ':g': longitude
    },
    ReturnValue: 'ALL_NEW'
  }
  return db.update(params)
    .promise()
    .then(res => {
      callback(null, response(200, res))
    }).catch(err => callback(null, response(err.statusCode, err)))
}

/*
.########..########.##.......########.########.########....########..########.##.......####.##.....##.########.########..##....##
.##.....##.##.......##.......##..........##....##..........##.....##.##.......##........##..##.....##.##.......##.....##..##..##.
.##.....##.##.......##.......##..........##....##..........##.....##.##.......##........##..##.....##.##.......##.....##...####..
.##.....##.######...##.......######......##....######......##.....##.######...##........##..##.....##.######...########.....##...
.##.....##.##.......##.......##..........##....##..........##.....##.##.......##........##...##...##..##.......##...##......##...
.##.....##.##.......##.......##..........##....##..........##.....##.##.......##........##....##.##...##.......##....##.....##...
.########..########.########.########....##....########....########..########.########.####....###....########.##.....##....##...
*/
module.exports.deleteDelivery = (event, context, callback) => {
  const id = event.pathParameters.id
  const userID = event.pathParameters.userID
  const params = {
    Key: {
      userID: userID,
      id: id
    },
    TableName: deliveryTable

  }
  return db.delete(params)
    .promise()
    .then(() => callback(null, response(200, { message: 'Post deleted successfully' })))
    .catch(err => callback(null, response(err.statusCode, err)))
}



/* This example scans the entire Music table, and then narrows the results to songs by the artist "No One You Know". For each item, only the album title and song title are returned. */

// var params = {
//   ExpressionAttributeNames: {
//     "#AT": "id",
//     "#ST": "tipAmount"
//   },
//   ExpressionAttributeValues: {
//     ":a": userID
//   },
//   FilterExpression: "userID = :a",
//   ProjectionExpression: "#ST, #AT",
//   TableName: deliveryTable
// };
// dynamodb.scan(params, function (err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else console.log(data);           // successful response
//   /*
//   data = {
//    ConsumedCapacity: {
//    }, 
//    Count: 2, 
//    Items: [
//       {
//      "AlbumTitle": {
//        S: "Somewhat Famous"
//       }, 
//      "SongTitle": {
//        S: "Call Me Today"
//       }
//     }, 
//       {
//      "AlbumTitle": {
//        S: "Blue Sky Blues"
//       }, 
//      "SongTitle": {
//        S: "Scared of My Shadow"
//       }
//     }
//    ], 
//    ScannedCount: 3
//   }
//   */
// });



/*
..######...######.....###....##....##
.##....##.##....##...##.##...###...##
.##.......##........##...##..####..##
..######..##.......##.....##.##.##.##
.......##.##.......#########.##..####
.##....##.##....##.##.....##.##...###
..######...######..##.....##.##....##
*/
// module.exports.getPost = (event, context, callback) => {
//   const id = event.pathParameters.id;

//   // const params = {
//   //   Key: {
//   //     id: id
//   //   },
//   //   TableName: postsTable
//   // }
  // var params = {
  //   TableName: postsTable,
  //   ProjectionExpression: "userID",
  //   FilterExpression: "title between :letter1 and :letter2",
  //   // ExpressionAttributeNames: {
  //   //   "#yr": "year"
  //   // },
  //   ExpressionAttributeValues: {
  //     ":userID": userID,
  //     // ":letter1": "5",
  //     // ":letter2": "7"
  //   }
  // };
//   return db.scan(params).promise().then(res => {

//     if (res.Item) callback(null, response(200, res.Item))
//     // { error: 'Post Not Found' }
//     else callback(null, response(404, res))
//   })
//     .catch(err => callback(null, response(err.statusCode, err)))
// }
