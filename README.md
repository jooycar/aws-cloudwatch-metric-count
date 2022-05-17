# aws-cloudwatch-metric-count

To run the script, clone the repo and then run the following:

    npm install
    node index.js

Provided your environment has proper AWS credentials (for example [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)) set and permissions to Cloudwatch [`listMetrics`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#listMetrics-property) and [`getMetricStatistics`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#getMetricStatistics-property)

If your account has a large number of metrics, you may need to increase the maximum memory Node can use.  As an example, to increase the limit to 8GB:

    node --max-old-space-size=8192 index.js

FYI: this repo is under GitHub's CodeQL beta testing
