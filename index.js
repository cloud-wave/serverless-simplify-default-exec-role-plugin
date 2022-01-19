'use strict';

const policyStatements = [{
  Effect: 'Allow',
  Action: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:PutLogEvents'],
  Resource: [
    {
      'Fn::Sub': 'arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:*'
    }
  ]
}];

class SimplifyDefaultExecRole {
  constructor(serverless) {
    this.hooks = {
      'before:package:finalize': function() {
        simplifyBaseIAMLogGroups(serverless);
      }
    };
  }
}

function simplifyBaseIAMLogGroups(serverless) {
  const resourceSection = serverless.service.provider.compiledCloudFormationTemplate.Resources;

  for (const key in resourceSection) {
    if (key === 'IamRoleLambdaExecution') {
      resourceSection[key].Properties.Policies[0].PolicyDocument.Statement=[...resourceSection[key].Properties.Policies[0].PolicyDocument.Statement.filter(s=>!s.Action.includes("logs:CreateLogStream")&&!s.Action.includes("logs:CreateLogGroup")&&!s.Action.includes("logs:PutLogEvents")),...policyStatements]
    }
  }
}

module.exports = SimplifyDefaultExecRole;
