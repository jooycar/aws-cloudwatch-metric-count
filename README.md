# aws-cloudwatch-metric-count

To run it just type:

    node index.js

Provided your environment has proper AWS credentials (for example [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)) set and permissions to Cloudwatch [`listMetrics`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#listMetrics-property) and [`getMetricStatistics`](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#getMetricStatistics-property)

FYI: this repo is under GitHub's CodeQL beta testing