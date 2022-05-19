const AWS = require('aws-sdk')
const promiseUtils = require('blend-promise-utils')

// Set the region
AWS.config.update({ region: 'us-east-1' })

const DEBUG = false

// Create CloudWatch service object
const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })

async function main () {
  let iteration = 1
  let { metrics, nextToken } = await getMetrics(iteration)
  while (nextToken !== undefined) {
    const { metrics: curMetrics, nextToken: curToken } = await getMetrics(++iteration, nextToken)
    nextToken = curToken
    metrics.push(...curMetrics)
    if (DEBUG) {
      break
    }
  }
  const sum = await getSum(metrics)
  const sorted = new Map([...sum.entries()].sort((a, b) => b[1] - a[1]))
  for (const [key, value] of sorted.entries()) {
    console.log(`${key}: ${value}`)
  }
  return sorted.size
}

async function getSum (metrics) {
  const sum = new Map()
  console.log('Getting Sample Counts')
  let i = 0
  const rawSampleCounts = await promiseUtils.mapLimit(metrics, 25, async (metric) => {
    i++
    if (i % 1000 === 0) {
      console.log(`Successfully retrieved ${i} sample counts`)
    }
    try {
      return await getSingleSum(metric)
    } catch (err) {
      console.log(`Received an error for a request ${JSON.stringify(err)}`)
      return undefined
    }
  })
  const sampleCounts = rawSampleCounts.filter(x => x !== undefined)
  console.log('total metrics: ' + sampleCounts.length)
  for (const sampleCount of sampleCounts) {
    if (sampleCount.Datapoints && sampleCount.Datapoints[0]) {
      if (sum.has(sampleCount.Label)) {
        sum.set(sampleCount.Label, sum.get(sampleCount.Label) + sampleCount.Datapoints[0].SampleCount)
      } else {
        sum.set(sampleCount.Label, sampleCount.Datapoints[0].SampleCount)
      }
    }
  }
  console.log('total de-duplicated metrics: ' + sum.size)
  return sum
}
const today = new Date()
const aWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

async function getSingleSum (metric) {
  const params = { Statistics: ['SampleCount'], StartTime: aWeekAgo, EndTime: today, Period: 60 * 60 * 24 * 7, Namespace: metric.Namespace, Dimensions: metric.Dimensions, MetricName: metric.MetricName }
  return cloudwatch.getMetricStatistics(params).promise()
}

async function getMetrics (count, token) {
  console.log(`Iteration #${count}, ${500 * (count - 1)} metrics`)
  const params = {}
  if (token) {
    params.NextToken = token
  }
  const metrics = []
  const data = await cloudwatch.listMetrics(params).promise()
  if (data && data.Metrics) {
    metrics.push(...data.Metrics)
  }
  return {
    metrics,
    nextToken: data.NextToken
  }
}

main()
  .then(data => { console.log(`total: ${data} metrics`) })
  .catch(err => { console.error(`error: ${err}`) })
