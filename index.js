const AWS = require('aws-sdk')

// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create CloudWatch service object
const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })

var listParams = {}
cloudwatch.listMetrics(listParams, function (err, data) {
  if (err) console.log(err, err.stack)
  else {
    // fix: max items =500
    console.log(`Total metrics: ${data.Metrics.length}`)
    const namespaces = new Set()
    for (const metric of data.Metrics) {
      if (!namespaces.has(metric.Namespace)) {
        namespaces.add(metric.Namespace)
      }
    }
    console.log(`Total namespaces: ${namespaces.size}`)
    for (const ns of namespaces) {
      listParams = { Namespace: ns }
      // 500 limit again
      cloudwatch.listMetrics(listParams, function (err, data) {
        if (err) { console.log(err, err.stack) } else {
          // console.log(`Namespace ${ns}: ${data.Metrics.length} metrics`)
          countAllMetrics(ns, data.Metrics)
        }
      })
    }
  }
})

function countAllMetrics (ns, metrics) {
  const today = new Date()
  const aWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  let count = 0
  for (const metric of metrics) {
    const params = {
      Namespace: metric.Namespace,
      MetricName: metric.MetricName,
      StartTime: aWeekAgo,
      EndTime: today,
      Period: 60 * 60 * 24 * 30,
      Statistics: [
        'SampleCount'

      ]
    }
    cloudwatch.getMetricStatistics(params, function (err, data) {
      if (err) { console.log(err) } else {
         //console.log(data)
        if (data.Datapoints) {
           //  console.log(data.Datapoints)
          for (const point of data.Datapoints) {
            // console.log("in for")
            // console.log(point)
            // console.log(point.SampleCount)
            console.log(`${ns} \t ${point.SampleCount}`)
            //count = count + point.SampleCount
          }
        }
        //console.log(`${metric.MetricName} => ${count}`)
      }
    })
    //console.log(`${ns} => ${count}`)
}
  
}
