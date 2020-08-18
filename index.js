const AWS = require('aws-sdk')

// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create CloudWatch service object
const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })

async function main () {
  const metrics = await getMetrics(1)
  const sum = await getSum(metrics)
  for (const val of sum) {
    console.log(val)
  }
  return sum.length
}

async function getSum (metrics) {
  const sum = new Map()
  const promises = []
  for (const metric of metrics) {
    promises.push(getSingleSum(metric))
  }
  await Promise.all(promises).then(values => {
    console.log('len1: ' + values.length)
    for (const val of values) {
      if (val.Datapoints && val.Datapoints[0]) {
        if (sum.has(val.Label)) {
          sum.set(val.Label, sum.get(val.Label) + val.Datapoints[0].SampleCount)
        } else {
          sum.set(val.Label, val.Datapoints[0].SampleCount)
        }
      }
    }
    console.log('len2: ' + sum.size)
  })
  return sum
}
const today = new Date()
const aWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

async function getSingleSum (metric) {
  const params = { Statistics: ['SampleCount'], StartTime: aWeekAgo, EndTime: today, Period: 60 * 60 * 24 * 7, Namespace: metric.Namespace, Dimensions: metric.Dimensions, MetricName: metric.MetricName }
  return cloudwatch.getMetricStatistics(params).promise()
}

async function getMetrics (count, token) {
  console.log(count)
  var params = {}
  if (token) {
    params.NextToken = token
  }
  const metrics = []
  const data = await cloudwatch.listMetrics(params).promise()
  if (data && data.Metrics) {
    metrics.push(...data.Metrics)
    if (data.NextToken) {
      metrics.push(...await getMetrics(count + 1, data.NextToken))
    }
  }
  return metrics
}

main()
  .then(data => { console.log(`data: ${data}`) })
  .catch(err => { console.error(`error: ${err}`) })
